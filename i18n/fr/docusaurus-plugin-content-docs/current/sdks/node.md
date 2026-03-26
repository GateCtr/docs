---
id: node
title: SDK Node.js
description: Référence complète du SDK Node.js GateCtr (@gatectr/sdk). Installez, initialisez, faites des completions, streamez des réponses, gérez les erreurs, configurez les tentatives et remplacez le SDK OpenAI.
keywords: [SDK Node.js, TypeScript, npm, compatible OpenAI, SDK LLM, streaming, gestion des erreurs]
sidebar_label: Node.js
---

# SDK Node.js

Référence complète pour `@gatectr/sdk` — le SDK TypeScript/JavaScript officiel de GateCtr.

## Installation

```bash
npm install @gatectr/sdk
# ou
yarn add @gatectr/sdk
# ou
pnpm add @gatectr/sdk
```

## Initialisation

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
});
```

### Options du constructeur

| Option | Type | Requis | Défaut | Description |
|--------|------|--------|--------|-------------|
| `apiKey` | `string` | Oui | — | Votre clé API GateCtr (`gct_live_…` ou `gct_test_…`) |
| `baseURL` | `string` | Non | `https://api.gatectr.com/v1` | Remplacer l'URL de base de l'API |
| `timeout` | `number` | Non | `30000` | Délai d'expiration en millisecondes |
| `maxRetries` | `number` | Non | `2` | Nombre de tentatives automatiques sur erreurs transitoires |
| `route` | `boolean` | Non | `false` | Activer le Routeur de Modèles globalement |
| `optimize` | `boolean` | Non | `true` | Activer l'Optimiseur de Contexte globalement (Pro+) |
| `defaultHeaders` | `Record<string, string>` | Non | `{}` | En-têtes HTTP supplémentaires ajoutés à chaque requête |

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  timeout: 60000,
  maxRetries: 3,
  route: true,
  optimize: true,
});
```

## `client.complete()`

Envoyez une requête de completion via GateCtr.

```typescript
const response = await client.complete({
  model: 'gpt-4o',           // nom du modèle ou "auto" pour le Routeur de Modèles
  messages: [
    { role: 'system', content: 'Vous êtes un assistant utile.' },
    { role: 'user', content: 'Quelle est la capitale de la France ?' },
  ],
  temperature: 0.7,
  max_tokens: 1024,
  gatectr: {
    optimize: true,          // activer l'Optimiseur de Contexte (défaut: true, Pro+)
    route: false,            // activer le Routeur de Modèles (défaut: false, Pro+)
    budget_id: 'proj_123',   // remplacer le budget du projet
  },
});

console.log(response.choices[0].message.content);
console.log(response.gatectr.tokens_saved);   // tokens économisés par l'optimiseur
console.log(response.gatectr.cost_usd);       // coût estimé en USD
```

### Response type

```typescript
interface GateCtrResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: 'stop' | 'length' | 'content_filter';
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  gatectr: {
    optimized: boolean;
    original_tokens: number;
    tokens_saved: number;
    compression_ratio: number;
    model_used: string;
    model_requested: string;
    routing_reason: string | null;
    cost_usd: number;
  };
}
```

## `client.stream()`

Recevez les réponses en streaming chunk par chunk.

```typescript
const stream = await client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Écris un haïku sur le code.' }],
});

for await (const chunk of stream) {
  process.stdout.write(chunk.delta ?? '');
}

const finalUsage = stream.usage();
console.log(`Tokens économisés : ${finalUsage.gatectr.tokens_saved}`);
```

### Streaming avec annulation

```typescript
const controller = new AbortController();

const stream = await client.stream(
  { model: 'gpt-4o', messages },
  { signal: controller.signal },
);

for await (const chunk of stream) {
  process.stdout.write(chunk.delta ?? '');
  if (someCondition) controller.abort();
}
```

## `client.usage()`

Interrogez les statistiques d'utilisation des tokens et de coûts.

```typescript
const usage = await client.usage({
  projectId: 'proj_123',
  from: '2025-01-01',
  to: '2025-01-31',
  groupBy: 'model',
});

console.log(usage.total_tokens);
console.log(usage.total_cost_usd);
```

## TypeScript types

```typescript
import type {
  GateCtrOptions,
  CompleteParams,
  GateCtrResponse,
  StreamChunk,
  GateCtrMeta,
} from '@gatectr/sdk';
```

| Type | Description |
|------|-------------|
| `GateCtrOptions` | Options du constructeur |
| `CompleteParams` | Paramètres de `client.complete()` |
| `GateCtrResponse` | Objet de réponse retourné par `complete()` |
| `StreamChunk` | Chunk individuel retourné par `stream()` |
| `GateCtrMeta` | Champ `gatectr` dans la réponse (tokens, coût, routage) |

## Gestion des erreurs

```typescript
import {
  GateCtrError,
  AuthenticationError,
  BudgetExceededError,
  ValidationError,
  ProviderError,
} from '@gatectr/sdk';

try {
  const response = await client.complete({ model: 'gpt-4o', messages });
} catch (err) {
  if (err instanceof AuthenticationError) {
    // HTTP 401 — clé API invalide ou manquante
    console.error('Vérifiez votre GATECTR_API_KEY');
  } else if (err instanceof BudgetExceededError) {
    // HTTP 429 — limite budgétaire du projet atteinte
    console.error(`Budget dépassé pour le projet : ${err.projectId}`);
    console.error(`Limite : ${err.limit}, Utilisé : ${err.used}`);
  } else if (err instanceof ValidationError) {
    // HTTP 422 — paramètres de requête invalides
    console.error('Requête invalide :', err.message);
  } else if (err instanceof ProviderError) {
    // HTTP 502 — le fournisseur LLM a renvoyé une erreur
    console.error('Erreur fournisseur :', err.provider, err.message);
  } else if (err instanceof GateCtrError) {
    console.error(`Erreur GateCtr ${err.status} :`, err.message);
  }
}
```

### Error properties

```typescript
class GateCtrError extends Error {
  status: number;        // code de statut HTTP
  code: string;          // code d'erreur lisible par machine
  requestId: string;     // ID de requête pour le support
}

class BudgetExceededError extends GateCtrError {
  projectId: string;
  limit: number;
  used: number;
  period: 'day' | 'month' | 'total';
}

class ProviderError extends GateCtrError {
  provider: string;      // ex. "openai", "anthropic"
}
```

## Configuration des tentatives

Le SDK réessaie automatiquement en cas d'erreurs `429` (limite de débit) et `5xx` avec un recul exponentiel :

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  maxRetries: 3,   // défaut: 2. Mettez 0 pour désactiver
});

// Remplacer par requête
const response = await client.complete({
  model: 'gpt-4o',
  messages,
  maxRetries: 0,   // aucune tentative pour cette requête
});
```

## Remplacement du SDK OpenAI

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GATECTR_API_KEY,
  baseURL: 'https://api.gatectr.com/v1',
});

// Tous les appels SDK OpenAI existants fonctionnent sans modification
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Bonjour' }],
});
```

GateCtr injecte l'optimisation, le routage et l'application du budget de manière transparente.

## Exemples

Des exemples complets sont disponibles dans le [dépôt d'exemples GateCtr](https://github.com/GateCtr/examples) :

- Completion basique
- Streaming avec annulation
- Applications avec contrôle budgétaire
- Gestionnaire de webhooks (Next.js, Express)
- Pipelines RAG avec optimisation de contexte

## Référence complète

[github.com/GateCtr/sdk-node](https://github.com/GateCtr/sdk-node)
