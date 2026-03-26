---
id: webhooks
title: Webhooks
description: GateCtr can push real-time events to any URL — budget alerts, Slack messages, and more. Learn how to configure, verify, and handle webhooks.
keywords: [webhooks, budget alerts, Slack integration, event notifications, webhook signature, HMAC]
sidebar_label: Webhooks
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Webhooks

Push events to Slack, Teams, or any URL in real time.

## Supported events

| Event | Description |
|-------|-------------|
| `budget.threshold_reached` | Budget soft alert triggered (e.g. at 80%) |
| `budget.limit_exceeded` | Budget hard cap hit — requests are now blocked |
| `request.completed` | Request successfully processed |
| `request.failed` | Request failed (provider error or validation error) |

## Configure a webhook

### Via the dashboard

Go to **Settings → Webhooks → Add endpoint** in the [GateCtr dashboard](https://app.gatectr.com).

### Via API

```bash
curl -X POST https://api.gatectr.com/v1/webhooks \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/gatectr",
    "events": ["budget.threshold_reached", "budget.limit_exceeded"],
    "secret": "your-signing-secret"
  }'
```

### Via SDK

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const webhook = await client.webhooks.create({
  url: 'https://your-app.com/webhooks/gatectr',
  events: ['budget.threshold_reached', 'budget.limit_exceeded'],
});

console.log(webhook.id);      // wh_abc123
console.log(webhook.secret);  // store this for signature verification
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

webhook = client.webhooks.create(
    url="https://your-app.com/webhooks/gatectr",
    events=["budget.threshold_reached", "budget.limit_exceeded"],
)

print(webhook["id"])      # wh_abc123
print(webhook["secret"])  # store this for signature verification
```

  </TabItem>
</Tabs>

## Payload format

```json
{
  "id": "evt_abc123",
  "type": "budget.threshold_reached",
  "timestamp": "2025-03-16T14:22:00Z",
  "data": {
    "project_id": "proj_123",
    "project_name": "My App",
    "limit_tokens": 100000,
    "used_tokens": 80012,
    "percent": 80,
    "period": "day",
    "resets_at": "2025-03-17T00:00:00Z"
  }
}
```

### `budget.limit_exceeded` payload

```json
{
  "id": "evt_def456",
  "type": "budget.limit_exceeded",
  "timestamp": "2025-03-16T16:05:00Z",
  "data": {
    "project_id": "proj_123",
    "project_name": "My App",
    "limit_tokens": 100000,
    "used_tokens": 100023,
    "period": "day",
    "resets_at": "2025-03-17T00:00:00Z"
  }
}
```

## Verify webhook signature

Every webhook request includes a `X-GateCtr-Signature` header containing an HMAC-SHA256 signature. Always verify it before processing the event.

<Tabs>
  <TabItem value="nodejs" label="Node.js (Next.js)" default>

```typescript
import { verifyWebhook } from '@gatectr/sdk';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('X-GateCtr-Signature') ?? '';

  let event;
  try {
    event = verifyWebhook(body, signature, process.env.GATECTR_WEBHOOK_SECRET!);
  } catch {
    return new Response('Invalid signature', { status: 401 });
  }

  switch (event.type) {
    case 'budget.threshold_reached':
      console.log(`Project ${event.data.project_id} is at ${event.data.percent}%`);
      // Notify team via Slack, email, etc.
      break;
    case 'budget.limit_exceeded':
      console.log(`Project ${event.data.project_id} budget exceeded — requests blocked`);
      break;
    case 'request.failed':
      // Log for observability
      break;
  }

  return Response.json({ ok: true });
}
```

  </TabItem>
  <TabItem value="python" label="Python (FastAPI)">

```python
import os
from fastapi import FastAPI, Request, HTTPException
from gatectr import verify_webhook

app = FastAPI()

@app.post("/webhooks/gatectr")
async def handle_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-GateCtr-Signature", "")

    try:
        event = verify_webhook(body, signature, os.environ["GATECTR_WEBHOOK_SECRET"])
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid signature")

    if event["type"] == "budget.threshold_reached":
        project_id = event["data"]["project_id"]
        percent = event["data"]["percent"]
        print(f"Project {project_id} is at {percent}% of budget")
        # Notify team

    elif event["type"] == "budget.limit_exceeded":
        project_id = event["data"]["project_id"]
        print(f"Project {project_id} budget exceeded — requests blocked")

    return {"ok": True}
```

  </TabItem>
  <TabItem value="express" label="Node.js (Express)">

```typescript
import express from 'express';
import { verifyWebhook } from '@gatectr/sdk';

const app = express();

app.post('/webhooks/gatectr', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-gatectr-signature'] ?? '';

  let event;
  try {
    event = verifyWebhook(req.body.toString(), signature, process.env.GATECTR_WEBHOOK_SECRET!);
  } catch {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  if (event.type === 'budget.threshold_reached') {
    // Handle alert
  }

  res.json({ ok: true });
});
```

  </TabItem>
</Tabs>

## Slack integration

Point the webhook URL to a Slack Incoming Webhook:

1. Create a [Slack Incoming Webhook](https://api.slack.com/messaging/webhooks) for your workspace
2. Add the Slack URL as a webhook endpoint in GateCtr
3. Subscribe to `budget.threshold_reached` and `budget.limit_exceeded`

GateCtr automatically formats budget events as readable Slack messages:

```
⚠️ GateCtr — Budget Alert
Project "My App" has reached 80% of its daily token budget.
Used: 80,012 / 100,000 tokens. Resets at midnight UTC.
```

## Retries

Failed deliveries (non-2xx response or connection timeout) are retried with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1st retry | 1 second |
| 2nd retry | 5 seconds |
| 3rd retry | 30 seconds |

After 3 failed retries, the event is marked as failed. You can replay failed events from the dashboard: **Settings → Webhooks → Failed events**.

## Available on

Pro plan and above.
