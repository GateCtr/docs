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

Un regard plus approfondi sur ce que GateCtr fait avec chaque requête.

## Cycle de vie d'une requête

```
Votre application
  → API GateCtr (https://api.gatectr.com/v1/complete)
    → 1. Vérification du Pare-feu Budgétaire   (bloque si limite dépassée → 429)
    → 2. Optimiseur de Contexte                 (compresse le prompt → moins de tokens)
    → 3. Routeur de Modèles                     (sélectionne le meilleur modèle si route: true)
    → 4. Fournisseur LLM                        (OpenAI, Anthropic, Mistral, Gemini…)
    → 5. Réponse + analytiques enregistrées     (tokens, coût, latence stockés)
  → Votre application                           (réponse compatible OpenAI + champ gatectr)
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
    { role: 'user', content: 'Résumez l\'histoire d\'internet.' },
  ],
  temperature: 0.7,
  max_tokens: 512,
  gatectr: {
    optimize: true,        // compresser le prompt
    route: false,          // utiliser le modèle exact spécifié
    budget_id: 'proj_123', // vérifier contre le budget de ce projet
  },
});

console.log(response.choices[0].message.content);
console.log(response.gatectr);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Vous êtes un assistant utile."},
        {"role": "user", "content": "Résumez l'histoire d'internet."},
    ],
    temperature=0.7,
    max_tokens=512,
    gatectr={
        "optimize": True,
        "route": False,
        "budget_id": "proj_123",
    },
)

print(response.choices[0].message.content)
print(response.gatectr)
```

  </TabItem>
</Tabs>

## Format de la réponse

GateCtr retourne une réponse compatible OpenAI avec un champ `gatectr` supplémentaire :

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "L'internet a commencé..." },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 8,
    "total_tokens": 20
  },
  "gatectr": {
    "optimized": true,
    "original_tokens": 30,
    "tokens_saved": 18,
    "compression_ratio": 0.40,
    "model_used": "gpt-4o",
    "model_requested": "gpt-4o",
    "routing_reason": null,
    "cost_usd": 0.00024
  }
}
```

## Le champ `gatectr`

| Champ | Type | Description |
|-------|------|-------------|
| `optimized` | `boolean` | Si l'Optimiseur de Contexte s'est exécuté sur cette requête |
| `original_tokens` | `number` | Nombre de tokens du prompt original (non compressé) |
| `tokens_saved` | `number` | Tokens supprimés par l'Optimiseur de Contexte |
| `compression_ratio` | `number` | Part des tokens économisés (ex. `0.40` = 40%) |
| `model_used` | `string` | Modèle réellement utilisé pour générer la réponse |
| `model_requested` | `string` | Modèle spécifié dans la requête |
| `routing_reason` | `string \| null` | Raison du choix du Routeur de Modèles (null si désactivé) |
| `cost_usd` | `number` | Coût estimé de cette requête en USD |

## Streaming

Activez le streaming pour une sortie en temps réel :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const stream = await client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Écris-moi un poème.' }],
});

for await (const chunk of stream) {
  process.stdout.write(chunk.delta ?? '');
}
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
for chunk in client.stream(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Écris-moi un poème."}],
):
    print(chunk.delta or "", end="", flush=True)
```

  </TabItem>
</Tabs>

## Modèles supportés

GateCtr est compatible avec n'importe quel modèle compatible OpenAI. Fournisseurs testés :

| Fournisseur | Modèles |
|-------------|---------|
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo` |
| **Anthropic** | `claude-3-5-sonnet`, `claude-3-opus`, `claude-3-haiku` |
| **Mistral** | `mistral-large`, `mistral-medium`, `mistral-small` |
| **Google Gemini** | `gemini-1.5-pro`, `gemini-1.5-flash` |
| **Meta Llama** | `llama-3.1-70b`, `llama-3.1-8b` (via fournisseurs compatibles) |

Utilisez `model: "auto"` pour laisser le [Routeur de Modèles](../features/model-router.md) choisir automatiquement le modèle optimal.

## Plus d'exemples

Le [dépôt d'exemples GateCtr](https://github.com/GateCtr/examples) contient du code prêt à l'emploi pour les cas d'utilisation courants :

- Completions basiques (Node.js, Python, cURL)
- Réponses en streaming
- Applications avec contrôle budgétaire
- Routage multi-modèles
- Pipelines RAG avec optimisation de contexte
- Gestionnaires de webhooks (Next.js, Express, FastAPI)
