---
id: chat
title: POST /v1/chat
description: L'endpoint /v1/chat de GateCtr pour les chat completions, et /v1/chat/completions comme alias compatible OpenAI sans modification de code.
keywords: [chat completions, compatible OpenAI, remplacement direct, référence API]
sidebar_label: POST /v1/chat
---

# POST /v1/chat

Endpoint de chat completion. Retourne les réponses au format `choices[].message`.

## Endpoints

| Chemin | Description |
|--------|-------------|
| `POST https://api.gatectr.com/v1/chat` | Endpoint natif GateCtr (utilisé par `client.chat()` et `client.stream()`) |
| `POST https://api.gatectr.com/v1/chat/completions` | Alias compatible OpenAI pour les intégrations SDK OpenAI existantes |

## En-têtes

| En-tête | Valeur | Requis |
|---------|--------|--------|
| `Authorization` | `Bearer <votre-clé-api>` | Oui |
| `Content-Type` | `application/json` | Oui |

## Corps de la requête

Mêmes paramètres que [POST /v1/complete](complete.md) : `model`, `messages`, `temperature`, `max_tokens`, `stream`, `optimize`, `route`, `budgetId`.

## Réponse

```json
{
  "id": "chat-abc123",
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
  },
  "gatectr": {
    "requestId": "req_abc123",
    "latencyMs": 342,
    "overage": false,
    "modelUsed": "gpt-4o",
    "tokensSaved": 8
  }
}
```

### En-têtes de réponse

Mêmes que [POST /v1/complete](complete.md) : `X-GateCtr-Request-Id`, `X-GateCtr-Latency-Ms`, `X-GateCtr-Overage`.

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
| `gatectr.requestId` | `string` | ID unique de la requête (miroir de l'en-tête `X-GateCtr-Request-Id`) |
| `gatectr.latencyMs` | `number` | Latence bout-en-bout en millisecondes |
| `gatectr.overage` | `boolean` | `true` si la requête a dépassé le plafond budgétaire |
| `gatectr.modelUsed` | `string` | Modèle réel ayant traité la requête |
| `gatectr.tokensSaved` | `number` | Tokens économisés par l'Optimiseur de Contexte |

## Utiliser l'alias compatible OpenAI

Utilisez `/v1/chat/completions` pour pointer une intégration SDK OpenAI existante vers GateCtr sans modifier le code :

### Node.js

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GATECTR_API_KEY,
  baseURL: 'https://api.gatectr.com/v1',
});

// Appelle /v1/chat/completions — aucune modification nécessaire
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Bonjour' }],
});

console.log(response.choices[0].message.content);
```

### Python

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
)

# Appelle /v1/chat/completions — aucune modification nécessaire
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Bonjour"}],
)

print(response.choices[0].message.content)
```

### LangChain

```python
import os
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
    model="gpt-4o",
)
```

GateCtr injecte l'optimisation, le routage et l'application du budget de manière transparente.

## Utiliser le SDK natif GateCtr

Lors de l'utilisation directe du SDK GateCtr :

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

// client.chat() → POST /v1/chat (sans streaming)
const response = await client.chat({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Bonjour' }],
});

console.log(response.choices[0].message.content);

// client.stream() → POST /v1/chat avec stream: true
for await (const chunk of client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Bonjour' }],
})) {
  process.stdout.write(chunk.delta ?? '');
}
```

## En-têtes de limite de débit

| En-tête | Description |
|---------|-------------|
| `X-RateLimit-Limit` | Requêtes autorisées par minute |
| `X-RateLimit-Remaining` | Requêtes restantes dans la fenêtre actuelle |
| `X-RateLimit-Reset` | Timestamp Unix de réinitialisation de la fenêtre |

## Réponses d'erreur

Mêmes codes d'erreur que [POST /v1/complete](complete.md) :

| Statut | Type | Description |
|--------|------|-------------|
| `400` | `bad_request` | JSON malformé ou champs requis manquants |
| `401` | `unauthorized` | Clé API invalide ou manquante |
| `422` | `validation_error` | Valeurs de paramètres invalides |
| `429` | `budget_exceeded` | Limite budgétaire du projet atteinte |
| `429` | `rate_limit_exceeded` | Trop de requêtes — ralentissez et réessayez |
| `502` | `provider_error` | Le fournisseur LLM a renvoyé une erreur |
| `503` | `service_unavailable` | GateCtr est temporairement indisponible |
