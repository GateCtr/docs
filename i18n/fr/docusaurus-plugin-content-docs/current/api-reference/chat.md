---
id: chat
title: POST /v1/chat/completions
description: L'endpoint /v1/chat/completions de GateCtr est un alias compatible OpenAI pour /v1/complete — aucune modification de code nécessaire.
keywords: [chat completions, compatible OpenAI, remplacement direct, référence API]
sidebar_label: POST /v1/chat
---

# POST /v1/chat/completions

Alias pour `/v1/complete`. Comportement identique, fourni pour la compatibilité avec le SDK OpenAI.

## Endpoint

```
POST https://api.gatectr.com/v1/chat/completions
```

## En-têtes

| En-tête | Valeur | Requis |
|---------|--------|--------|
| `Authorization` | `Bearer <votre-clé-api>` | Oui |
| `Content-Type` | `application/json` | Oui |

## Corps de la requête et réponse

Même corps de requête et même format de réponse que [POST /v1/complete](complete.md). Tous les paramètres (`model`, `messages`, `temperature`, `max_tokens`, `stream`, `gatectr.*`, etc.) sont acceptés de manière identique.

## Quand l'utiliser

Utilisez `/v1/chat/completions` quand vous pointez une intégration SDK OpenAI existante vers GateCtr sans modifier votre code :

### Node.js

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GATECTR_API_KEY,
  baseURL: 'https://api.gatectr.com/v1',
});

// Ceci appelle /v1/chat/completions — aucun changement nécessaire
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

# Ceci appelle /v1/chat/completions — aucun changement nécessaire
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

GateCtr injecte l'optimisation, le routage et l'application du budget de manière transparente. Le champ `gatectr` apparaît dans la réponse aux côtés des champs OpenAI standards.

## En-têtes de limite de débit

| En-tête | Description |
|---------|-------------|
| `X-RateLimit-Limit` | Requêtes autorisées par minute |
| `X-RateLimit-Remaining` | Requêtes restantes dans la fenêtre actuelle |
| `X-RateLimit-Reset` | Horodatage Unix de réinitialisation de la fenêtre |

## Réponses d'erreur

Mêmes codes d'erreur que [POST /v1/complete](complete.md) :

| Statut | Type | Description |
|--------|------|-------------|
| `400` | `bad_request` | JSON malformé ou champs requis manquants |
| `401` | `unauthorized` | Clé API invalide ou manquante |
| `422` | `validation_error` | Valeurs de paramètres invalides |
| `429` | `budget_exceeded` | Limite budgétaire du projet atteinte |
| `429` | `rate_limit_exceeded` | Trop de requêtes — attendez et réessayez |
| `502` | `provider_error` | Le fournisseur LLM a retourné une erreur |
| `503` | `service_unavailable` | GateCtr temporairement indisponible |
