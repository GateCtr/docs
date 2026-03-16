# Python SDK

Full reference for `gatectr-sdk`.

## Install

```bash
pip install gatectr-sdk
# or
uv add gatectr-sdk
```

## Initialize

```python
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

## `client.complete()`

```python
response = client.complete(
    model="gpt-4o",        # model name or "auto"
    messages=[...],         # OpenAI-compatible messages
    gatectr={
        "optimize": True,   # default: True (Pro+)
        "route": False,     # default: False (Pro+)
        "budget_id": "proj_123",
    }
)
```

## `client.stream()`

```python
for chunk in client.stream(model="gpt-4o", messages=messages):
    print(chunk.delta or "", end="", flush=True)
```

## Async

```python
from gatectr import AsyncGateCtr

client = AsyncGateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = await client.complete(model="gpt-4o", messages=messages)
```

## `client.usage()`

```python
usage = client.usage(
    project_id="proj_123",
    from_date="2025-01-01",
    to_date="2025-01-31",
)
```

## Drop-in for OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
)
```

## Drop-in for LangChain

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
    model="gpt-4o",
)
```

## Full reference

[github.com/GateCtr/sdk-python](https://github.com/GateCtr/sdk-python)
