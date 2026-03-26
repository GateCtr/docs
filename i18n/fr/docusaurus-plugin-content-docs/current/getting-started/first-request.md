---
id: first-request
title: Votre première requête
description: Comprenez le cycle de vie d'une requête GateCtr — de votre application à travers la vérification du budget, l'optimisation du prompt, le routage de modèle, et le retour avec des analytiques complètes.
keywords: [cycle de vie des requêtes, compatible OpenAI, format de réponse, modèles supportés, GateCtr]
sidebar_label: Votre première requête
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Votre première requête

Un regard plus attentif sur ce que GateCtr fait de chaque requête.

## Cycle de vie d'une requête

```
Votre application
  → API GateCtr (https://api.gatectr.com/v1/complete)
    → 1. Vérification Pare-feu Budgétaire   (bloque si limite dépassée → 429)
    → 2. Optimiseur de Contexte             (compresse le prompt → moins de tokens)
    → 3. Routeur de Modèles                 (sélectionne le meilleur modèle si route: true)
    → 4. Fournisseur LLM                    (OpenAI, Anthropic, Mistral, Gemini…)
    → 5. Réponse + analytiques enregistrées (tokens, coût, latence stockés)
  → Votre application                       (réponse + en-têtes GateCtr)
```

Les étapes 2 et 3 sont optionnelles mais activées par défaut sur les forfaits Pro. Si le budget est dépassé à l'étape 1, aucun appel LLM n'est effectué et aucun coût n'est engagé.

## Une requête complète

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'Vous êtes un assistant utile.' },
    { role: 'user', content: "Résumez l'histoire d'Internet." },
  ],
  temperature: 0.7,
  max_tokens: 512,
  gatectr: {
    optimize: true,          // compresser le prompt
    route: false,            // utiliser exactement le modèle spécifié
    budgetId: 'proj_123',   // vérifier contre le budget de ce projet
  },
});

console.log(response.choices[0].text);
console.log(response.gatectr);
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
    messages=[
        {"role": "system", "content": "Vous êtes un assistant utile."},
        {"role": "user", "content": "Résumez l'histoire d'Internet."},
    ],
    temperature=0.7,
    max_tokens=512,
    gatectr=PerRequestOptions(
        optimize=True,
        route=False,
        budget_id="proj_123",
    ),
)

print(response.choices[0].text)
print(response.gatectr)
```

  </TabItem>
</Tabs>

## Format de la réponse

L'endpoint `/v1/complete` de GateCtr retourne une réponse de completion de texte. Le SDK expose également `response.gatectr` assemblé depuis les en-têtes de réponse et l'objet usage :

```json
{
  "id": "cmpl-abc123",
  "object": "text_completion",
  "model": "gpt-4o",
  "choices": [
    {
      "text": "Internet a commencé...",
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 8,
    "total_tokens": 20,
    "saved_tokens": 18
  }
}
```

## Le champ de métadonnées `gatectr`

Lors de l'utilisation du SDK GateCtr, chaque réponse expose un champ `gatectr` avec des métadonnées assemblées depuis les en-têtes de réponse :

| Champ (Node.js) | Champ (Python) | Type | Description |
|-----------------|----------------|------|-------------|
| `requestId` | `request_id` | `string` | ID unique de la requête — pour les tickets de support |
| `latencyMs` | `latency_ms` | `number` | Latence bout-en-bout mesurée par GateCtr |
| `overage` | `overage` | `boolean` | Si la requête a dépassé votre plafond budgétaire |
| `modelUsed` | `model_used` | `string` | Modèle réel utilisé pour générer la réponse |
| `tokensSaved` | `tokens_saved` | `number` | Tokens supprimés par l'Optimiseur de Contexte |

## Streaming

Activez le streaming pour une sortie en temps réel :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
for await (const chunk of client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Écris-moi un poème.' }],
})) {
  process.stdout.write(chunk.delta ?? '');
}
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
async for chunk in client.stream(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Écris-moi un poème."}],
):
    print(chunk.delta or "", end="", flush=True)
```

  </TabItem>
</Tabs>

## Modèles supportés

GateCtr est compatible avec tout modèle compatible OpenAI. Fournisseurs testés :

| Fournisseur | Modèles |
|-------------|---------|
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo` |
| **Anthropic** | `claude-3-5-sonnet`, `claude-3-opus`, `claude-3-haiku` |
| **Mistral** | `mistral-large`, `mistral-medium`, `mistral-small` |
| **Google Gemini** | `gemini-1.5-pro`, `gemini-1.5-flash` |
| **Meta Llama** | `llama-3.1-70b`, `llama-3.1-8b` (via fournisseurs compatibles) |

Utilisez `model: "auto"` pour laisser le [Routeur de Modèles](../features/model-router.md) choisir automatiquement le modèle optimal.

## Lister les modèles disponibles

Utilisez `client.models()` pour récupérer la liste actuelle des modèles supportés :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const { models } = await client.models();
models.forEach(m => console.log(m.modelId, m.provider));
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
result = await client.models()
for m in result.models:
    print(m.model_id, m.provider)
```

  </TabItem>
</Tabs>

## Plus d'exemples

Le [dépôt d'exemples GateCtr](https://github.com/GateCtr/examples) contient du code prêt à l'emploi pour les cas d'usage courants :

- Completions basiques (Node.js, Python, cURL)
- Réponses en streaming
- Applications avec contrôle budgétaire
- Routage multi-modèles
- Pipelines RAG avec optimisation de contexte
- Gestionnaires de webhooks (Next.js, Express, FastAPI)
