---
id: node
title: SDK Node.js
description: Référence complète du SDK Node.js GateCtr (@gatectr/sdk). Installez, initialisez, faites des completions, streamez des réponses et remplacez le SDK OpenAI.
keywords: [SDK Node.js, TypeScript, npm, compatible OpenAI, SDK LLM]
sidebar_label: Node.js
---

# SDK Node.js

Référence complète pour `@gatectr/sdk`.

## Installation

```bash
npm install @gatectr/sdk
```

## Initialisation

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
});
```

## `client.complete()`

```typescript
const response = await client.complete({
  model: string,           // nom du modèle ou "auto"
  messages: Message[],     // tableau de messages compatible OpenAI
  gatectr?: {
    optimize?: boolean,    // défaut: true (Pro+)
    route?: boolean,       // défaut: false (Pro+)
    budget_id?: string,    // surcharger le budget du projet
  }
});
```

## `client.stream()`

```typescript
const stream = await client.stream({
  model: 'gpt-4o',
  messages,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.delta ?? '');
}
```

## `client.usage()`

```typescript
const usage = await client.usage({
  projectId: 'proj_123',
  from: '2025-01-01',
  to: '2025-01-31',
});
```

## Remplacement du SDK OpenAI

Pointez votre SDK OpenAI existant vers GateCtr — aucun autre changement nécessaire :

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GATECTR_API_KEY,
  baseURL: 'https://api.gatectr.com/v1',
});
```

## Référence complète

[github.com/GateCtr/sdk-node](https://github.com/GateCtr/sdk-node)
