---
id: chat
title: POST /v1/chat
description: Référence API pour l'endpoint GateCtr /v1/chat — chat completions avec rôles de messages, compatible avec les bibliothèques attendant une réponse de style message.
keywords: [chat completions, compatible OpenAI, messages de chat, référence API]
sidebar_label: POST /v1/chat
---

# POST /v1/chat

Completion de chat — retourne `choices[].message.role/content` au lieu de `choices[].text`.

## Endpoint

```
POST https://api.gatectr.com/v1/chat
```

## Quand utiliser `/chat` vs `/complete`

| Endpoint | Champ de la réponse | Cas d'usage |
|----------|---------------------|-------------|
| `POST /v1/complete` | `choices[].text` | Completion de texte brute ; Routeur de Modèles et Optimiseur de Contexte activés |
| `POST /v1/chat` | `choices[].message.role/content` | Frameworks de chat ; bibliothèques qui inspectent `.message.content` |

Les deux endpoints acceptent le même format de tableau `messages`.

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
  "optimize": true,
  "route": false,
  "budgetId": "proj_123"
}
```

Les paramètres sont identiques à ceux de [POST /v1/complete](./complete.md).

## Réponse

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [
    {
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
    "total_tokens": 21,
    "saved_tokens": 8
  }
}
```

### Champs de la réponse

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `string` | ID unique de la completion |
| `object` | `string` | Toujours `"chat.completion"` |
| `model` | `string` | Modèle qui a généré la réponse |
| `choices[].message.role` | `string` | Toujours `"assistant"` |
| `choices[].message.content` | `string` | La réponse de l'assistant |
| `choices[].finish_reason` | `string` | `"stop"`, `"length"`, ou `"content_filter"` |
| `usage.prompt_tokens` | `number` | Tokens de la requête (après optimisation) |
| `usage.completion_tokens` | `number` | Tokens de la completion |
| `usage.total_tokens` | `number` | Somme des tokens de prompt et de completion |
| `usage.saved_tokens` | `number` | Tokens économisés par l'Optimiseur de Contexte |

## En-têtes de réponse

GateCtr définit ces en-têtes sur chaque réponse :

| En-tête | Description |
|---------|-------------|
| `X-GateCtr-Request-Id` | ID unique de la requête — pour les tickets de support |
| `X-GateCtr-Latency-Ms` | Latence bout-en-bout mesurée par GateCtr |
| `X-GateCtr-Overage` | `"true"` si la requête a dépassé le plafond budgétaire |

## Exemples de requêtes

### cURL

```bash
curl https://api.gatectr.com/v1/chat \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Bonjour" }
    ]
  }'
```

### Node.js

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.chat({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Bonjour' }],
});

console.log(response.choices[0].message.content);
console.log(response.choices[0].message.role);   // "assistant"
```

### Python

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = await client.chat(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Bonjour"}],
)

print(response.choices[0].message.content)
print(response.choices[0].message.role)   # "assistant"
```

## Alias compatible OpenAI

L'endpoint `/v1/chat/completions` est un alias pour `/v1/chat`, fourni pour la compatibilité avec les bibliothèques qui s'attendent à ce chemin :

```bash
curl https://api.gatectr.com/v1/chat/completions \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "model": "gpt-4o", "messages": [{ "role": "user", "content": "Bonjour" }] }'
```

Voir la [référence complète de /v1/complete](./complete.md) pour la liste des paramètres et le comportement des erreurs.
