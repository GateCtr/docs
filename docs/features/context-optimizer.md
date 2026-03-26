---
id: context-optimizer
title: Context Optimizer
description: GateCtr's Context Optimizer automatically compresses LLM prompts by up to 40% — reducing token costs while preserving output quality.
keywords: [context optimizer, prompt compression, token reduction, LLM cost savings, prompt optimization]
sidebar_label: Context Optimizer
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Context Optimizer

Compresses your prompts. -40% tokens. Same output quality.

## How it works

Before forwarding your request to the LLM, GateCtr analyzes and compresses the prompt:

- Removes redundant whitespace and filler phrases
- Condenses verbose instructions without changing intent
- Trims conversation history to the most relevant turns
- Deduplicates repeated context across messages
- Preserves all semantic meaning and code blocks

Average reduction: **-40% tokens**. Output quality is maintained.

## Enable

Context Optimizer is enabled by default on Pro plans and above.

To control it per request:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages,
  gatectr: { optimize: true },
});

console.log(`Tokens saved: ${response.gatectr.tokensSaved}`);
console.log(`Model used: ${response.gatectr.modelUsed}`);
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
    messages=messages,
    gatectr=PerRequestOptions(optimize=True),
)

print(f"Tokens saved: {response.gatectr.tokens_saved}")
print(f"Model used: {response.gatectr.model_used}")
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Summarize the following text..." }
    ],
    "optimize": true
  }'
```

  </TabItem>
</Tabs>

## Enable globally

Enable optimization for all requests by default when initializing the client:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  optimize: true,   // applied to all requests (this is the default)
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    optimize=True,   # applied to all requests (this is the default)
)
```

  </TabItem>
</Tabs>

## Response metadata

Every GateCtr response includes a `gatectr` field with metadata about the request:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({ model: 'gpt-4o', messages });

console.log(response.gatectr.tokensSaved);  // tokens removed by optimizer
console.log(response.gatectr.modelUsed);    // model that handled the request
console.log(response.gatectr.latencyMs);    // end-to-end latency
console.log(response.gatectr.overage);      // true if budget cap was exceeded
console.log(response.gatectr.requestId);    // unique ID for this request
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
response = await client.complete(model="gpt-4o", messages=messages)

print(response.gatectr.tokens_saved)  # tokens removed by optimizer
print(response.gatectr.model_used)    # model that handled the request
print(response.gatectr.latency_ms)    # end-to-end latency
print(response.gatectr.overage)       # True if budget cap was exceeded
print(response.gatectr.request_id)    # unique ID for this request
```

  </TabItem>
</Tabs>

### `GateCtrMetadata` fields

| Field (Node.js) | Field (Python) | Type | Description |
|-----------------|----------------|------|-------------|
| `requestId` | `request_id` | `string` | Unique request ID — use for support tickets |
| `latencyMs` | `latency_ms` | `number` | End-to-end latency measured by GateCtr |
| `overage` | `overage` | `boolean` | Whether this request exceeded your budget cap |
| `modelUsed` | `model_used` | `string` | Actual model that handled the request |
| `tokensSaved` | `tokens_saved` | `number` | Tokens removed by Context Optimizer (0 if disabled) |

## Disable for a specific request

```typescript
const response = await client.complete({
  model: 'gpt-4o',
  messages,
  gatectr: { optimize: false },
});
```

Disable optimization for requests where prompt precision is critical:

- Structured output (JSON mode, function calling)
- Code generation requiring exact formatting
- Requests with carefully tuned few-shot examples
- Requests where you've already minimized the prompt yourself

## Real-world savings example

A typical RAG (retrieval-augmented generation) application with:
- System prompt: 500 tokens
- Retrieved context: 2000 tokens
- Conversation history: 800 tokens
- User query: 50 tokens

**Before optimization:** 3,350 tokens → **After:** ~2,010 tokens → **Savings: ~$0.04 per request**

At 10,000 requests/day, that's **~$400/day** in savings.

## Available on

Pro plan and above.
