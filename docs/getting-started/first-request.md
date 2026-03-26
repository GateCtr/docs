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
  → Your app                          (OpenAI-compatible response + gatectr field)
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
    optimize: true,        // compress the prompt
    route: false,          // use the exact model specified
    budget_id: 'proj_123', // check against this project's budget
  },
});

console.log(response.choices[0].message.content);
console.log(response.gatectr);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Summarize the history of the internet."},
    ],
    temperature=0.7,
    max_tokens=512,
    gatectr={
        "optimize": True,
        "route": False,
        "budget_id": "proj_123",
    },
)

print(response.choices[0].message.content)
print(response.gatectr)
```

  </TabItem>
</Tabs>

## Response shape

GateCtr returns an OpenAI-compatible response with an extra `gatectr` field:

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "The internet began..." },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 8,
    "total_tokens": 20
  },
  "gatectr": {
    "optimized": true,
    "original_tokens": 30,
    "tokens_saved": 18,
    "compression_ratio": 0.40,
    "model_used": "gpt-4o",
    "model_requested": "gpt-4o",
    "routing_reason": null,
    "cost_usd": 0.00024
  }
}
```

## The `gatectr` field

| Field | Type | Description |
|-------|------|-------------|
| `optimized` | `boolean` | Whether the Context Optimizer ran on this request |
| `original_tokens` | `number` | Token count of the original (uncompressed) prompt |
| `tokens_saved` | `number` | Tokens removed by the Context Optimizer |
| `compression_ratio` | `number` | Fraction of tokens saved (e.g. `0.40` = 40%) |
| `model_used` | `string` | Actual model used to generate the response |
| `model_requested` | `string` | Model you specified in the request |
| `routing_reason` | `string \| null` | Why Model Router chose this model (null if routing disabled) |
| `cost_usd` | `number` | Estimated cost of this request in USD |

## Streaming

Enable streaming for real-time output:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const stream = await client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Write me a poem.' }],
});

for await (const chunk of stream) {
  process.stdout.write(chunk.delta ?? '');
}
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
for chunk in client.stream(
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

## More examples

The [GateCtr examples repository](https://github.com/GateCtr/examples) contains ready-to-run code for common use cases:

- Basic completions (Node.js, Python, cURL)
- Streaming responses
- Budget-controlled applications
- Multi-model routing
- RAG pipelines with context optimization
- Webhook handlers (Next.js, Express, FastAPI)
