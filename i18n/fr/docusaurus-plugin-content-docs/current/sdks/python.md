---
id: python
title: SDK Python
description: Référence complète du SDK Python GateCtr (gatectr-sdk). Installez avec pip ou uv, faites des completions, streamez, utilisez l'async, gérez les erreurs et remplacez le SDK OpenAI ou LangChain.
keywords: [SDK Python, pip, async, compatible OpenAI, LangChain, SDK LLM, streaming, gestion des erreurs]
sidebar_label: Python
---

# SDK Python

Référence complète pour `gatectr-sdk` — le SDK Python officiel de GateCtr.

## Installation

```bash
pip install gatectr-sdk
# ou
uv add gatectr-sdk
```

Nécessite Python 3.9+.

## Initialisation

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

### Options du constructeur

| Option | Type | Requis | Défaut | Description |
|--------|------|--------|--------|-------------|
| `api_key` | `str` | Oui | — | Votre clé API GateCtr (`gct_live_…` ou `gct_test_…`) |
| `base_url` | `str` | Non | `https://api.gatectr.com/v1` | Remplacer l'URL de base |
| `timeout` | `float` | Non | `30.0` | Délai d'expiration en secondes |
| `max_retries` | `int` | Non | `2` | Nombre de tentatives automatiques |
| `route` | `bool` | Non | `False` | Activer le Routeur de Modèles globalement |
| `optimize` | `bool` | Non | `True` | Activer l'Optimiseur de Contexte globalement (Pro+) |
| `default_headers` | `dict` | Non | `{}` | En-têtes HTTP supplémentaires ajoutés à chaque requête |

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

Envoyez une requête de completion via GateCtr.

```python
response = client.complete(
    model="gpt-4o",        # nom du modèle ou "auto" pour le Routeur de Modèles
    messages=[
        {"role": "system", "content": "Vous êtes un assistant utile."},
        {"role": "user", "content": "Quelle est la capitale de la France ?"},
    ],
    temperature=0.7,       # optionnel : température d'échantillonnage (0–2)
    max_tokens=1024,       # optionnel : tokens de completion maximum
    gatectr={
        "optimize": True,          # optionnel : activer l'Optimiseur de Contexte (défaut: True, Pro+)
        "route": False,            # optionnel : activer le Routeur de Modèles (défaut: False, Pro+)
        "budget_id": "proj_123",   # optionnel : remplacer le budget du projet
    },
)

print(response.choices[0].message.content)
print(response.gatectr["tokens_saved"])   # tokens économisés par l'optimiseur
print(response.gatectr["cost_usd"])       # coût estimé en USD
```

### Champs de la réponse

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `str` | ID de la completion |
| `model` | `str` | Modèle utilisé |
| `choices[].message.content` | `str` | Réponse de l'assistant |
| `choices[].finish_reason` | `str` | `"stop"`, `"length"`, ou `"content_filter"` |
| `usage.prompt_tokens` | `int` | Tokens de prompt envoyés |
| `usage.completion_tokens` | `int` | Tokens de completion reçus |
| `usage.total_tokens` | `int` | Total des tokens |
| `gatectr.optimized` | `bool` | Si l'Optimiseur de Contexte s'est exécuté |
| `gatectr.original_tokens` | `int` | Nombre de tokens avant optimisation |
| `gatectr.tokens_saved` | `int` | Tokens supprimés par l'optimiseur |
| `gatectr.compression_ratio` | `float` | Part des tokens économisés |
| `gatectr.model_used` | `str` | Modèle réellement utilisé |
| `gatectr.cost_usd` | `float` | Coût estimé en USD |

## `client.stream()`

Recevez les réponses en streaming chunk par chunk.

```python
for chunk in client.stream(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Écris un haïku sur le code."}],
):
    print(chunk.delta or "", end="", flush=True)
```

### Stream avec gestionnaire de contexte

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

with client.stream(model="gpt-4o", messages=messages) as stream:
    for chunk in stream:
        print(chunk.delta or "", end="", flush=True)
    # Accéder à l'utilisation finale après la fin du stream
    final_usage = stream.get_final_usage()
    print(f"\nTokens économisés : {final_usage.gatectr['tokens_saved']}")
```

## Async support

Utilisez `AsyncGateCtr` pour les workflows async/await :

```python
import asyncio
import os
from gatectr import AsyncGateCtr

client = AsyncGateCtr(api_key=os.environ["GATECTR_API_KEY"])

async def main():
    response = await client.complete(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Bonjour"}],
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

Interrogez les statistiques d'utilisation des tokens et de coûts.

```python
usage = client.usage(
    project_id="proj_123",
    from_date="2025-01-01",
    to_date="2025-01-31",
    group_by="model",    # optionnel: "model" | "day" | "project"
)

print(usage["total_tokens"])
print(usage["total_cost_usd"])
print(usage["by_model"])
```

## Gestion des erreurs

Le SDK lève des exceptions typées que vous pouvez attraper et gérer :

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
    # HTTP 401 — clé API invalide ou manquante
    print("Vérifiez votre GATECTR_API_KEY")
except BudgetExceededError as e:
    # HTTP 429 — limite budgétaire du projet atteinte
    print(f"Budget dépassé pour le projet {e.project_id}")
    print(f"Limite : {e.limit}, Utilisé : {e.used}")
except ValidationError as e:
    # HTTP 422 — paramètres de requête invalides
    print(f"Requête invalide : {e}")
except ProviderError as e:
    # HTTP 502 — le fournisseur LLM a renvoyé une erreur
    print(f"Erreur fournisseur ({e.provider}) : {e}")
except GateCtrError as e:
    # Erreur GateCtr générique
    print(f"Erreur GateCtr {e.status} : {e}")
```

### Attributs des exceptions

```python
class GateCtrError(Exception):
    status: int        # code de statut HTTP
    code: str          # code d'erreur lisible par machine
    request_id: str    # ID de requête pour le support

class BudgetExceededError(GateCtrError):
    project_id: str
    limit: int
    used: int
    period: str        # "day", "month", ou "total"

class ProviderError(GateCtrError):
    provider: str      # ex. "openai", "anthropic"
```

## Configuration des tentatives

Le SDK réessaie automatiquement en cas d'erreurs `429` (limite de débit) et `5xx` avec un recul exponentiel :

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    max_retries=3,   # défaut: 2. Mettez 0 pour désactiver les tentatives
)

# Remplacer par requête
response = client.complete(
    model="gpt-4o",
    messages=messages,
    max_retries=0,   # aucune tentative pour cette requête
)
```

## Remplacement du SDK OpenAI

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
)

# Tous les appels SDK OpenAI existants fonctionnent sans modification
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Bonjour"}],
)
```

GateCtr injecte l'optimisation, le routage et l'application du budget de manière transparente.

## Remplacement LangChain

```python
import os
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
    model="gpt-4o",
)

response = llm.invoke("Quelle est la capitale de la France ?")
```

## Remplacement LlamaIndex

```python
import os
from llama_index.llms.openai import OpenAI

llm = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    api_base="https://api.gatectr.com/v1",
    model="gpt-4o",
)
```

## Exemples

Des exemples complets sont disponibles dans le [dépôt d'exemples GateCtr](https://github.com/GateCtr/examples) :

- Completion basique
- Streaming async
- Applications avec contrôle budgétaire
- Intégration LangChain
- Intégration FastAPI

## Référence complète

[github.com/GateCtr/sdk-python](https://github.com/GateCtr/sdk-python)
