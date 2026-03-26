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
| `apiKey` | `string` | Yes | — | Your GateCtr API key (`gct_live_…` or `gct_test_…`). Falls back to `GATECTR_API_KEY` env var |
| `baseUrl` | `string` | No | `https://api.gatectr.com/v1` | Override the API base URL |
| `timeout` | `number` | No | `30000` | Request timeout in milliseconds |
| `maxRetries` | `number` | No | `3` | Number of automatic retries on transient errors |
| `route` | `boolean` | No | `false` | Enable Model Router globally for all requests |
| `optimize` | `boolean` | No | `true` | Enable Context Optimizer globally (Pro+) |

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

Text completion — POST /complete.

```typescript
const response = await client.complete({
  model: 'gpt-4o',           // model name or "auto" for Model Router
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' },
  ],
  temperature: 0.7,          // optional: sampling temperature (0–2)
  max_tokens: 1024,          // optional: max completion tokens
  gatectr: {
    optimize: true,          // optional: enable Context Optimizer (default: true, Pro+)
    route: false,            // optional: enable Model Router (default: false, Pro+)
    budgetId: 'proj_123',    // optional: override project budget
  },
});

console.log(response.choices[0].text);
console.log(response.gatectr.tokensSaved);  // tokens saved by optimizer
console.log(response.gatectr.modelUsed);    // model that handled the request
```

### Response type

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
  requestId: string;    // unique request ID — use for support tickets
  latencyMs: number;    // end-to-end latency measured by GateCtr
  overage: boolean;     // true if this request exceeded your budget cap
  modelUsed: string;    // actual model that handled the request
  tokensSaved: number;  // tokens saved by Context Optimizer (0 if optimize: false)
}
```

## `client.chat()`

Chat completion — POST /chat. Returns messages in the `choices[].message` format.

```typescript
const response = await client.chat({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' },
  ],
  max_tokens: 1024,
});

console.log(response.choices[0].message.content);
console.log(response.choices[0].message.role);   // "assistant"
```

### Response type

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

Streaming chat completion — POST /chat with `stream: true`. Returns an `AsyncIterable<StreamChunk>`.

```typescript
for await (const chunk of client.stream({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Write a haiku about code.' }],
})) {
  process.stdout.write(chunk.delta ?? '');
}
```

### Streaming with abort

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

for await (const chunk of client.stream({
  model: 'gpt-4o',
  messages,
  signal: controller.signal,
})) {
  process.stdout.write(chunk.delta ?? '');
}
```

### Chunk type

```typescript
interface StreamChunk {
  id: string;
  delta: string | null;         // incremental text, null on final chunk
  finishReason: string | null;  // non-null on final chunk
}
```

## `client.models()`

List available models — GET /models.

```typescript
const { models } = await client.models();

for (const m of models) {
  console.log(m.modelId, m.displayName, m.provider);
  console.log('Context window:', m.contextWindow);
  console.log('Capabilities:', m.capabilities);
}
```

### Response type

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

Query token usage and cost analytics — GET /usage.

```typescript
const usage = await client.usage({
  projectId: 'proj_123',   // optional: filter by project ID
  from: '2025-01-01',      // optional: start date (YYYY-MM-DD)
  to: '2025-01-31',        // optional: end date (YYYY-MM-DD)
});

console.log(usage.totalTokens);
console.log(usage.totalCostUsd);
console.log(usage.savedTokens);
console.log(usage.byProject);    // per-project breakdown
```

### Response type

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
  budgetStatus?: Record<string, unknown>;
}
```

## TypeScript types

All public types are exported from `@gatectr/sdk`:

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

## Error handling

The SDK throws typed errors you can catch and handle:

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
      // HTTP 429 — project budget limit reached
      console.error(`Budget exceeded (requestId: ${err.requestId})`);
    } else if (err.status === 401) {
      // HTTP 401 — invalid or missing API key
      console.error('Check your GATECTR_API_KEY');
    } else {
      console.error(`API error ${err.status}: ${err.code} — ${err.message}`);
    }
  } else if (err instanceof GateCtrConfigError) {
    // Configuration error (e.g. missing API key at construction time)
    console.error('Config error:', err.message);
  } else if (err instanceof GateCtrTimeoutError) {
    console.error(`Request timed out after ${err.timeoutMs}ms`);
  } else if (err instanceof GateCtrStreamError) {
    console.error('Stream failed mid-response:', err.message);
  } else if (err instanceof GateCtrNetworkError) {
    console.error('Network error (DNS, connection refused):', err.message);
  } else if (err instanceof GateCtrError) {
    console.error('GateCtr error:', err.message);
  }
}
```

### Error classes

```typescript
class GateCtrError extends Error {}

class GateCtrConfigError extends GateCtrError {}  // invalid config (e.g. no API key)

class GateCtrApiError extends GateCtrError {
  status: number;          // HTTP status code
  code: string;            // machine-readable error code (e.g. "budget_exceeded")
  requestId: string | undefined;  // request ID for support
}

class GateCtrTimeoutError extends GateCtrError {
  timeoutMs: number;       // configured timeout in ms
}

class GateCtrStreamError extends GateCtrError {}  // stream failed mid-response

class GateCtrNetworkError extends GateCtrError {} // DNS failure, connection refused
```

## Retry configuration

The SDK automatically retries on `429` (rate limit) and `5xx` errors with exponential backoff:

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  maxRetries: 3,   // default: 3. Set to 0 to disable retries
});
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

GateCtr injects optimization, routing, and budget enforcement transparently.

## Examples

More complete examples are available in the [GateCtr examples repository](https://github.com/GateCtr/examples):

- Basic completion
- Chat completions
- Streaming responses
- Budget-aware applications
- Multi-model routing
- Next.js integration

## Full reference

[github.com/GateCtr/sdk-node](https://github.com/GateCtr/sdk-node)
