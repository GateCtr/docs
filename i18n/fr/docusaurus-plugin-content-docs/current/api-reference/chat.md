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

Même corps de requête et même format de réponse que [POST /v1/complete](complete.md).

## Quand l'utiliser

Utilisez `/v1/chat/completions` quand vous pointez une intégration SDK OpenAI existante vers GateCtr sans modifier votre code :

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
```

GateCtr injecte l'optimisation, le routage et l'application du budget de manière transparente.
