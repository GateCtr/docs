---
id: quickstart
title: Quickstart
description: Get up and running with GateCtr in 5 minutes. Install the SDK, get an API key, and make your first LLM request through the gateway.
keywords: [quickstart, getting started, install SDK, API key, first request]
sidebar_label: Quickstart
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart

Up and running in 5 min. No code changes required.

## 1. Get your API key

Sign up at [gatectr.com](https://gatectr.com) and grab your API key from the [dashboard](https://app.gatectr.com).

Your key will look like `gct_live_xxxxxxxxxxxx`. Store it in an environment variable — never commit it to source control.

```bash
export GATECTR_API_KEY="gct_live_xxxxxxxxxxxx"
```

## 2. Install the SDK

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```bash
npm install @gatectr/sdk
```

  </TabItem>
  <TabItem value="python" label="Python">

```bash
pip install gatectr-sdk
# or
uv add gatectr-sdk
```

  </TabItem>
  <TabItem value="curl" label="cURL">

No install needed.

  </TabItem>
</Tabs>

## 3. Make your first request

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
});

console.log(response.choices[0].text);
// → "Hello! How can I help you today?"

// GateCtr metadata on every response
console.log(response.gatectr.tokensSaved);  // tokens saved by optimizer
console.log(response.gatectr.modelUsed);    // model that handled the request
console.log(response.gatectr.latencyMs);    // end-to-end latency
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = await client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)

print(response.choices[0].text)
# → "Hello! How can I help you today?"

# GateCtr metadata on every response
print(response.gatectr.tokens_saved)  # tokens saved by optimizer
print(response.gatectr.model_used)    # model that handled the request
print(response.gatectr.latency_ms)    # end-to-end latency
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'
```

  </TabItem>
</Tabs>

That's it. GateCtr is now optimizing, routing, and tracking every request.

## 4. Drop in for OpenAI (optional)

Already using the OpenAI SDK? Point it at GateCtr — no other changes:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GATECTR_API_KEY,
  baseURL: 'https://api.gatectr.com/v1',
});

// All existing calls work unchanged
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
)

# All existing calls work unchanged
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
```

  </TabItem>
</Tabs>

## What just happened

- **Context Optimizer** compressed your prompt before sending it to the LLM
- **Budget Firewall** checked your project limits
- **Analytics** logged the token usage and cost in your dashboard

View the full usage breakdown at [app.gatectr.com](https://app.gatectr.com).

## Next steps

- [Set up a Budget Firewall](../features/budget-firewall.md) — prevent runaway costs
- [Enable the Context Optimizer](../features/context-optimizer.md) — save up to 40% on tokens
- [Use the Model Router](../features/model-router.md) — automatically pick the cheapest model
- [Configure Webhooks](../features/webhooks.md) — get Slack alerts on budget events
