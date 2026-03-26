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
- Preserves all semantic meaning and context

Average reduction: **-40% tokens**. Output quality is maintained.

## Enable

Context Optimizer is enabled by default on Pro plans and above.

To control it per request:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({
  model: 'gpt-4o',
  messages,
  gatectr: { optimize: true },
});

console.log(response.gatectr.tokens_saved); // e.g. 312
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
response = client.complete(
    model="gpt-4o",
    messages=messages,
    gatectr={"optimize": True},
)

print(response.gatectr["tokens_saved"])  # e.g. 312
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [...],
    "gatectr": { "optimize": true }
  }'
```

  </TabItem>
</Tabs>

## Response fields

```json
"gatectr": {
  "optimized": true,
  "original_tokens": 800,
  "tokens_saved": 320,
  "compression_ratio": 0.40
}
```

## Disable for a specific request

```typescript
gatectr: { optimize: false }
```

Useful for requests where prompt precision is critical (e.g. structured output, code generation with exact formatting).

## Available on

Pro plan and above.
