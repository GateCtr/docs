---
id: first-request
title: Your First Request
description: Understand the GateCtr request lifecycle — from your app through budget checking, prompt optimization, model routing, and back with full analytics.
keywords: [request lifecycle, OpenAI compatible, response format, supported models, GateCtr]
sidebar_label: Your first request
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Your First Request

A closer look at what GateCtr does with each request.

## Request lifecycle

```
Your app
  → GateCtr API (https://api.gatectr.com/v1/complete)
    → 1. Budget Firewall check        (blocks if limit exceeded → 429)
    → 2. Context Optimizer            (compresses prompt → fewer tokens)
    → 3. Model Router                 (selects best model if route: true)
    → 4. LLM provider                 (OpenAI, Anthropic, Mistral, Gemini…)
    → 5. Response + analytics logged  (tokens, cost, latency stored)
  → Your app                          (response + GateCtr headers)
```

Steps 2 and 3 are optional but enabled by default on Pro plans. If budget is exceeded at step 1, no LLM call is made and no cost is incurred.

## A complete request

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Summarize the history of the internet.' },
  ],
  temperature: 0.7,
  max_tokens: 512,
  gatectr: {
    optimize: true,          // compress the prompt
    route: false,            // use the exact model specified
    budgetId: 'proj_123',   // check against this project's budget
  },
});

console.log(response.choices[0].text);
console.log(response.gatectr);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr
from gatectr.types import PerRequestOptions

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = await client.complete(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Summarize the history of the internet."},
    ],
    temperature=0.7,
    max_tokens=512,
    gatectr=PerRequestOptions(
        optimize=True,
        route=False,
        budget_id="proj_123",
    ),
)

print(response.choices[0].text)
print(response.gatectr)
```

  </TabItem>
</Tabs>

## Response shape

GateCtr's `/v1/complete` endpoint returns a text completion response. The SDK also exposes `response.gatectr` assembled from response headers and the usage object:

```json
{
  "id": "cmpl-abc123",
  "object": "text_completion",
  "model": "gpt-4o",
  "choices": [
    {
      "text": "The internet began...",
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 8,
    "total_tokens": 20,
    "saved_tokens": 18
  }
}
```

## The `gatectr` metadata field

When using the GateCtr SDK, every response exposes a `gatectr` field with metadata assembled from response headers:

| Field (Node.js) | Field (Python) | Type | Description |
|-----------------|----------------|------|-------------|
| `requestId` | `request_id` | `string` | Unique request ID — use for support tickets |
| `latencyMs` | `latency_ms` | `number` | End-to-end latency measured by GateCtr |
| `overage` | `overage` | `boolean` | Whether this request exceeded your budget cap |
| `modelUsed` | `model_used` | `string` | Actual model used to generate the response |
| `tokensSaved` | `tokens_saved` | `number` | Tokens removed by the Context Optimizer |

## Streaming

Enable streaming for real-time output:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
for await (const chunk of client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Write me a poem.' }],
})) {
  process.stdout.write(chunk.delta ?? '');
}
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
async for chunk in client.stream(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write me a poem."}],
):
    print(chunk.delta or "", end="", flush=True)
```

  </TabItem>
</Tabs>

## Supported models

GateCtr is compatible with any OpenAI-compatible model. Tested providers:

| Provider | Models |
|----------|--------|
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo` |
| **Anthropic** | `claude-3-5-sonnet`, `claude-3-opus`, `claude-3-haiku` |
| **Mistral** | `mistral-large`, `mistral-medium`, `mistral-small` |
| **Google Gemini** | `gemini-1.5-pro`, `gemini-1.5-flash` |
| **Meta Llama** | `llama-3.1-70b`, `llama-3.1-8b` (via compatible providers) |

Use `model: "auto"` to let the [Model Router](../features/model-router.md) pick the optimal model automatically.

## List available models

Use `client.models()` to fetch the current list of supported models:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const { models } = await client.models();
models.forEach(m => console.log(m.modelId, m.provider));
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
result = await client.models()
for m in result.models:
    print(m.model_id, m.provider)
```

  </TabItem>
</Tabs>

## More examples

The [GateCtr examples repository](https://github.com/GateCtr/examples) contains ready-to-run code for common use cases:

- Basic completions (Node.js, Python, cURL)
- Streaming responses
- Budget-controlled applications
- Multi-model routing
- RAG pipelines with context optimization
- Webhook handlers (Next.js, Express, FastAPI)
