---
id: chat
title: POST /v1/chat/completions
description: GateCtr's /v1/chat/completions endpoint is a drop-in alias for /v1/complete, fully compatible with the OpenAI SDK — no code changes needed.
keywords: [chat completions, OpenAI compatible, drop-in replacement, API reference]
sidebar_label: POST /v1/chat
---

# POST /v1/chat/completions

Alias for `/v1/complete`. Identical behavior, provided for OpenAI SDK compatibility.

## Endpoint

```
POST https://api.gatectr.com/v1/chat/completions
```

## Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <your-api-key>` | Yes |
| `Content-Type` | `application/json` | Yes |

## Request body and response

Same request body and response shape as [POST /v1/complete](complete.md). All parameters (`model`, `messages`, `temperature`, `max_tokens`, `stream`, `gatectr.*`, etc.) are accepted identically.

## When to use

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
// The gatectr field is present in the response alongside standard OpenAI fields
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

GateCtr injects optimization, routing, and budget enforcement transparently. The `gatectr` field appears in the response alongside the standard OpenAI fields.

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
