---
id: node
title: Node.js SDK
description: Full reference for the GateCtr Node.js SDK (@gatectr/sdk). Install, initialize, make completions, stream responses, handle errors, configure retries, and drop in for the OpenAI SDK.
keywords: [Node.js SDK, TypeScript, npm, OpenAI compatible, LLM SDK, streaming, error handling]
sidebar_label: Node.js
---

# Node.js SDK

Full reference for `@gatectr/sdk` — the official TypeScript/JavaScript SDK for GateCtr.

## Install

```bash
npm install @gatectr/sdk
# or
yarn add @gatectr/sdk
# or
pnpm add @gatectr/sdk
```

## Initialize

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
});
```

### Constructor options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `string` | Yes | — | Your GateCtr API key (`gct_live_…` or `gct_test_…`) |
| `baseURL` | `string` | No | `https://api.gatectr.com/v1` | Override the API base URL |
| `timeout` | `number` | No | `30000` | Request timeout in milliseconds |
| `maxRetries` | `number` | No | `2` | Number of automatic retries on transient errors |
| `route` | `boolean` | No | `false` | Enable Model Router globally for all requests |
| `optimize` | `boolean` | No | `true` | Enable Context Optimizer globally (Pro+) |
| `defaultHeaders` | `Record<string, string>` | No | `{}` | Extra HTTP headers added to every request |

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

Send a completion request through GateCtr.

```typescript
const response = await client.complete({
  model: 'gpt-4o',           // model name or "auto" for Model Router
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' },
  ],
  temperature: 0.7,          // optional: sampling temperature (0–2)
  max_tokens: 1024,          // optional: max completion tokens
  stream: false,             // optional: enable streaming
  gatectr: {
    optimize: true,          // optional: enable Context Optimizer (default: true, Pro+)
    route: false,            // optional: enable Model Router (default: false, Pro+)
    budget_id: 'proj_123',   // optional: override project budget
  },
});

console.log(response.choices[0].message.content);
console.log(response.gatectr.tokens_saved);   // tokens saved by optimizer
console.log(response.gatectr.cost_usd);       // estimated cost in USD
```

### Response type

```typescript
interface CompleteResponse {
  id: string;
  object: 'chat.completion';
  model: string;
  choices: Array<{
    index: number;
    message: { role: 'assistant'; content: string };
    finish_reason: 'stop' | 'length' | 'content_filter';
  }>;
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
    routing_reason?: string;
    cost_usd: number;
  };
}
```

## `client.stream()`

Stream completion responses chunk by chunk.

```typescript
const stream = await client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Write a haiku about code.' }],
});

for await (const chunk of stream) {
  process.stdout.write(chunk.delta ?? '');
}

// Access final usage after stream ends
const finalUsage = stream.usage();
console.log(`Tokens saved: ${finalUsage.gatectr.tokens_saved}`);
```

### Streaming with abort

```typescript
const controller = new AbortController();

const stream = await client.stream(
  { model: 'gpt-4o', messages },
  { signal: controller.signal },
);

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

for await (const chunk of stream) {
  process.stdout.write(chunk.delta ?? '');
}
```

## `client.usage()`

Query token usage and cost analytics for a project.

```typescript
const usage = await client.usage({
  projectId: 'proj_123',
  from: '2025-01-01',
  to: '2025-01-31',
  groupBy: 'model',     // optional: "model" | "day" | "project"
});

console.log(usage.total_tokens);
console.log(usage.total_cost_usd);
console.log(usage.by_model);
```

## TypeScript types

All public types are exported from `@gatectr/sdk`:

```typescript
import type {
  GateCtrOptions,
  CompleteParams,
  CompleteResponse,
  StreamChunk,
  UsageParams,
  UsageResponse,
  GateCtrError,
  BudgetExceededError,
  AuthenticationError,
  ProviderError,
} from '@gatectr/sdk';
```

## Error handling

The SDK throws typed errors you can catch and handle:

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
    // HTTP 401 — invalid or missing API key
    console.error('Check your GATECTR_API_KEY');
  } else if (err instanceof BudgetExceededError) {
    // HTTP 429 — project budget limit reached
    console.error(`Budget exceeded for project: ${err.projectId}`);
    console.error(`Limit: ${err.limit}, Used: ${err.used}`);
  } else if (err instanceof ValidationError) {
    // HTTP 422 — invalid request parameters
    console.error('Invalid request:', err.message);
  } else if (err instanceof ProviderError) {
    // HTTP 502 — LLM provider returned an error
    console.error('Provider error:', err.provider, err.message);
  } else if (err instanceof GateCtrError) {
    // Generic GateCtr error
    console.error('GateCtr error:', err.status, err.message);
  }
}
```

### Error properties

```typescript
class GateCtrError extends Error {
  status: number;        // HTTP status code
  code: string;          // machine-readable error code
  requestId: string;     // request ID for support
}

class BudgetExceededError extends GateCtrError {
  projectId: string;
  limit: number;
  used: number;
  period: 'day' | 'month' | 'total';
}

class ProviderError extends GateCtrError {
  provider: string;      // e.g. "openai", "anthropic"
}
```

## Retry configuration

The SDK automatically retries on `429` (rate limit) and `5xx` errors with exponential backoff:

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  maxRetries: 3,     // default: 2. Set to 0 to disable retries
});

// Override per request
const response = await client.complete(
  { model: 'gpt-4o', messages },
  { maxRetries: 0 },   // no retries for this request
);
```

## Drop-in for OpenAI SDK

Point your existing OpenAI SDK at GateCtr — no other changes needed:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GATECTR_API_KEY,
  baseURL: 'https://api.gatectr.com/v1',
});

// All existing OpenAI SDK calls work unchanged
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
});
```

GateCtr injects optimization, routing, and budget enforcement transparently. The `gatectr` field appears in the response alongside the standard OpenAI fields.

## Examples

More complete examples are available in the [GateCtr examples repository](https://github.com/GateCtr/examples):

- Basic completion
- Streaming responses
- Budget-aware applications
- Multi-model routing
- Webhook verification

## Full reference

[github.com/GateCtr/sdk-node](https://github.com/GateCtr/sdk-node)
