---
id: webhooks
title: Webhooks
description: GateCtr pushes real-time events to any HTTPS endpoint — billing changes, budget alerts, request outcomes, and more. Learn how to register, verify, and handle webhooks.
keywords: [webhooks, real-time events, budget alerts, billing events, HMAC signature, BullMQ, webhook delivery]
sidebar_label: Webhooks
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Webhooks

Receive real-time notifications at any HTTPS endpoint when events happen in your GateCtr account — plan changes, budget alerts, request outcomes, and more.

## How it works

1. Register an endpoint URL in the dashboard or via API
2. GateCtr generates a signing secret (`whsec_…`) automatically
3. When an event fires, GateCtr enqueues a delivery job (BullMQ / Redis)
4. The worker POSTs the event payload to your URL, signed with HMAC-SHA256
5. Failed deliveries are retried automatically (up to 6 attempts)

---

## Supported events

### Billing

| Event | When it fires |
|-------|---------------|
| `billing.plan_upgraded` | User moves to a higher-tier plan |
| `billing.plan_downgraded` | User moves to a lower-tier plan |
| `billing.payment_failed` | Stripe invoice payment fails |
| `billing.trial_started` | Subscription enters trial period |
| `billing.trial_ending` | Trial is about to expire |
| `billing.subscription_cancellation_scheduled` | Cancellation scheduled at period end |

### Budget

| Event | When it fires |
|-------|---------------|
| `budget.threshold_reached` | Spending crosses a configured threshold |
| `budget.exceeded` | Hard budget cap reached — requests blocked |
| `budget.reset` | Budget period resets (daily/monthly cron) |

### Requests

| Event | When it fires |
|-------|---------------|
| `request.completed` | LLM request processed successfully |
| `request.failed` | Request failed (provider error or validation) |
| `request.routed` | Request routed to a specific provider |

### Provider

| Event | When it fires |
|-------|---------------|
| `provider.fallback` | Primary provider failed, fallback triggered |
| `provider.error` | Provider returned a non-recoverable error |

### API Keys

| Event | When it fires |
|-------|---------------|
| `api_key.created` | New API key created |
| `api_key.revoked` | API key manually revoked |
| `api_key.expired` | API key reached its expiry date |

### Projects

| Event | When it fires |
|-------|---------------|
| `project.created` | New project created |

### Team

| Event | When it fires |
|-------|---------------|
| `team.member.added` | Member joined the team |
| `team.member.removed` | Member removed from the team |

### Usage

| Event | When it fires |
|-------|---------------|
| `usage.daily` | Daily usage report generated (midnight cron) |

### Webhook meta

| Event | When it fires |
|-------|---------------|
| `webhook.test` | Manual test delivery triggered |
| `webhook.failed` | Webhook auto-disabled after repeated failures |

---

## Register a webhook

### Via the dashboard

Go to **Settings → Webhooks → Add endpoint** in the [GateCtr dashboard](https://app.gatectr.com). Enter a name, an HTTPS URL, and select the events to subscribe to.

GateCtr generates and displays the signing secret (`whsec_…`) on creation — copy it immediately, it is not shown again.

### Via API

```bash
curl -X POST https://api.gatectr.com/v1/webhooks \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My production endpoint",
    "url": "https://your-app.com/webhooks/gatectr",
    "events": ["billing.plan_upgraded", "budget.threshold_reached", "request.failed"]
  }'
```

**Response** — the `secret` field is returned only on creation:

```json
{
  "id": "clx...",
  "name": "My production endpoint",
  "url": "https://your-app.com/webhooks/gatectr",
  "secret": "whsec_a3f9...",
  "events": ["billing.plan_upgraded", "budget.threshold_reached", "request.failed"],
  "isActive": true,
  "successCount": 0,
  "failCount": 0,
  "lastFiredAt": null,
  "createdAt": "2026-03-26T10:00:00.000Z"
}
```

:::caution
The URL **must use HTTPS**. HTTP endpoints are rejected with `url_must_be_https`.
:::

:::tip Wildcard subscription
Pass `"events": ["*"]` to receive every event type on a single endpoint.
:::

---

## Payload format

Every delivery is an HTTP POST with `Content-Type: application/json` and the following body structure:

```json
{
  "event": "billing.plan_upgraded",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "previous_plan": "PRO",
    "new_plan": "TEAM",
    "subscription_id": "sub_stripe_xyz"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `event` | `string` | Event type (e.g. `billing.plan_upgraded`) |
| `project_id` | `string` | Your GateCtr user ID |
| `timestamp` | `string` | ISO 8601 UTC timestamp |
| `data` | `object` | Event-specific payload |

### Example payloads

<Tabs>
  <TabItem value="billing-upgrade" label="billing.plan_upgraded" default>

```json
{
  "event": "billing.plan_upgraded",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "previous_plan": "FREE",
    "new_plan": "PRO",
    "subscription_id": "sub_1ABC..."
  }
}
```

  </TabItem>
  <TabItem value="billing-failed" label="billing.payment_failed">

```json
{
  "event": "billing.payment_failed",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "plan": "PRO",
    "invoice_id": "in_1ABC...",
    "amount_due": 2900,
    "currency": "usd"
  }
}
```

  </TabItem>
  <TabItem value="budget-threshold" label="budget.threshold_reached">

```json
{
  "event": "budget.threshold_reached",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "threshold_percent": 80,
    "used_usd": 8.05,
    "limit_usd": 10.00,
    "period": "monthly"
  }
}
```

  </TabItem>
  <TabItem value="webhook-test" label="webhook.test">

```json
{
  "event": "webhook.test",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "message": "Test delivery from GateCtr"
  }
}
```

  </TabItem>
</Tabs>

---

## Request headers

Each delivery includes three custom headers:

| Header | Example | Description |
|--------|---------|-------------|
| `X-GateCtr-Signature` | `hmac-sha256=3d4f…` | HMAC-SHA256 of the raw request body |
| `X-GateCtr-Event` | `billing.plan_upgraded` | Event type |
| `X-GateCtr-Delivery` | `550e8400-e29b-…` | Unique delivery UUID |

---

## Verify the signature

Always verify `X-GateCtr-Signature` before processing an event. The signature is `hmac-sha256=<hex>` computed over the **raw request body** using your `whsec_…` secret.

<Tabs>
  <TabItem value="nodejs" label="Node.js (Next.js)" default>

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const sigHeader = req.headers.get('X-GateCtr-Signature') ?? '';

  const expected =
    'hmac-sha256=' +
    createHmac('sha256', process.env.GATECTR_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

  const isValid = timingSafeEqual(
    Buffer.from(sigHeader),
    Buffer.from(expected),
  );

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.event) {
    case 'billing.plan_upgraded':
      console.log(`Plan upgraded to ${event.data.new_plan}`);
      break;
    case 'budget.threshold_reached':
      console.log(`Budget at ${event.data.threshold_percent}%`);
      break;
    case 'billing.payment_failed':
      // Alert your team
      break;
  }

  return Response.json({ ok: true });
}
```

  </TabItem>
  <TabItem value="python" label="Python (FastAPI)">

```python
import hmac
import hashlib
import os
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.post("/webhooks/gatectr")
async def handle_webhook(request: Request):
    body = await request.body()
    sig_header = request.headers.get("X-GateCtr-Signature", "")
    secret = os.environ["GATECTR_WEBHOOK_SECRET"].encode()

    expected = "hmac-sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(sig_header, expected):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event = json.loads(body)

    if event["event"] == "billing.plan_upgraded":
        print(f"Plan upgraded to {event['data']['new_plan']}")
    elif event["event"] == "budget.threshold_reached":
        print(f"Budget at {event['data']['threshold_percent']}%")

    return {"ok": True}
```

  </TabItem>
  <TabItem value="express" label="Node.js (Express)">

```typescript
import express from 'express';
import { createHmac, timingSafeEqual } from 'crypto';

const app = express();

app.post(
  '/webhooks/gatectr',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const body = req.body.toString();
    const sigHeader = req.headers['x-gatectr-signature'] ?? '';

    const expected =
      'hmac-sha256=' +
      createHmac('sha256', process.env.GATECTR_WEBHOOK_SECRET!)
        .update(body)
        .digest('hex');

    try {
      if (!timingSafeEqual(Buffer.from(sigHeader as string), Buffer.from(expected))) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body);
    // Handle event.event …

    res.json({ ok: true });
  },
);
```

  </TabItem>
</Tabs>

:::danger Always use timing-safe comparison
Use `timingSafeEqual` (Node.js) or `hmac.compare_digest` (Python) to prevent timing attacks. Never use `===` to compare signatures.
:::

---

## Retry policy

The delivery worker retries failed deliveries automatically:

| Attempt | Delay | Triggered by |
|---------|-------|--------------|
| 1 (initial) | — | Always |
| 2 | 1 s | 5xx or network error |
| 3 | 2 s | 5xx or network error |
| 4 | 4 s | 5xx or network error |
| 5 | 8 s | 5xx or network error |
| 6 | 16 s | 5xx or network error |

**Special cases:**
- **4xx (except 429)** — Delivery fails immediately, no retry
- **429 Too Many Requests** — Respects the `Retry-After` response header
- **Connection timeout** — 10-second limit per attempt, then retry

**Auto-disable:** If an endpoint accumulates more than **10 consecutive failures**, it is automatically deactivated. Re-enable it from **Settings → Webhooks** once the issue is resolved.

---

## Delivery logs

Each delivery attempt is recorded. Retrieve the last 50 for a given webhook:

```bash
curl https://api.gatectr.com/v1/webhooks/{id}/deliveries \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

```json
{
  "deliveries": [
    {
      "id": "clx...",
      "deliveryId": "550e8400-...",
      "event": "billing.plan_upgraded",
      "status": 200,
      "success": true,
      "responseMs": 142,
      "retryCount": 0,
      "error": null,
      "createdAt": "2026-03-26T10:00:00.000Z"
    }
  ]
}
```

---

## Send a test delivery

Trigger an immediate test event to verify your endpoint is reachable:

```bash
curl -X POST https://api.gatectr.com/v1/webhooks/{id}/test \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

```json
{ "queued": true }
```

The test payload uses the `webhook.test` event type.

---

## Manage webhooks

### Update an endpoint

```bash
curl -X PATCH https://api.gatectr.com/v1/webhooks/{id} \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "isActive": false }'
```

Updatable fields: `name`, `url`, `events`, `isActive`.

### Delete an endpoint

```bash
curl -X DELETE https://api.gatectr.com/v1/webhooks/{id} \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

Returns `204 No Content` on success.

---

## Available on

Pro plan and above. The number of webhook endpoints you can create depends on your plan quota.
