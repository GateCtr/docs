---
id: complete
title: POST /v1/complete
description: Référence API pour l'endpoint GateCtr /v1/complete — envoyez des requêtes de completion via la passerelle LLM avec optimisation, routage et application du budget.
keywords: [référence API, endpoint complete, chat completion, API LLM, compatible OpenAI]
sidebar_label: POST /v1/complete
---

# POST /v1/complete

Envoyez une requête de completion via GateCtr.

## Endpoint

```
POST https://api.gatectr.com/v1/complete
```

## En-têtes

| En-tête | Valeur | Requis |
|---------|--------|--------|
| `Authorization` | `Bearer <votre-clé-api>` | Oui |
| `Content-Type` | `application/json` | Oui |
| `X-GateCtr-Version` | Version de l'API (ex. `2025-01-01`) | Non |

## Corps de la requête

```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "Vous êtes un assistant utile." },
    { "role": "user", "content": "Bonjour" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "top_p": 1.0,
  "frequency_penalty": 0.0,
  "presence_penalty": 0.0,
  "stop": null,
  "stream": false,
  "gatectr": {
    "optimize": true,
    "route": false,
    "budget_id": "proj_123"
  }
}
```

### Paramètres

| Champ | Type | Requis | Défaut | Description |
|-------|------|--------|--------|-------------|
| `model` | `string` | Oui | — | Nom du modèle ou `"auto"` pour le Routeur de Modèles |
| `messages` | `array` | Oui | — | Tableau de messages compatible OpenAI |
| `messages[].role` | `string` | Oui | — | `"system"`, `"user"` ou `"assistant"` |
| `messages[].content` | `string` | Oui | — | Contenu du message |
| `temperature` | `number` | Non | `1.0` | Température d'échantillonnage (0–2) |
| `max_tokens` | `number` | Non | défaut du modèle | Tokens de completion maximum à générer |
| `top_p` | `number` | Non | `1.0` | Masse de probabilité du nucleus sampling (0–1) |
| `frequency_penalty` | `number` | Non | `0.0` | Pénalité sur les nouveaux tokens selon leur fréquence (-2 à 2) |
| `presence_penalty` | `number` | Non | `0.0` | Pénalité sur les nouveaux tokens selon leur présence (-2 à 2) |
| `stop` | `string \| array` | Non | `null` | Séquences où la génération s'arrête |
| `stream` | `boolean` | Non | `false` | Activer le streaming via server-sent events |
| `gatectr.optimize` | `boolean` | Non | `true` | Activer l'Optimiseur de Contexte (Pro+) |
| `gatectr.route` | `boolean` | Non | `false` | Activer le Routeur de Modèles (Pro+) |
| `gatectr.budget_id` | `string` | Non | — | Remplacer le budget actif du projet |

## Réponse

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Bonjour ! Comment puis-je vous aider ?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 9,
    "total_tokens": 21
  },
  "gatectr": {
    "optimized": true,
    "original_tokens": 20,
    "tokens_saved": 8,
    "compression_ratio": 0.40,
    "model_used": "gpt-4o",
    "model_requested": "gpt-4o",
    "routing_reason": null,
    "cost_usd": 0.00021
  }
}
```

### Champs de la réponse

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `string` | Identifiant unique de la completion |
| `object` | `string` | Toujours `"chat.completion"` |
| `created` | `number` | Horodatage Unix de la requête |
| `model` | `string` | Modèle ayant généré la réponse |
| `choices[].index` | `number` | Index du choix (toujours `0` actuellement) |
| `choices[].message.role` | `string` | Toujours `"assistant"` |
| `choices[].message.content` | `string` | Texte de la completion |
| `choices[].finish_reason` | `string` | `"stop"`, `"length"` ou `"content_filter"` |
| `usage.prompt_tokens` | `number` | Tokens dans la requête (après optimisation) |
| `usage.completion_tokens` | `number` | Tokens dans la completion |
| `usage.total_tokens` | `number` | Somme des tokens de prompt et de completion |
| `gatectr.optimized` | `boolean` | Si l'Optimiseur de Contexte s'est exécuté |
| `gatectr.original_tokens` | `number` | Nombre de tokens avant optimisation |
| `gatectr.tokens_saved` | `number` | Tokens supprimés par l'Optimiseur de Contexte |
| `gatectr.compression_ratio` | `number` | Part des tokens économisés (0–1) |
| `gatectr.model_used` | `string` | Modèle ayant réellement traité la requête |
| `gatectr.model_requested` | `string` | Modèle spécifié dans la requête |
| `gatectr.routing_reason` | `string \| null` | Raison du choix du Routeur de Modèles |
| `gatectr.cost_usd` | `number` | Coût estimé de cette requête en USD |

## Streaming

Quand `stream: true`, GateCtr retourne des server-sent events (SSE). Chaque chunk utilise `choices[].delta` au lieu de `choices[].message` :

```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Bonjour"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" !"},"finish_reason":"stop"}],"gatectr":{"tokens_saved":8,"cost_usd":0.00021}}

data: [DONE]
```

Les métadonnées `gatectr` sont incluses dans le dernier chunk avant `[DONE]`.

## En-têtes de limite de débit

| En-tête | Description |
|---------|-------------|
| `X-RateLimit-Limit` | Requêtes autorisées par minute |
| `X-RateLimit-Remaining` | Requêtes restantes dans la fenêtre actuelle |
| `X-RateLimit-Reset` | Horodatage Unix de réinitialisation de la fenêtre |

## Réponses d'erreur

| Statut | Type | Description |
|--------|------|-------------|
| `400` | `bad_request` | JSON malformé ou champs requis manquants |
| `401` | `unauthorized` | Clé API invalide ou manquante |
| `422` | `validation_error` | Valeurs de paramètres invalides |
| `429` | `budget_exceeded` | Limite budgétaire du projet atteinte |
| `429` | `rate_limit_exceeded` | Trop de requêtes — attendez et réessayez |
| `502` | `provider_error` | Le fournisseur LLM a retourné une erreur |
| `503` | `service_unavailable` | GateCtr temporairement indisponible |

### Corps de la réponse d'erreur

```json
{
  "error": {
    "type": "budget_exceeded",
    "message": "Requête bloquée. Limite budgétaire atteinte.",
    "request_id": "req_xyz789",
    "project_id": "proj_123",
    "limit": 100000,
    "used": 100012
  }
}
```

## Exemples de requêtes

### cURL

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Quelle est la capitale de la France ?" }
    ],
    "gatectr": { "optimize": true }
  }'
```

### Node.js

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Quelle est la capitale de la France ?' }],
  gatectr: { optimize: true },
});

console.log(response.choices[0].message.content);
```

### Python

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Quelle est la capitale de la France ?"}],
    gatectr={"optimize": True},
)

print(response.choices[0].message.content)
```
