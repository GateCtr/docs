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

Sign up at [gatectr.com](https://gatectr.com) and grab your API key from the dashboard.

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

console.log(response.choices[0].message.content);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)

print(response.choices[0].message.content)
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

## What just happened

- Context Optimizer compressed your prompt before sending it to the LLM
- Budget Firewall checked your project limits
- Analytics logged the token usage and cost in your dashboard

## Next steps

- [Set up a Budget Firewall](../features/budget-firewall.md)
- [Enable the Context Optimizer](../features/context-optimizer.md)
- [Configure Webhooks](../features/webhooks.md)
