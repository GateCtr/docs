# Authentication

All API requests require a GateCtr API key.

## Get your API key

1. Sign in at [gatectr.com](https://gatectr.com)
2. Go to **Settings → API Keys**
3. Click **Create key**
4. Copy and store it securely — it won't be shown again

## Use your API key

Pass it as a Bearer token in the `Authorization` header:

```bash
Authorization: Bearer gct_live_xxxxxxxxxxxx
```

Or via the SDK:

{% tabs %}
{% tab title="Node.js" %}
```typescript
const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });
```
{% endtab %}

{% tab title="Python" %}
```python
client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```
{% endtab %}
{% endtabs %}

## Key format

| Prefix | Environment |
|---|---|
| `gct_live_` | Production |
| `gct_test_` | Test (no real LLM calls) |

## Security

- Never commit API keys to source control
- Use environment variables: `GATECTR_API_KEY`
- Rotate keys in **Settings → API Keys** if compromised
- Your underlying LLM provider keys are AES-encrypted at rest — GateCtr never exposes them
