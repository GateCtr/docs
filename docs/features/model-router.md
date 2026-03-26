---
id: model-router
title: Model Router
description: GateCtr's Model Router automatically selects the best and cheapest LLM for each request based on task complexity, quality requirements, and pricing.
keywords: [model router, LLM selection, auto model, cost optimization, smart routing]
sidebar_label: Model Router
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Model Router

GateCtr picks the right LLM for each request. You pay less.

## How it works

When routing is enabled, GateCtr scores each request against a set of criteria and selects the optimal model:

- **Task complexity** — simple Q&A vs. multi-step reasoning
- **Output requirements** — length, format, and quality expectations
- **Current model pricing** — real-time cost per token across providers
- **Your configured provider preferences** — allow/block specific models or providers
- **Latency requirements** — balance speed vs. quality based on your settings

Simple requests go to cheaper models. Complex ones go to the best model for the job.

## Enable

### Option 1: Set `model: "auto"`

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'auto',   // triggers the Model Router
  messages: [{ role: 'user', content: 'What is 2 + 2?' }],
});

console.log(response.gatectr.model_used);      // e.g. "gpt-3.5-turbo"
console.log(response.gatectr.routing_reason);  // e.g. "low_complexity"
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="auto",   # triggers the Model Router
    messages=[{"role": "user", "content": "What is 2 + 2?"}],
)

print(response.gatectr["model_used"])      # e.g. "gpt-3.5-turbo"
print(response.gatectr["routing_reason"])  # e.g. "low_complexity"
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{ "role": "user", "content": "What is 2 + 2?" }]
  }'
```

  </TabItem>
</Tabs>

### Option 2: Enable `route: true`

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({
  model: 'gpt-4o',        // your preference, Router may override
  messages,
  gatectr: { route: true },
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
response = client.complete(
    model="gpt-4o",       # your preference, Router may override
    messages=messages,
    gatectr={"route": True},
)
```

  </TabItem>
</Tabs>

### Option 3: Enable globally

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  route: true,   // applied to all requests
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    route=True,   # applied to all requests
)
```

  </TabItem>
</Tabs>

## Routing logic

| Request type | Typical model selection |
|--------------|------------------------|
| Simple Q&A, short tasks | `gpt-3.5-turbo`, `mistral-small` |
| Summarization, classification | `gpt-4o-mini`, `claude-3-haiku` |
| Complex reasoning, analysis | `gpt-4o`, `claude-3-5-sonnet` |
| Code generation, debugging | `gpt-4o`, `claude-3-5-sonnet` |
| Long-form writing | `gpt-4o`, `mistral-large` |

The router evaluates the request dynamically — the same message at different times may route differently based on current pricing.

## Configure provider preferences

In the dashboard: **Settings → Model Router**

You can:

- **Allow list** — restrict routing to specific providers (e.g. OpenAI only)
- **Block list** — exclude specific models from consideration
- **Cost threshold** — never route to a model above a given price per 1M tokens
- **Latency mode** — prefer faster models even if slightly more expensive

## Response fields

The `gatectr` field includes routing metadata:

```json
{
  "gatectr": {
    "model_used": "gpt-3.5-turbo",
    "model_requested": "auto",
    "routing_reason": "low_complexity",
    "cost_usd": 0.00008
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `model_used` | `string` | The model that actually handled the request |
| `model_requested` | `string` | The model you specified (`"auto"` or a specific model) |
| `routing_reason` | `string` | Why the Router chose this model |
| `cost_usd` | `number` | Estimated cost in USD |

### Routing reason values

| Value | Description |
|-------|-------------|
| `low_complexity` | Simple request, cheaper model selected |
| `high_complexity` | Complex reasoning required, premium model selected |
| `provider_preference` | Your allow/block configuration influenced the choice |
| `cost_threshold` | Routing stayed under your configured cost limit |
| `latency_mode` | Faster model selected based on latency preference |

## Combine with Context Optimizer

Model Router and Context Optimizer work together:

```typescript
const response = await client.complete({
  model: 'auto',
  messages,
  gatectr: {
    route: true,     // let Router pick the model
    optimize: true,  // compress the prompt
  },
});

// Both savings stack
console.log(response.gatectr.tokens_saved);  // optimizer savings
console.log(response.gatectr.model_used);    // router selection
console.log(response.gatectr.cost_usd);      // total optimized cost
```

## Available on

Pro plan and above.
