---
id: python
title: SDK Python
description: Référence complète du SDK Python GateCtr (gatectr-sdk). Installez avec pip ou uv, faites des completions, streamez, utilisez l'async, et remplacez le SDK OpenAI ou LangChain.
keywords: [SDK Python, pip, async, compatible OpenAI, LangChain, SDK LLM]
sidebar_label: Python
---

# SDK Python

Référence complète pour `gatectr-sdk`.

## Installation

```bash
pip install gatectr-sdk
# ou
uv add gatectr-sdk
```

## Initialisation

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

## `client.complete()`

```python
response = client.complete(
    model="gpt-4o",        # nom du modèle ou "auto"
    messages=[...],         # messages compatibles OpenAI
    gatectr={
        "optimize": True,   # défaut: True (Pro+)
        "route": False,     # défaut: False (Pro+)
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

## Remplacement du SDK OpenAI

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
)
```

## Remplacement LangChain

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
    model="gpt-4o",
)
```

## Référence complète

[github.com/GateCtr/sdk-python](https://github.com/GateCtr/sdk-python)
