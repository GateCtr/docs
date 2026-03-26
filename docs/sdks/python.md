---
id: python
title: Python SDK
description: Full reference for the GateCtr Python SDK (gatectr-sdk). Install with pip or uv, make completions, stream responses, use async, handle errors, configure retries, and drop in for the OpenAI SDK or LangChain.
keywords: [Python SDK, pip, async, OpenAI compatible, LangChain, LLM SDK, streaming, error handling]
sidebar_label: Python
---

# Python SDK

Full reference for `gatectr-sdk` — the official Python SDK for GateCtr.

## Install

```bash
pip install gatectr-sdk
# or
uv add gatectr-sdk
```

Requires Python 3.9+.

## Initialize

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

### Constructor options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `api_key` | `str` | Yes | — | Your GateCtr API key (`gct_live_…` or `gct_test_…`) |
| `base_url` | `str` | No | `https://api.gatectr.com/v1` | Override the API base URL |
| `timeout` | `float` | No | `30.0` | Request timeout in seconds |
| `max_retries` | `int` | No | `3` | Number of automatic retries on transient errors |
| `route` | `bool` | No | `False` | Enable Model Router globally for all requests |
| `optimize` | `bool` | No | `True` | Enable Context Optimizer globally (Pro+) |

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    timeout=60.0,
    max_retries=3,
    route=True,
    optimize=True,
)
```

:::note Async context
All `GateCtr` methods are async and must be called inside an `async def` function with `await`. For synchronous code, use `SyncGateCtr` instead.
:::

## `client.complete()`

Text completion — POST /complete.

```python
from gatectr.types import PerRequestOptions

response = await client.complete(
    model="gpt-4o",        # model name or "auto" for Model Router
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
    temperature=0.7,       # optional: sampling temperature (0–2)
    max_tokens=1024,       # optional: max completion tokens
    gatectr=PerRequestOptions(
        optimize=True,         # optional: enable Context Optimizer (default: True, Pro+)
        route=False,           # optional: enable Model Router (default: False, Pro+)
        budget_id="proj_123",  # optional: override project budget
    ),
)

print(response.choices[0].text)
print(response.gatectr.tokens_saved)  # tokens saved by optimizer
print(response.gatectr.model_used)    # model that handled the request
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `str` | Completion ID |
| `object` | `str` | Always `"text_completion"` |
| `model` | `str` | Model used |
| `choices[].text` | `str` | The completion text |
| `choices[].finish_reason` | `str` | `"stop"`, `"length"`, or `"content_filter"` |
| `usage.prompt_tokens` | `int` | Prompt tokens sent |
| `usage.completion_tokens` | `int` | Completion tokens received |
| `usage.total_tokens` | `int` | Total tokens |
| `gatectr.request_id` | `str` | Unique request ID — use for support tickets |
| `gatectr.latency_ms` | `int` | End-to-end latency measured by GateCtr |
| `gatectr.overage` | `bool` | Whether this request exceeded your budget cap |
| `gatectr.model_used` | `str` | Actual model used (may differ when routed) |
| `gatectr.tokens_saved` | `int` | Tokens saved by Context Optimizer (0 if disabled) |

## `client.chat()`

Chat completion — POST /chat. Returns messages in the `choices[].message` format.

```python
response = await client.chat(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
    max_tokens=1024,
)

print(response.choices[0].message.content)
print(response.choices[0].message.role)   # "assistant"
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `object` | `str` | Always `"chat.completion"` |
| `choices[].message.role` | `str` | Always `"assistant"` |
| `choices[].message.content` | `str` | The assistant reply |
| `choices[].finish_reason` | `str` | `"stop"`, `"length"`, or `"content_filter"` |

## `client.stream()`

Streaming chat completion — POST /chat with `stream: true`. Returns an async iterator of `StreamChunk`.

```python
async for chunk in client.stream(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a haiku about code."}],
):
    print(chunk.delta or "", end="", flush=True)
```

## Async support

Use `GateCtr` for async/await workflows or `SyncGateCtr` for synchronous use:

```python
import asyncio
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

async def main():
    response = await client.complete(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello"}],
    )
    print(response.choices[0].text)

asyncio.run(main())
```

### Sync client

```python
from gatectr import SyncGateCtr

client = SyncGateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
print(response.choices[0].text)
```

### Async streaming

```python
async def stream_response():
    async for chunk in client.stream(model="gpt-4o", messages=messages):
        print(chunk.delta or "", end="", flush=True)
```

## `client.models()`

List available models — GET /models.

```python
result = await client.models()

for model in result.models:
    print(model.model_id, model.display_name, model.provider)
    print("Context window:", model.context_window)
    print("Capabilities:", model.capabilities)
```

## `client.usage()`

Query token usage and cost analytics — GET /usage.

```python
from gatectr.types import UsageParams

usage = await client.usage(UsageParams(
    project_id="proj_123",   # optional: filter by project ID
    from_="2025-01-01",      # optional: start date (YYYY-MM-DD)
    to="2025-01-31",         # optional: end date (YYYY-MM-DD)
))

print(usage.total_tokens)
print(usage.total_cost_usd)
print(usage.saved_tokens)
print(usage.by_project)     # per-project breakdown
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `total_tokens` | `int` | Total tokens used in the period |
| `total_requests` | `int` | Total number of requests |
| `total_cost_usd` | `float` | Total estimated cost in USD |
| `saved_tokens` | `int` | Tokens removed by Context Optimizer |
| `from_` | `str` | Start of the queried period |
| `to` | `str` | End of the queried period |
| `by_project` | `list` | Per-project breakdown (see below) |

Each entry in `by_project`:

| Field | Type | Description |
|-------|------|-------------|
| `project_id` | `str \| None` | Project ID |
| `total_tokens` | `int` | Tokens used by this project |
| `total_requests` | `int` | Requests from this project |
| `total_cost_usd` | `float` | Cost from this project |

## Error handling

The SDK raises typed exceptions you can catch and handle:

```python
from gatectr import (
    GateCtrError,
    GateCtrApiError,
    GateCtrConfigError,
    GateCtrTimeoutError,
    GateCtrStreamError,
    GateCtrNetworkError,
)

try:
    response = await client.complete(model="gpt-4o", messages=messages)
except GateCtrApiError as e:
    if e.code == "budget_exceeded":
        # HTTP 429 — project budget limit reached
        print(f"Budget exceeded (request_id: {e.request_id})")
    elif e.status == 401:
        # HTTP 401 — invalid or missing API key
        print("Check your GATECTR_API_KEY")
    else:
        print(f"API error {e.status}: {e.code} — {e}")
except GateCtrConfigError as e:
    # Configuration error (e.g. missing API key at construction time)
    print(f"Config error: {e}")
except GateCtrTimeoutError as e:
    print(f"Request timed out after {e.timeout_s}s")
except GateCtrStreamError as e:
    print(f"Stream failed mid-response: {e}")
except GateCtrNetworkError as e:
    print(f"Network error (DNS, connection refused): {e}")
except GateCtrError as e:
    print(f"GateCtr error: {e}")
```

### Exception attributes

```python
class GateCtrError(Exception): ...

class GateCtrConfigError(GateCtrError): ...  # invalid config (e.g. no API key)

class GateCtrApiError(GateCtrError):
    status: int          # HTTP status code
    code: str            # machine-readable error code (e.g. "budget_exceeded")
    request_id: str | None  # request ID for support

class GateCtrTimeoutError(GateCtrError):
    timeout_s: float     # configured timeout in seconds

class GateCtrStreamError(GateCtrError): ...  # stream failed mid-response

class GateCtrNetworkError(GateCtrError): ... # DNS failure, connection refused
```

## Retry configuration

The SDK automatically retries on `429` (rate limit) and `5xx` errors with exponential backoff:

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    max_retries=3,   # default: 3. Set to 0 to disable retries
)
```

## Drop-in for OpenAI SDK

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
)

# All existing OpenAI SDK calls work unchanged
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
```

GateCtr injects optimization, routing, and budget enforcement transparently.

## Drop-in for LangChain

```python
import os
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
    model="gpt-4o",
)

response = llm.invoke("What is the capital of France?")
```

## Drop-in for LlamaIndex

```python
import os
from llama_index.llms.openai import OpenAI

llm = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    api_base="https://api.gatectr.com/v1",
    model="gpt-4o",
)
```

## Examples

More complete examples are available in the [GateCtr examples repository](https://github.com/GateCtr/examples):

- Basic completion
- Async streaming
- Budget-aware applications
- LangChain integration
- FastAPI integration

## Full reference

[github.com/GateCtr/sdk-python](https://github.com/GateCtr/sdk-python)
