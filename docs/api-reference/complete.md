---
id: complete
title: POST /v1/complete
description: API reference for the GateCtr /v1/complete endpoint — send chat completion requests through the LLM gateway with optimization, routing, and budget enforcement.
keywords: [API reference, complete endpoint, chat completion, LLM API, OpenAI compatible]
sidebar_label: POST /v1/complete
---

# POST /v1/complete

Send a completion request through GateCtr.

## Endpoint

```
POST https://api.gatectr.com/v1/complete
```

## Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <your-api-key>` | Yes |
| `Content-Type` | `application/json` | Yes |
| `X-GateCtr-Version` | API version (e.g. `2025-01-01`) | No |

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
  "top_p": 1.0,
  "frequency_penalty": 0.0,
  "presence_penalty": 0.0,
  "stop": null,
  "stream": false,
  "gatectr": {
    "optimize": true,
    "route": false,
    "budget_id": "proj_123"
  }
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
| `top_p` | `number` | No | `1.0` | Nucleus sampling probability mass (0–1) |
| `frequency_penalty` | `number` | No | `0.0` | Penalize new tokens based on frequency (-2 to 2) |
| `presence_penalty` | `number` | No | `0.0` | Penalize new tokens based on presence (-2 to 2) |
| `stop` | `string \| array` | No | `null` | Sequences where generation will stop |
| `stream` | `boolean` | No | `false` | Enable streaming via server-sent events |
| `gatectr.optimize` | `boolean` | No | `true` | Enable Context Optimizer (Pro+) |
| `gatectr.route` | `boolean` | No | `false` | Enable Model Router (Pro+) |
| `gatectr.budget_id` | `string` | No | — | Override the active project budget |

## Response

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 9,
    "total_tokens": 21
  },
  "gatectr": {
    "optimized": true,
    "original_tokens": 20,
    "tokens_saved": 8,
    "compression_ratio": 0.40,
    "model_used": "gpt-4o",
    "model_requested": "gpt-4o",
    "routing_reason": null,
    "cost_usd": 0.00021
  }
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique completion ID |
| `object` | `string` | Always `"chat.completion"` |
| `created` | `number` | Unix timestamp of the request |
| `model` | `string` | Model that generated the response |
| `choices[].index` | `number` | Choice index (always `0` currently) |
| `choices[].message.role` | `string` | Always `"assistant"` |
| `choices[].message.content` | `string` | The completion text |
| `choices[].finish_reason` | `string` | `"stop"`, `"length"`, or `"content_filter"` |
| `usage.prompt_tokens` | `number` | Tokens in the request (after optimization) |
| `usage.completion_tokens` | `number` | Tokens in the completion |
| `usage.total_tokens` | `number` | Sum of prompt and completion tokens |
| `gatectr.optimized` | `boolean` | Whether Context Optimizer ran |
| `gatectr.original_tokens` | `number` | Token count before optimization |
| `gatectr.tokens_saved` | `number` | Tokens removed by Context Optimizer |
| `gatectr.compression_ratio` | `number` | Fraction of tokens saved (0–1) |
| `gatectr.model_used` | `string` | Model that actually handled the request |
| `gatectr.model_requested` | `string` | Model you specified in the request |
| `gatectr.routing_reason` | `string \| null` | Why the Model Router chose this model |
| `gatectr.cost_usd` | `number` | Estimated cost of this request in USD |

## Streaming

When `stream: true`, GateCtr returns server-sent events (SSE). Each chunk has the same shape as a non-streaming response but with `choices[].delta` instead of `choices[].message`:

```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":"stop"}],"gatectr":{"tokens_saved":8,"cost_usd":0.00021}}

data: [DONE]
```

The `gatectr` metadata is included in the final chunk before `[DONE]`.

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
    "request_id": "req_xyz789",
    "project_id": "proj_123",
    "limit": 100000,
    "used": 100012
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
    "gatectr": { "optimize": true }
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

console.log(response.choices[0].message.content);
```

### Python

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    gatectr={"optimize": True},
)

print(response.choices[0].message.content)
```
