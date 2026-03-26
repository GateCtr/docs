---
id: analytics
title: Analytics
description: GateCtr tracks every token, cost, model, and latency in real time. Query usage data via API or explore it in the dashboard.
keywords: [analytics, token usage, cost tracking, LLM observability, usage dashboard]
sidebar_label: Analytics
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Analytics

Every token. Every cost. Real-time.

## What's tracked

Every request through GateCtr is logged automatically:

| Metric | Type | Description |
|--------|------|-------------|
| `prompt_tokens` | `number` | Prompt tokens sent to the LLM |
| `completion_tokens` | `number` | Completion tokens received |
| `saved_tokens` | `number` | Tokens removed by Context Optimizer |
| `model` | `string` | Model that handled the request |
| `latency_ms` | `number` | End-to-end latency in milliseconds |
| `project_id` | `string` | Project the request belongs to |
| `timestamp` | `string` | UTC timestamp (ISO 8601) |
| `overage` | `boolean` | Whether this request exceeded your budget cap |

## Dashboard

View your usage at [app.gatectr.com](https://app.gatectr.com):

- **Overview** — total tokens, total cost, requests/day across all projects
- **By project** — cost and token breakdown per project
- **Trends** — 7d / 30d / 90d charts with cost trajectory
- **Optimization savings** — tokens and cost saved by the Context Optimizer

## Query via API

<Tabs>
  <TabItem value="curl" label="cURL" default>

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "projectId=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-31"
```

  </TabItem>
  <TabItem value="nodejs" label="Node.js">

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const usage = await client.usage({
  projectId: 'proj_123',
  from: '2025-01-01',
  to: '2025-01-31',
});

console.log(`Total cost: $${usage.totalCostUsd}`);
console.log(`Tokens saved by optimizer: ${usage.savedTokens}`);
console.log(`Total requests: ${usage.totalRequests}`);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr
from gatectr.types import UsageParams

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

usage = await client.usage(UsageParams(
    project_id="proj_123",
    from_="2025-01-01",
    to="2025-01-31",
))

print(f"Total cost: ${usage.total_cost_usd}")
print(f"Tokens saved: {usage.saved_tokens}")
print(f"Total requests: {usage.total_requests}")
```

  </TabItem>
</Tabs>

### Response

```json
{
  "totalTokens": 4820000,
  "totalRequests": 12400,
  "totalCostUsd": 14.23,
  "savedTokens": 1920000,
  "from": "2025-01-01",
  "to": "2025-01-31",
  "byProject": [
    {
      "projectId": "proj_123",
      "totalTokens": 2900000,
      "totalRequests": 7400,
      "totalCostUsd": 8.55
    },
    {
      "projectId": "proj_456",
      "totalTokens": 1920000,
      "totalRequests": 5000,
      "totalCostUsd": 5.68
    }
  ]
}
```

See the full [GET /v1/usage reference](../api-reference/usage.md) for all parameters.

## Access analytics in your app

You can pull usage data programmatically to build internal cost dashboards, trigger alerts, or generate reports:

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

// Daily cost report
const daily = await client.usage({
  projectId: 'proj_123',
  from: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
});

if (daily.totalCostUsd > 5) {
  // Send a Slack alert, email, etc.
  console.warn(`High spend detected: $${daily.totalCostUsd} today`);
}
```

## Export

Export usage data as CSV from the dashboard: **Analytics → Export**.

Available on Team plan and above.

## Retention

| Plan | Retention |
|------|-----------|
| Free | 7 days |
| Pro | 30 days |
| Team | 90 days |
| Enterprise | Custom (up to unlimited) |
