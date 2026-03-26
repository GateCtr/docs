---
id: complete
title: POST /v1/complete
description: Référence API pour l'endpoint GateCtr /v1/complete — envoyez des requêtes de completion de texte via la passerelle LLM avec optimisation, routage et application du budget.
keywords: [référence API, endpoint complete, completion de texte, API LLM, compatible OpenAI]
sidebar_label: POST /v1/complete
---

# POST /v1/complete

Envoyez une requête de completion de texte via GateCtr.

## Endpoint

```
POST https://api.gatectr.com/v1/complete
```

## En-têtes

| En-tête | Valeur | Requis |
|---------|--------|--------|
| `Authorization` | `Bearer <votre-clé-api>` | Oui |
| `Content-Type` | `application/json` | Oui |

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
  "stream": false,
  "optimize": true,
  "route": false,
  "budgetId": "proj_123"
}
```

### Paramètres

| Champ | Type | Requis | Défaut | Description |
|-------|------|--------|--------|-------------|
| `model` | `string` | Oui | — | Nom du modèle ou `"auto"` pour le Routeur de Modèles |
| `messages` | `array` | Oui | — | Tableau de messages compatible OpenAI |
| `messages[].role` | `string` | Oui | — | `"system"`, `"user"`, ou `"assistant"` |
| `messages[].content` | `string` | Oui | — | Contenu du message |
| `temperature` | `number` | Non | `1.0` | Température d'échantillonnage (0–2). Plus élevé = plus aléatoire |
| `max_tokens` | `number` | Non | défaut du modèle | Tokens de completion maximum |
| `stream` | `boolean` | Non | `false` | Activer le streaming via server-sent events |
| `optimize` | `boolean` | Non | `true` | Activer l'Optimiseur de Contexte (Pro+) |
| `route` | `boolean` | Non | `false` | Activer le Routeur de Modèles (Pro+) |
| `budgetId` | `string` | Non | — | Remplacer le budget du projet actif |

## Réponse

```json
{
  "id": "cmpl-abc123",
  "object": "text_completion",
  "model": "gpt-4o",
  "choices": [
    {
      "text": "Bonjour ! Comment puis-je vous aider ?",
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 9,
    "total_tokens": 21,
    "saved_tokens": 8
  }
}
```

### En-têtes de réponse

GateCtr définit ces en-têtes sur chaque réponse :

| En-tête | Description |
|---------|-------------|
| `X-GateCtr-Request-Id` | ID unique de la requête — pour les tickets de support |
| `X-GateCtr-Latency-Ms` | Latence bout-en-bout mesurée par GateCtr |
| `X-GateCtr-Overage` | `"true"` si la requête a dépassé le plafond budgétaire |

### Champs de la réponse

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `string` | ID unique de la completion |
| `object` | `string` | Toujours `"text_completion"` |
| `model` | `string` | Modèle qui a généré la réponse |
| `choices[].text` | `string` | Le texte de completion |
| `choices[].finish_reason` | `string` | `"stop"`, `"length"`, ou `"content_filter"` |
| `usage.prompt_tokens` | `number` | Tokens de la requête (après optimisation) |
| `usage.completion_tokens` | `number` | Tokens de la completion |
| `usage.total_tokens` | `number` | Somme des tokens de prompt et de completion |
| `usage.saved_tokens` | `number` | Tokens économisés par l'Optimiseur de Contexte |

### Métadonnées `gatectr` du SDK

Lors de l'utilisation du SDK GateCtr, l'objet de réponse expose également un champ `gatectr` assemblé depuis les en-têtes de réponse :

| Champ (Node.js) | Champ (Python) | Source | Description |
|-----------------|----------------|--------|-------------|
| `requestId` | `request_id` | En-tête `X-GateCtr-Request-Id` | ID unique de la requête |
| `latencyMs` | `latency_ms` | En-tête `X-GateCtr-Latency-Ms` | Latence bout-en-bout |
| `overage` | `overage` | En-tête `X-GateCtr-Overage` | Si le plafond budgétaire a été dépassé |
| `modelUsed` | `model_used` | Champ `model` du corps | Modèle réellement utilisé |
| `tokensSaved` | `tokens_saved` | `usage.saved_tokens` du corps | Tokens économisés par l'Optimiseur |

## Streaming

Quand `stream: true`, GateCtr retourne des server-sent events (SSE). Chaque chunk :

```
data: {"id":"cmpl-abc123","delta":"Bonjour","finishReason":null}

data: {"id":"cmpl-abc123","delta":" !","finishReason":"stop"}

data: [DONE]
```

## En-têtes de limite de débit

| En-tête | Description |
|---------|-------------|
| `X-RateLimit-Limit` | Requêtes autorisées par minute |
| `X-RateLimit-Remaining` | Requêtes restantes dans la fenêtre actuelle |
| `X-RateLimit-Reset` | Timestamp Unix de réinitialisation de la fenêtre |

## Réponses d'erreur

| Statut | Type | Description |
|--------|------|-------------|
| `400` | `bad_request` | JSON malformé ou champs requis manquants |
| `401` | `unauthorized` | Clé API invalide ou manquante |
| `422` | `validation_error` | Valeurs de paramètres invalides |
| `429` | `budget_exceeded` | Limite budgétaire du projet atteinte |
| `429` | `rate_limit_exceeded` | Trop de requêtes — ralentissez et réessayez |
| `502` | `provider_error` | Le fournisseur LLM a renvoyé une erreur |
| `503` | `service_unavailable` | GateCtr est temporairement indisponible |

### Corps d'erreur

```json
{
  "error": {
    "type": "budget_exceeded",
    "message": "Requête bloquée. Limite budgétaire atteinte.",
    "request_id": "req_xyz789"
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
    "optimize": true
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

console.log(response.choices[0].text);
```

### Python

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = await client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Quelle est la capitale de la France ?"}],
)

print(response.choices[0].text)
```
