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

Requires Python 3.8+.

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
| `max_retries` | `int` | No | `2` | Number of automatic retries on transient errors |
| `route` | `bool` | No | `False` | Enable Model Router globally for all requests |
| `optimize` | `bool` | No | `True` | Enable Context Optimizer globally (Pro+) |
| `default_headers` | `dict` | No | `{}` | Extra HTTP headers added to every request |

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

## `client.complete()`

Send a completion request through GateCtr.

```python
response = client.complete(
    model="gpt-4o",        # model name or "auto" for Model Router
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
    temperature=0.7,       # optional: sampling temperature (0–2)
    max_tokens=1024,       # optional: max completion tokens
    gatectr={
        "optimize": True,      # optional: enable Context Optimizer (default: True, Pro+)
        "route": False,        # optional: enable Model Router (default: False, Pro+)
        "budget_id": "proj_123",  # optional: override project budget
    },
)

print(response.choices[0].message.content)
print(response.gatectr["tokens_saved"])   # tokens saved by optimizer
print(response.gatectr["cost_usd"])       # estimated cost in USD
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `str` | Completion ID |
| `model` | `str` | Model used |
| `choices[].message.content` | `str` | Assistant reply |
| `choices[].finish_reason` | `str` | `"stop"`, `"length"`, or `"content_filter"` |
| `usage.prompt_tokens` | `int` | Prompt tokens sent |
| `usage.completion_tokens` | `int` | Completion tokens received |
| `usage.total_tokens` | `int` | Total tokens |
| `gatectr.optimized` | `bool` | Whether Context Optimizer ran |
| `gatectr.original_tokens` | `int` | Token count before optimization |
| `gatectr.tokens_saved` | `int` | Tokens removed by optimizer |
| `gatectr.compression_ratio` | `float` | Fraction of tokens saved |
| `gatectr.model_used` | `str` | Actual model used |
| `gatectr.cost_usd` | `float` | Estimated cost in USD |

## `client.stream()`

Stream completion responses chunk by chunk.

```python
for chunk in client.stream(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a haiku about code."}],
):
    print(chunk.delta or "", end="", flush=True)
```

### Stream with context manager

```python
with client.stream(model="gpt-4o", messages=messages) as stream:
    for chunk in stream:
        print(chunk.delta or "", end="", flush=True)
    # Access final usage after stream ends
    final_usage = stream.get_final_usage()
    print(f"\nTokens saved: {final_usage.gatectr['tokens_saved']}")
```

## Async support

Use `AsyncGateCtr` for async/await workflows:

```python
import asyncio
import os
from gatectr import AsyncGateCtr

client = AsyncGateCtr(api_key=os.environ["GATECTR_API_KEY"])

async def main():
    response = await client.complete(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello"}],
    )
    print(response.choices[0].message.content)

asyncio.run(main())
```

### Async streaming

```python
async def stream_response():
    async for chunk in client.stream(model="gpt-4o", messages=messages):
        print(chunk.delta or "", end="", flush=True)
```

## `client.usage()`

Query token usage and cost analytics for a project.

```python
usage = client.usage(
    project_id="proj_123",
    from_date="2025-01-01",
    to_date="2025-01-31",
    group_by="model",    # optional: "model" | "day" | "project"
)

print(usage["total_tokens"])
print(usage["total_cost_usd"])
print(usage["by_model"])
```

## Error handling

The SDK raises typed exceptions you can catch and handle:

```python
from gatectr.exceptions import (
    GateCtrError,
    AuthenticationError,
    BudgetExceededError,
    ValidationError,
    ProviderError,
)

try:
    response = client.complete(model="gpt-4o", messages=messages)
except AuthenticationError:
    # HTTP 401 — invalid or missing API key
    print("Check your GATECTR_API_KEY")
except BudgetExceededError as e:
    # HTTP 429 — project budget limit reached
    print(f"Budget exceeded for project {e.project_id}")
    print(f"Limit: {e.limit}, Used: {e.used}")
except ValidationError as e:
    # HTTP 422 — invalid request parameters
    print(f"Invalid request: {e}")
except ProviderError as e:
    # HTTP 502 — LLM provider returned an error
    print(f"Provider error ({e.provider}): {e}")
except GateCtrError as e:
    # Generic GateCtr error
    print(f"GateCtr error {e.status}: {e}")
```

### Exception attributes

```python
class GateCtrError(Exception):
    status: int        # HTTP status code
    code: str          # machine-readable error code
    request_id: str    # request ID for support

class BudgetExceededError(GateCtrError):
    project_id: str
    limit: int
    used: int
    period: str        # "day", "month", or "total"

class ProviderError(GateCtrError):
    provider: str      # e.g. "openai", "anthropic"
```

## Retry configuration

The SDK automatically retries on `429` (rate limit) and `5xx` errors with exponential backoff:

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    max_retries=3,   # default: 2. Set to 0 to disable retries
)

# Override per request
response = client.complete(
    model="gpt-4o",
    messages=messages,
    max_retries=0,   # no retries for this request
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
