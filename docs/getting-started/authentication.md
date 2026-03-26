---
id: authentication
title: Authentication
description: Learn how to authenticate with the GateCtr API using API keys. Get your key, use it as a Bearer token, rotate it, and keep it secure.
keywords: [authentication, API key, Bearer token, security, GateCtr, rotate key]
sidebar_label: Authentication
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Authentication

All API requests require a GateCtr API key.

## Get your API key

1. Sign in at [gatectr.com](https://gatectr.com)
2. Go to **Settings → API Keys** in the [dashboard](https://app.gatectr.com)
3. Click **Create key**
4. Give it a name (e.g. `production`, `staging`)
5. Copy and store it securely — it won't be shown again

## Use your API key

Pass it as a Bearer token in the `Authorization` header:

```
Authorization: Bearer gct_live_xxxxxxxxxxxx
```

Or via the SDK:

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "model": "gpt-4o", "messages": [...] }'
```

  </TabItem>
</Tabs>

## Key format

| Prefix | Environment | Use case |
|--------|-------------|----------|
| `gct_live_` | Production | Real LLM calls, real costs |
| `gct_test_` | Test | No real LLM calls — returns mock responses |

Use test keys in your CI/CD pipelines and development environments to avoid incurring costs.

## Create keys per environment

It's best practice to create separate keys for each environment:

- `GATECTR_API_KEY_PROD` — production key with full budget controls
- `GATECTR_API_KEY_STAGING` — staging key with a low token cap
- `GATECTR_API_KEY_DEV` — test-mode key for local development (no real costs)

## Rotate a key

If a key is compromised:

1. Go to **Settings → API Keys** in the [dashboard](https://app.gatectr.com)
2. Find the compromised key and click **Revoke**
3. Create a new key immediately
4. Update your environment variables

Revoked keys are rejected within seconds.

## Security best practices

- **Never commit API keys** to source control — use `.gitignore` and `.env` files
- **Use environment variables**: store as `GATECTR_API_KEY`
- **Rotate keys regularly**, especially after team member offboarding
- **Scope keys by project** — use different keys for different applications
- **Your LLM provider keys** are AES-256 encrypted at rest — GateCtr never exposes them to clients

```bash
# Store securely in .env (not committed to git)
GATECTR_API_KEY=gct_live_xxxxxxxxxxxx
```

```typescript
// Reference in Node.js code
import { GateCtr } from '@gatectr/sdk';
const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });
```

```python
# Reference in Python code
import os
from gatectr import GateCtr
client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

## What happens on auth failure

If your key is invalid or missing, GateCtr returns:

**HTTP 401 Unauthorized**

```json
{
  "error": {
    "type": "unauthorized",
    "message": "Invalid or missing API key.",
    "request_id": "req_xyz789"
  }
}
```
