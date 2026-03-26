---
id: authentication
title: Authentication
description: Learn how to authenticate with the GateCtr API using API keys. Get your key, use it as a Bearer token, and keep it secure.
keywords: [authentication, API key, Bearer token, security, GateCtr]
sidebar_label: Authentication
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Authentication

All API requests require a GateCtr API key.

## Get your API key

1. Sign in at [gatectr.com](https://gatectr.com)
2. Go to **Settings → API Keys**
3. Click **Create key**
4. Copy and store it securely — it won't be shown again

## Use your API key

Pass it as a Bearer token in the `Authorization` header:

```
Authorization: Bearer gct_live_xxxxxxxxxxxx
```

Or via the SDK:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

  </TabItem>
</Tabs>

## Key format

| Prefix | Environment |
|--------|-------------|
| `gct_live_` | Production |
| `gct_test_` | Test (no real LLM calls) |

## Security

- Never commit API keys to source control
- Use environment variables: `GATECTR_API_KEY`
- Rotate keys in **Settings → API Keys** if compromised
- Your underlying LLM provider keys are AES-encrypted at rest — GateCtr never exposes them
