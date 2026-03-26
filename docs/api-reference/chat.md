---
id: chat
title: POST /v1/chat
description: GateCtr's /v1/chat endpoint for chat completions, and /v1/chat/completions as a drop-in alias fully compatible with the OpenAI SDK.
keywords: [chat completions, OpenAI compatible, drop-in replacement, API reference]
sidebar_label: POST /v1/chat
---

# POST /v1/chat

Chat completion endpoint. Returns responses in the `choices[].message` format.

## Endpoints

| Path | Description |
|------|-------------|
| `POST https://api.gatectr.com/v1/chat` | Native GateCtr chat endpoint (used by `client.chat()` and `client.stream()`) |
| `POST https://api.gatectr.com/v1/chat/completions` | OpenAI-compatible alias for existing OpenAI SDK integrations |

## Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <your-api-key>` | Yes |
| `Content-Type` | `application/json` | Yes |

## Request body

Same parameters as [POST /v1/complete](complete.md): `model`, `messages`, `temperature`, `max_tokens`, `stream`, `optimize`, `route`, `budgetId`.

## Response

```json
{
  "id": "chat-abc123",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [
    {
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
    "total_tokens": 21,
    "saved_tokens": 8
  }
}
```

### Response headers

Same as [POST /v1/complete](complete.md): `X-GateCtr-Request-Id`, `X-GateCtr-Latency-Ms`, `X-GateCtr-Overage`.

## Using the OpenAI-compatible alias

Use `/v1/chat/completions` when pointing an existing OpenAI SDK integration at GateCtr without changing any code:

### Node.js

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GATECTR_API_KEY,
  baseURL: 'https://api.gatectr.com/v1',
});

// This hits /v1/chat/completions — no changes needed
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
});

console.log(response.choices[0].message.content);
```

### Python

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
)

# This hits /v1/chat/completions — no changes needed
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)

print(response.choices[0].message.content)
```

### LangChain

```python
import os
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
    model="gpt-4o",
)
```

GateCtr injects optimization, routing, and budget enforcement transparently.

## Using the native GateCtr SDK

When using the GateCtr SDK directly:

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

// client.chat() → POST /v1/chat (non-streaming)
const response = await client.chat({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
});

console.log(response.choices[0].message.content);

// client.stream() → POST /v1/chat with stream: true
for await (const chunk of client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
})) {
  process.stdout.write(chunk.delta ?? '');
}
```

## Rate limit headers

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Requests allowed per minute |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

## Error responses

Same error codes as [POST /v1/complete](complete.md):

| Status | Type | Description |
|--------|------|-------------|
| `400` | `bad_request` | Malformed JSON or missing required fields |
| `401` | `unauthorized` | Invalid or missing API key |
| `422` | `validation_error` | Invalid parameter values |
| `429` | `budget_exceeded` | Project budget limit reached |
| `429` | `rate_limit_exceeded` | Too many requests — back off and retry |
| `502` | `provider_error` | LLM provider returned an error |
| `503` | `service_unavailable` | GateCtr is temporarily unavailable |
