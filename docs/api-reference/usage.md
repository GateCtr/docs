---
id: usage
title: GET /v1/usage
description: Query token usage, costs, and analytics data for your GateCtr projects via the /v1/usage API endpoint.
keywords: [usage API, token usage, cost analytics, billing, API reference]
sidebar_label: GET /v1/usage
---

# GET /v1/usage

Query token usage and cost data for a project.

## Endpoint

```
GET https://api.gatectr.com/v1/usage
```

## Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <your-api-key>` | Yes |

## Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | `string` | No | Filter by project ID (e.g. `proj_123`) |
| `from` | `string` | No | Start date in ISO 8601 format (e.g. `2025-01-01`) |
| `to` | `string` | No | End date in ISO 8601 format (e.g. `2025-01-31`) |
| `group_by` | `string` | No | Aggregate results by: `model` \| `day` \| `project` |
| `model` | `string` | No | Filter by specific model (e.g. `gpt-4o`) |
| `limit` | `number` | No | Maximum number of records to return (default: `100`, max: `1000`) |
| `offset` | `number` | No | Pagination offset (default: `0`) |

## Example requests

### All projects, last month

```bash
curl "https://api.gatectr.com/v1/usage?from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

### Single project, grouped by model

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "project_id=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-31" \
  --data-urlencode "group_by=model"
```

### Single project, grouped by day

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "project_id=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-07" \
  --data-urlencode "group_by=day"
```

## Response

### Default response (no `group_by`)

```json
{
  "total_tokens": 4820000,
  "total_cost_usd": 14.23,
  "tokens_saved": 1920000,
  "requests": 12400,
  "prompt_tokens": 3100000,
  "completion_tokens": 1720000,
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  }
}
```

### Response grouped by model (`group_by=model`)

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

### Response grouped by day (`group_by=day`)

```json
{
  "total_tokens": 980000,
  "total_cost_usd": 2.89,
  "tokens_saved": 392000,
  "requests": 2480,
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-07"
  },
  "by_day": {
    "2025-01-01": { "tokens": 140000, "cost_usd": 0.41, "requests": 354 },
    "2025-01-02": { "tokens": 152000, "cost_usd": 0.45, "requests": 385 },
    "2025-01-03": { "tokens": 138000, "cost_usd": 0.40, "requests": 349 }
  }
}
```

### Response grouped by project (`group_by=project`)

```json
{
  "total_tokens": 4820000,
  "total_cost_usd": 14.23,
  "by_project": {
    "proj_123": { "tokens": 2900000, "cost_usd": 8.55, "requests": 7400 },
    "proj_456": { "tokens": 1920000, "cost_usd": 5.68, "requests": 5000 }
  }
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `total_tokens` | `number` | Total tokens used in the period |
| `total_cost_usd` | `number` | Total estimated cost in USD |
| `tokens_saved` | `number` | Tokens removed by Context Optimizer |
| `requests` | `number` | Total number of requests |
| `prompt_tokens` | `number` | Prompt tokens across all requests |
| `completion_tokens` | `number` | Completion tokens across all requests |
| `period.from` | `string` | Start of the queried period |
| `period.to` | `string` | End of the queried period |
| `by_model` | `object` | Breakdown per model (when `group_by=model`) |
| `by_day` | `object` | Breakdown per day (when `group_by=day`) |
| `by_project` | `object` | Breakdown per project (when `group_by=project`) |

## SDK examples

### Node.js

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
console.log(`Tokens saved: ${usage.tokens_saved}`);
```

### Python

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

## Error responses

| Status | Type | Description |
|--------|------|-------------|
| `400` | `bad_request` | Invalid date range (e.g. `from` is after `to`) or unknown `group_by` value |
| `401` | `unauthorized` | Invalid or missing API key |
| `403` | `forbidden` | API key does not have access to the requested project |
