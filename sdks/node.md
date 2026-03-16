# Node.js SDK

Full reference for `@gatectr/sdk`.

## Install

```bash
npm install @gatectr/sdk
```

## Initialize

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
});
```

## `client.complete()`

```typescript
const response = await client.complete({
  model: string,           // model name or "auto"
  messages: Message[],     // OpenAI-compatible messages array
  gatectr?: {
    optimize?: boolean,    // default: true (Pro+)
    route?: boolean,       // default: false (Pro+)
    budget_id?: string,    // override project budget
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

## Drop-in for OpenAI SDK

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GATECTR_API_KEY,
  baseURL: 'https://api.gatectr.com/v1',
});
```

## Full reference

[github.com/GateCtr/sdk-node](https://github.com/GateCtr/sdk-node)
