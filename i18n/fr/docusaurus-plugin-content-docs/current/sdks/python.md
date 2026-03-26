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
| `max_retries` | `int` | Non | `3` | Nombre de tentatives automatiques sur erreurs transitoires |
| `route` | `bool` | Non | `False` | Activer le Routeur de Modèles globalement |
| `optimize` | `bool` | Non | `True` | Activer l'Optimiseur de Contexte globalement (Pro+) |

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

Completion de texte — POST /complete.

```python
from gatectr.types import PerRequestOptions

response = await client.complete(
    model="gpt-4o",        # nom du modèle ou "auto" pour le Routeur de Modèles
    messages=[
        {"role": "system", "content": "Vous êtes un assistant utile."},
        {"role": "user", "content": "Quelle est la capitale de la France ?"},
    ],
    temperature=0.7,       # optionnel : température d'échantillonnage (0–2)
    max_tokens=1024,       # optionnel : tokens de completion maximum
    gatectr=PerRequestOptions(
        optimize=True,         # optionnel : activer l'Optimiseur de Contexte (défaut: True, Pro+)
        route=False,           # optionnel : activer le Routeur de Modèles (défaut: False, Pro+)
        budget_id="proj_123",  # optionnel : remplacer le budget du projet
    ),
)

print(response.choices[0].text)
print(response.gatectr.tokens_saved)  # tokens économisés par l'optimiseur
print(response.gatectr.model_used)    # modèle qui a traité la requête
```

### Champs de la réponse

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `str` | ID de la completion |
| `object` | `str` | Toujours `"text_completion"` |
| `model` | `str` | Modèle utilisé |
| `choices[].text` | `str` | Le texte de completion |
| `choices[].finish_reason` | `str` | `"stop"`, `"length"`, ou `"content_filter"` |
| `usage.prompt_tokens` | `int` | Tokens de prompt envoyés |
| `usage.completion_tokens` | `int` | Tokens de completion reçus |
| `usage.total_tokens` | `int` | Total des tokens |
| `gatectr.request_id` | `str` | ID unique de la requête — pour les tickets de support |
| `gatectr.latency_ms` | `int` | Latence bout-en-bout mesurée par GateCtr |
| `gatectr.overage` | `bool` | Si la requête a dépassé le plafond budgétaire |
| `gatectr.model_used` | `str` | Modèle réellement utilisé (peut différer si routé) |
| `gatectr.tokens_saved` | `int` | Tokens économisés par l'Optimiseur de Contexte (0 si désactivé) |

## `client.chat()`

Completion de chat — POST /chat. Retourne les messages au format `choices[].message`.

```python
response = await client.chat(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Vous êtes un assistant utile."},
        {"role": "user", "content": "Quelle est la capitale de la France ?"},
    ],
    max_tokens=1024,
)

print(response.choices[0].message.content)
print(response.choices[0].message.role)   # "assistant"
```

### Champs de la réponse

| Champ | Type | Description |
|-------|------|-------------|
| `object` | `str` | Toujours `"chat.completion"` |
| `choices[].message.role` | `str` | Toujours `"assistant"` |
| `choices[].message.content` | `str` | La réponse de l'assistant |
| `choices[].finish_reason` | `str` | `"stop"`, `"length"`, ou `"content_filter"` |

## `client.stream()`

Streaming de chat — POST /chat avec `stream: true`. Retourne un itérateur asynchrone de `StreamChunk`.

```python
async for chunk in client.stream(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Écris un haïku sur le code."}],
):
    print(chunk.delta or "", end="", flush=True)
```

## Async support

Utilisez `GateCtr` pour les workflows async/await ou `SyncGateCtr` pour une utilisation synchrone :

```python
import asyncio
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

async def main():
    response = await client.complete(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Bonjour"}],
    )
    print(response.choices[0].text)

asyncio.run(main())
```

### Client synchrone

```python
from gatectr import SyncGateCtr

client = SyncGateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Bonjour"}],
)
print(response.choices[0].text)
```

### Streaming async

```python
async def stream_response():
    async for chunk in client.stream(model="gpt-4o", messages=messages):
        print(chunk.delta or "", end="", flush=True)
```

## `client.models()`

Liste les modèles disponibles — GET /models.

```python
result = await client.models()

for model in result.models:
    print(model.model_id, model.display_name, model.provider)
    print("Fenêtre de contexte :", model.context_window)
    print("Capacités :", model.capabilities)
```

## `client.usage()`

Interrogez les statistiques d'utilisation — GET /usage.

```python
from gatectr.types import UsageParams

usage = await client.usage(UsageParams(
    project_id="proj_123",   # optionnel : filtrer par ID de projet
    from_="2025-01-01",      # optionnel : date de début (YYYY-MM-DD)
    to="2025-01-31",         # optionnel : date de fin (YYYY-MM-DD)
))

print(usage.total_tokens)
print(usage.total_cost_usd)
print(usage.saved_tokens)
print(usage.by_project)     # détail par projet
```

### Champs de la réponse

| Champ | Type | Description |
|-------|------|-------------|
| `total_tokens` | `int` | Total des tokens utilisés dans la période |
| `total_requests` | `int` | Nombre total de requêtes |
| `total_cost_usd` | `float` | Coût total estimé en USD |
| `saved_tokens` | `int` | Tokens supprimés par l'Optimiseur de Contexte |
| `from_` | `str` | Début de la période interrogée |
| `to` | `str` | Fin de la période interrogée |
| `by_project` | `list` | Détail par projet |

Chaque entrée dans `by_project` :

| Champ | Type | Description |
|-------|------|-------------|
| `project_id` | `str \| None` | ID du projet |
| `total_tokens` | `int` | Tokens utilisés par ce projet |
| `total_requests` | `int` | Requêtes de ce projet |
| `total_cost_usd` | `float` | Coût de ce projet |

## Gestion des erreurs

Le SDK lève des exceptions typées que vous pouvez attraper et gérer :

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
        # HTTP 429 — limite budgétaire du projet atteinte
        print(f"Budget dépassé (request_id : {e.request_id})")
    elif e.status == 401:
        # HTTP 401 — clé API invalide ou manquante
        print("Vérifiez votre GATECTR_API_KEY")
    else:
        print(f"Erreur API {e.status} : {e.code} — {e}")
except GateCtrConfigError as e:
    # Erreur de configuration (ex. clé API manquante)
    print(f"Erreur de config : {e}")
except GateCtrTimeoutError as e:
    print(f"Délai dépassé après {e.timeout_s}s")
except GateCtrStreamError as e:
    print(f"Échec du stream : {e}")
except GateCtrNetworkError as e:
    print(f"Erreur réseau (DNS, connexion refusée) : {e}")
except GateCtrError as e:
    print(f"Erreur GateCtr : {e}")
```

### Attributs des exceptions

```python
class GateCtrError(Exception): ...

class GateCtrConfigError(GateCtrError): ...  # config invalide (ex. pas de clé API)

class GateCtrApiError(GateCtrError):
    status: int          # code de statut HTTP
    code: str            # code d'erreur lisible par machine (ex. "budget_exceeded")
    request_id: str | None  # ID de requête pour le support

class GateCtrTimeoutError(GateCtrError):
    timeout_s: float     # délai configuré en secondes

class GateCtrStreamError(GateCtrError): ...  # échec du stream

class GateCtrNetworkError(GateCtrError): ... # DNS, connexion refusée
```

## Configuration des tentatives

Le SDK réessaie automatiquement en cas d'erreurs `429` (limite de débit) et `5xx` avec un recul exponentiel :

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    max_retries=3,   # défaut : 3. Mettez 0 pour désactiver les tentatives
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
