---
id: complete
title: POST /v1/complete
description: API reference for the GateCtr /v1/complete endpoint — send text completion requests through the LLM gateway with optimization, routing, and budget enforcement.
keywords: [API reference, complete endpoint, text completion, LLM API, OpenAI compatible]
sidebar_label: POST /v1/complete
---

# POST /v1/complete

Send a text completion request through GateCtr.

## Endpoint

```
POST https://api.gatectr.com/v1/complete
```

## Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <your-api-key>` | Yes |
| `Content-Type` | `application/json` | Yes |

## Request body

```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": false,
  "optimize": true,
  "route": false,
  "budgetId": "proj_123"
}
```

### Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `model` | `string` | Yes | — | Model name or `"auto"` for Model Router |
| `messages` | `array` | Yes | — | OpenAI-compatible messages array |
| `messages[].role` | `string` | Yes | — | `"system"`, `"user"`, or `"assistant"` |
| `messages[].content` | `string` | Yes | — | Message content |
| `temperature` | `number` | No | `1.0` | Sampling temperature (0–2). Higher = more random |
| `max_tokens` | `number` | No | model default | Maximum completion tokens to generate |
| `stream` | `boolean` | No | `false` | Enable streaming via server-sent events |
| `optimize` | `boolean` | No | `true` | Enable Context Optimizer (Pro+) |
| `route` | `boolean` | No | `false` | Enable Model Router (Pro+) |
| `budgetId` | `string` | No | — | Override the active project budget |

## Response

```json
{
  "id": "cmpl-abc123",
  "object": "text_completion",
  "model": "gpt-4o",
  "choices": [
    {
      "text": "Hello! How can I help you?",
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 9,
    "total_tokens": 21,
    "saved_tokens": 8
  },
  "gatectr": {
    "requestId": "req_abc123",
    "latencyMs": 342,
    "overage": false,
    "modelUsed": "gpt-4o",
    "tokensSaved": 8
  }
}
```

### Response headers

GateCtr sets these headers on every response:

| Header | Description |
|--------|-------------|
| `X-GateCtr-Request-Id` | Unique request ID — use for support tickets |
| `X-GateCtr-Latency-Ms` | End-to-end latency measured by GateCtr |
| `X-GateCtr-Overage` | `"true"` if this request exceeded your budget cap |

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique completion ID |
| `object` | `string` | Always `"text_completion"` |
| `model` | `string` | Model that generated the response |
| `choices[].text` | `string` | The completion text |
| `choices[].finish_reason` | `string` | `"stop"`, `"length"`, or `"content_filter"` |
| `usage.prompt_tokens` | `number` | Tokens in the request (after optimization) |
| `usage.completion_tokens` | `number` | Tokens in the completion |
| `usage.total_tokens` | `number` | Sum of prompt and completion tokens |
| `usage.saved_tokens` | `number` | Tokens saved by Context Optimizer |
| `gatectr.requestId` | `string` | Unique request ID (mirrors `X-GateCtr-Request-Id` header) |
| `gatectr.latencyMs` | `number` | End-to-end latency in milliseconds |
| `gatectr.overage` | `boolean` | `true` if this request exceeded your budget cap |
| `gatectr.modelUsed` | `string` | Actual model that served the request |
| `gatectr.tokensSaved` | `number` | Tokens saved by Context Optimizer |

## Streaming

When `stream: true`, GateCtr returns server-sent events (SSE). Each chunk yields a `StreamChunk`:

```
data: {"id":"cmpl-abc123","delta":"Hello","finishReason":null}

data: {"id":"cmpl-abc123","delta":"!","finishReason":"stop"}

data: [DONE]
```

## Rate limit headers

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Requests allowed per minute |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

## Error responses

| Status | Type | Description |
|--------|------|-------------|
| `400` | `bad_request` | Malformed JSON or missing required fields |
| `401` | `unauthorized` | Invalid or missing API key |
| `422` | `validation_error` | Invalid parameter values |
| `429` | `budget_exceeded` | Project budget limit reached |
| `429` | `rate_limit_exceeded` | Too many requests — back off and retry |
| `502` | `provider_error` | LLM provider returned an error |
| `503` | `service_unavailable` | GateCtr is temporarily unavailable |

### Error response body

```json
{
  "error": {
    "type": "budget_exceeded",
    "message": "Request blocked. Budget limit reached.",
    "request_id": "req_xyz789"
  }
}
```

## Example requests

### cURL

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "What is the capital of France?" }
    ],
    "optimize": true
  }'
```

### Node.js

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'What is the capital of France?' }],
  gatectr: { optimize: true },
});

console.log(response.choices[0].text);
```

### Python

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = await client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
)

print(response.choices[0].text)
```
