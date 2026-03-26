---
id: budget-firewall
title: Budget Firewall
description: Set hard token and cost caps per project with GateCtr's Budget Firewall. Block requests the moment a limit is hit — no surprise invoices.
keywords: [budget firewall, cost control, token limit, LLM cost cap, budget alerts, webhooks]
sidebar_label: Budget Firewall
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Budget Firewall

Hard caps per project. No surprise invoices.

## How it works

Every request passes through the Budget Firewall before reaching the LLM. If the project budget is exceeded, the request is blocked and a `429` is returned immediately. No tokens are consumed. No cost is incurred.

```
Request → Budget Firewall check
  ├─ Under limit → forward to LLM → response
  └─ Over limit  → 429 Budget Exceeded (no LLM call made)
```

## Set a budget

### Via the dashboard

Go to **Projects → Your project → Budget** in the [GateCtr dashboard](https://app.gatectr.com).

### Via API

```bash
curl -X PATCH https://api.gatectr.com/v1/budget \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "limit_tokens": 100000,
    "period": "day"
  }'
```

### Via SDK

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

await client.budget.set({
  projectId: 'proj_123',
  limitTokens: 100000,
  period: 'day',
  alertAtPercent: 80,
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

client.budget.set(
    project_id="proj_123",
    limit_tokens=100000,
    period="day",
    alert_at_percent=80,
)
```

  </TabItem>
</Tabs>

## Budget types

| Type | Field | Description |
|------|-------|-------------|
| Token cap | `limit_tokens` | Cap on total tokens (prompt + completion) |
| Cost cap | `limit_cost_usd` | Cap on estimated USD cost |

You can set both — whichever is hit first triggers the block.

```json
{
  "project_id": "proj_123",
  "limit_tokens": 500000,
  "limit_cost_usd": 10.00,
  "period": "month"
}
```

## Periods

| Period | Description | Resets |
|--------|-------------|--------|
| `day` | Daily cap | Midnight UTC |
| `month` | Monthly cap | 1st of the month, midnight UTC |
| `total` | Lifetime cap | Never — must be manually reset |

## Soft alerts

Set a threshold to receive a webhook before the hard cap is hit:

```json
{
  "project_id": "proj_123",
  "limit_tokens": 100000,
  "period": "day",
  "alert_at_percent": 80
}
```

At 80% usage (80,000 tokens), GateCtr fires a `budget.threshold_reached` webhook event. The hard block still happens at 100%.

See [Webhooks](./webhooks.md) to configure where alerts are delivered.

## Override budget per request

Use `gatectr.budget_id` to apply a different budget to a specific request:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({
  model: 'gpt-4o',
  messages,
  gatectr: {
    budget_id: 'proj_456',   // use a different project's budget
  },
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
response = client.complete(
    model="gpt-4o",
    messages=messages,
    gatectr={"budget_id": "proj_456"},
)
```

  </TabItem>
</Tabs>

## Blocked request response

When a request is blocked by the Budget Firewall, GateCtr returns:

**HTTP status:** `429 Too Many Requests`

```json
{
  "error": {
    "type": "budget_exceeded",
    "message": "Request blocked. Budget limit reached.",
    "request_id": "req_xyz789",
    "project_id": "proj_123",
    "limit": 100000,
    "used": 100012,
    "period": "day",
    "resets_at": "2025-01-02T00:00:00Z"
  }
}
```

### Handle it in code

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { BudgetExceededError } from '@gatectr/sdk';

try {
  const response = await client.complete({ model: 'gpt-4o', messages });
} catch (err) {
  if (err instanceof BudgetExceededError) {
    console.warn(`Budget exceeded. Resets at: ${err.resetsAt}`);
    // Notify team, queue request for later, etc.
  }
}
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
from gatectr.exceptions import BudgetExceededError

try:
    response = client.complete(model="gpt-4o", messages=messages)
except BudgetExceededError as e:
    print(f"Budget exceeded. Resets at: {e.resets_at}")
    # Notify team, queue request for later, etc.
```

  </TabItem>
</Tabs>

## Check current usage

```bash
curl "https://api.gatectr.com/v1/usage?project_id=proj_123" \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

Response includes `total_tokens` and `total_cost_usd` so you can track how close you are to the limit.

## Available on

Free plan and above.
