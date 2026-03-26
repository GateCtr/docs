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
| `tokens_in` | `number` | Prompt tokens sent to the LLM |
| `tokens_out` | `number` | Completion tokens received |
| `tokens_saved` | `number` | Tokens removed by Context Optimizer |
| `original_tokens` | `number` | Token count before optimization |
| `cost_usd` | `number` | Estimated cost of the request in USD |
| `model` | `string` | Model that handled the request |
| `model_requested` | `string` | Model you specified in the request |
| `latency_ms` | `number` | End-to-end latency in milliseconds |
| `project_id` | `string` | Project the request belongs to |
| `timestamp` | `string` | UTC timestamp (ISO 8601) |
| `optimized` | `boolean` | Whether Context Optimizer ran |
| `routed` | `boolean` | Whether Model Router selected the model |

## Dashboard

View your usage at [app.gatectr.com](https://app.gatectr.com):

- **Overview** — total tokens, total cost, requests/day across all projects
- **By project** — cost and token breakdown per project
- **By model** — cost per model to see your most expensive workloads
- **Trends** — 7d / 30d / 90d charts with cost trajectory
- **Optimization savings** — tokens and cost saved by the Context Optimizer

## Query via API

<Tabs>
  <TabItem value="curl" label="cURL" default>

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "project_id=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-31" \
  --data-urlencode "group_by=model"
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
  groupBy: 'model',
});

console.log(`Total cost: $${usage.total_cost_usd}`);
console.log(`Tokens saved by optimizer: ${usage.tokens_saved}`);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

usage = client.usage(
    project_id="proj_123",
    from_date="2025-01-01",
    to_date="2025-01-31",
    group_by="model",
)

print(f"Total cost: ${usage['total_cost_usd']}")
print(f"Tokens saved: {usage['tokens_saved']}")
```

  </TabItem>
</Tabs>

### Response

```json
{
  "total_tokens": 4820000,
  "total_cost_usd": 14.23,
  "tokens_saved": 1920000,
  "requests": 12400,
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  },
  "by_model": {
    "gpt-4o": {
      "tokens": 2100000,
      "cost_usd": 10.50,
      "requests": 5200,
      "tokens_saved": 840000
    },
    "gpt-3.5-turbo": {
      "tokens": 2720000,
      "cost_usd": 3.73,
      "requests": 7200,
      "tokens_saved": 1080000
    }
  }
}
```

See the full [GET /v1/usage reference](../api-reference/usage.md) for all parameters and grouping options.

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
  groupBy: 'day',
});

if (daily.total_cost_usd > 5) {
  // Send a Slack alert, email, etc.
  console.warn(`High spend detected: $${daily.total_cost_usd} today`);
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
