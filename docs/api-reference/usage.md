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
| `from` | `string` | No | Start date in `YYYY-MM-DD` format (e.g. `2025-01-01`) |
| `to` | `string` | No | End date in `YYYY-MM-DD` format (e.g. `2025-01-31`) |
| `projectId` | `string` | No | Filter by project ID (e.g. `proj_123`) |

## Example requests

### All projects, last month

```bash
curl "https://api.gatectr.com/v1/usage?from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

### Single project, date range

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "projectId=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-31"
```

## Response

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

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `totalTokens` | `number` | Total tokens used in the period |
| `totalRequests` | `number` | Total number of requests |
| `totalCostUsd` | `number` | Total estimated cost in USD |
| `savedTokens` | `number` | Tokens removed by Context Optimizer |
| `from` | `string` | Start of the queried period |
| `to` | `string` | End of the queried period |
| `byProject` | `array` | Per-project usage breakdown |
| `byProject[].projectId` | `string \| null` | Project ID |
| `byProject[].totalTokens` | `number` | Tokens used by this project |
| `byProject[].totalRequests` | `number` | Requests from this project |
| `byProject[].totalCostUsd` | `number` | Cost from this project |

## SDK examples

### Node.js

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const usage = await client.usage({
  projectId: 'proj_123',
  from: '2025-01-01',
  to: '2025-01-31',
});

console.log(`Total cost: $${usage.totalCostUsd}`);
console.log(`Tokens saved: ${usage.savedTokens}`);
console.log(`By project:`, usage.byProject);
```

### Python

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
print(f"By project: {usage.by_project}")
```

## Error responses

| Status | Type | Description |
|--------|------|-------------|
| `400` | `bad_request` | Invalid date range (e.g. `from` is after `to`) |
| `401` | `unauthorized` | Invalid or missing API key |
| `403` | `forbidden` | API key does not have access to the requested project |
