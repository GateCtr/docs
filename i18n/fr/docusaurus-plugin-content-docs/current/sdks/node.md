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
| `apiKey` | `string` | Oui | — | Votre clé API GateCtr (`gct_live_…` ou `gct_test_…`). Utilise `GATECTR_API_KEY` par défaut |
| `baseUrl` | `string` | Non | `https://api.gatectr.com/v1` | Remplacer l'URL de base de l'API |
| `timeout` | `number` | Non | `30000` | Délai d'expiration en millisecondes |
| `maxRetries` | `number` | Non | `3` | Nombre de tentatives automatiques sur erreurs transitoires |
| `route` | `boolean` | Non | `false` | Activer le Routeur de Modèles globalement |
| `optimize` | `boolean` | Non | `true` | Activer l'Optimiseur de Contexte globalement (Pro+) |

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

Completion de texte — POST /complete.

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
    budgetId: 'proj_123',    // remplacer le budget du projet
  },
});

console.log(response.choices[0].text);
console.log(response.gatectr.tokensSaved);  // tokens économisés par l'optimiseur
console.log(response.gatectr.modelUsed);    // modèle qui a traité la requête
```

### Type de réponse

```typescript
interface CompleteResponse {
  id: string;
  object: 'text_completion';
  model: string;
  choices: Array<{
    text: string;
    finish_reason: 'stop' | 'length' | 'content_filter';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  gatectr: GateCtrMetadata;
}

interface GateCtrMetadata {
  requestId: string;    // ID unique de la requête — pour les tickets de support
  latencyMs: number;    // latence bout-en-bout mesurée par GateCtr
  overage: boolean;     // vrai si la requête a dépassé le plafond budgétaire
  modelUsed: string;    // modèle réellement utilisé
  tokensSaved: number;  // tokens économisés par l'Optimiseur de Contexte (0 si désactivé)
}
```

## `client.chat()`

Completion de chat — POST /chat. Retourne les messages au format `choices[].message`.

```typescript
const response = await client.chat({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'Vous êtes un assistant utile.' },
    { role: 'user', content: 'Quelle est la capitale de la France ?' },
  ],
  max_tokens: 1024,
});

console.log(response.choices[0].message.content);
console.log(response.choices[0].message.role);   // "assistant"
```

### Type de réponse

```typescript
interface ChatResponse {
  id: string;
  object: 'chat.completion';
  model: string;
  choices: Array<{
    message: { role: 'system' | 'user' | 'assistant'; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  gatectr: GateCtrMetadata;
}
```

## `client.stream()`

Streaming de chat — POST /chat avec `stream: true`. Retourne un `AsyncIterable<StreamChunk>`.

```typescript
for await (const chunk of client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Écris un haïku sur le code.' }],
})) {
  process.stdout.write(chunk.delta ?? '');
}
```

### Streaming avec annulation

```typescript
const controller = new AbortController();

// Annuler après 5 secondes
setTimeout(() => controller.abort(), 5000);

for await (const chunk of client.stream({
  model: 'gpt-4o',
  messages,
  signal: controller.signal,
})) {
  process.stdout.write(chunk.delta ?? '');
}
```

### Type de chunk

```typescript
interface StreamChunk {
  id: string;
  delta: string | null;         // texte incrémental, null sur le chunk final
  finishReason: string | null;  // non-null sur le chunk final
}
```

## `client.models()`

Liste les modèles disponibles — GET /models.

```typescript
const { models } = await client.models();

for (const m of models) {
  console.log(m.modelId, m.displayName, m.provider);
  console.log('Fenêtre de contexte :', m.contextWindow);
  console.log('Capacités :', m.capabilities);
}
```

### Type de réponse

```typescript
interface ModelsResponse {
  models: Array<{
    modelId: string;
    displayName: string;
    provider: string;
    contextWindow: number;
    capabilities: string[];
  }>;
  requestId: string;
}
```

## `client.usage()`

Interrogez les statistiques d'utilisation — GET /usage.

```typescript
const usage = await client.usage({
  projectId: 'proj_123',   // optionnel : filtrer par ID de projet
  from: '2025-01-01',      // optionnel : date de début (YYYY-MM-DD)
  to: '2025-01-31',        // optionnel : date de fin (YYYY-MM-DD)
});

console.log(usage.totalTokens);
console.log(usage.totalCostUsd);
console.log(usage.savedTokens);
console.log(usage.byProject);    // détail par projet
```

### Type de réponse

```typescript
interface UsageResponse {
  totalTokens: number;
  totalRequests: number;
  totalCostUsd: number;
  savedTokens: number;
  from: string;
  to: string;
  byProject: Array<{
    projectId: string | null;
    totalTokens: number;
    totalRequests: number;
    totalCostUsd: number;
  }>;
}
```

## TypeScript types

Tous les types publics sont exportés depuis `@gatectr/sdk` :

```typescript
import type {
  GateCtrConfig,
  PerRequestOptions,
  Message,
  GateCtrMetadata,
  CompleteParams,
  CompleteResponse,
  ChatParams,
  ChatResponse,
  StreamParams,
  StreamChunk,
  ModelInfo,
  ModelsResponse,
  UsageParams,
  UsageByProject,
  UsageResponse,
} from '@gatectr/sdk';
```

## Gestion des erreurs

Le SDK lève des erreurs typées que vous pouvez attraper et gérer :

```typescript
import {
  GateCtrError,
  GateCtrApiError,
  GateCtrConfigError,
  GateCtrTimeoutError,
  GateCtrStreamError,
  GateCtrNetworkError,
} from '@gatectr/sdk';

try {
  const response = await client.complete({ model: 'gpt-4o', messages });
} catch (err) {
  if (err instanceof GateCtrApiError) {
    if (err.code === 'budget_exceeded') {
      // HTTP 429 — limite budgétaire du projet atteinte
      console.error(`Budget dépassé (requestId : ${err.requestId})`);
    } else if (err.status === 401) {
      // HTTP 401 — clé API invalide ou manquante
      console.error('Vérifiez votre GATECTR_API_KEY');
    } else {
      console.error(`Erreur API ${err.status} : ${err.code} — ${err.message}`);
    }
  } else if (err instanceof GateCtrConfigError) {
    // Erreur de configuration (ex. clé API manquante)
    console.error('Erreur de config :', err.message);
  } else if (err instanceof GateCtrTimeoutError) {
    console.error(`Délai dépassé après ${err.timeoutMs}ms`);
  } else if (err instanceof GateCtrStreamError) {
    console.error('Échec du stream :', err.message);
  } else if (err instanceof GateCtrNetworkError) {
    console.error('Erreur réseau (DNS, connexion refusée) :', err.message);
  } else if (err instanceof GateCtrError) {
    console.error('Erreur GateCtr :', err.message);
  }
}
```

### Classes d'erreur

```typescript
class GateCtrError extends Error {}

class GateCtrConfigError extends GateCtrError {}  // config invalide (ex. pas de clé API)

class GateCtrApiError extends GateCtrError {
  status: number;          // code de statut HTTP
  code: string;            // code d'erreur lisible par machine (ex. "budget_exceeded")
  requestId: string | undefined;  // ID de requête pour le support
}

class GateCtrTimeoutError extends GateCtrError {
  timeoutMs: number;       // délai configuré en ms
}

class GateCtrStreamError extends GateCtrError {}  // échec du stream

class GateCtrNetworkError extends GateCtrError {} // DNS, connexion refusée
```

## Configuration des tentatives

Le SDK réessaie automatiquement en cas d'erreurs `429` (limite de débit) et `5xx` avec un recul exponentiel :

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  maxRetries: 3,   // défaut : 3. Mettez 0 pour désactiver les tentatives
});
```

## Remplacement du SDK OpenAI

Pointez votre SDK OpenAI existant vers GateCtr — aucune autre modification :

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
- Completions de chat
- Streaming avec annulation
- Applications avec contrôle budgétaire
- Routage multi-modèles
- Intégration Next.js

## Référence complète

[github.com/GateCtr/sdk-node](https://github.com/GateCtr/sdk-node)
