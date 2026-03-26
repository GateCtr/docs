---
id: webhooks
title: Webhooks
description: GateCtr can push real-time events to any URL — budget alerts, Slack messages, and more. Learn how to configure and verify webhooks.
keywords: [webhooks, budget alerts, Slack integration, event notifications, webhook signature]
sidebar_label: Webhooks
---

# Webhooks

Push events to Slack, Teams, or any URL.

## Supported events

| Event | Description |
|-------|-------------|
| `budget.threshold_reached` | Budget soft alert triggered |
| `budget.limit_exceeded` | Budget hard cap hit |
| `request.completed` | Request successfully processed |
| `request.failed` | Request failed |

## Configure a webhook

In the dashboard: **Settings → Webhooks → Add endpoint**

Or via API:

```bash
curl -X POST https://api.gatectr.com/v1/webhooks \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -d '{
    "url": "https://your-app.com/webhooks/gatectr",
    "events": ["budget.threshold_reached", "budget.limit_exceeded"]
  }'
```

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
    "period": "day"
  }
}
```

## Verify webhook signature

Every request includes a `X-GateCtr-Signature` header. Verify it:

```typescript
import { verifyWebhook } from '@gatectr/sdk';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('X-GateCtr-Signature') ?? '';

  const event = verifyWebhook(body, signature, process.env.GATECTR_WEBHOOK_SECRET);

  if (event.type === 'budget.threshold_reached') {
    // handle event
  }

  return Response.json({ ok: true });
}
```

## Slack integration

Point the webhook URL to a Slack Incoming Webhook:

```
https://hooks.slack.com/services/xxx/yyy/zzz
```

GateCtr sends a formatted Slack message automatically for budget events.

## Retries

Failed deliveries (non-2xx response) are retried up to 3 times with exponential backoff: 1s, 5s, 30s.

## Available on

Pro plan and above.
