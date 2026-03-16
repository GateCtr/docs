# Quickstart

Up and running in 5 min. No code changes required.

## 1. Get your API key

Sign up at [gatectr.com](https://gatectr.com) and grab your API key from the dashboard.

## 2. Install the SDK

{% tabs %}
{% tab title="Node.js" %}
```bash
npm install @gatectr/sdk
```
{% endtab %}

{% tab title="Python" %}
```bash
pip install gatectr-sdk
```
{% endtab %}

{% tab title="cURL" %}
No install needed.
{% endtab %}
{% endtabs %}

## 3. Make your first request

{% tabs %}
{% tab title="Node.js" %}
```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
});

console.log(response.choices[0].message.content);
```
{% endtab %}

{% tab title="Python" %}
```python
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)

print(response.choices[0].message.content)
```
{% endtab %}

{% tab title="cURL" %}
```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'
```
{% endtab %}
{% endtabs %}

That's it. GateCtr is now optimizing, routing, and tracking every request.

## What just happened

- Context Optimizer compressed your prompt before sending it to the LLM
- Budget Firewall checked your project limits
- Analytics logged the token usage and cost in your dashboard

## Next steps

- [Set up a Budget Firewall](../features/budget-firewall.md)
- [Enable the Context Optimizer](../features/context-optimizer.md)
- [Configure Webhooks](../features/webhooks.md)
