---
id: usage
title: GET /v1/usage
description: Interrogez les données d'utilisation des tokens, les coûts et les analytiques pour vos projets GateCtr via l'endpoint API /v1/usage.
keywords: [API d'utilisation, utilisation des tokens, analytiques de coûts, facturation, référence API]
sidebar_label: GET /v1/usage
---

# GET /v1/usage

Interrogez les données d'utilisation des tokens et de coûts pour un projet.

## Endpoint

```
GET https://api.gatectr.com/v1/usage
```

## En-têtes

| En-tête | Valeur | Requis |
|---------|--------|--------|
| `Authorization` | `Bearer <votre-clé-api>` | Oui |

## Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `project_id` | `string` | Non | Filtrer par identifiant de projet (ex. `proj_123`) |
| `from` | `string` | Non | Date de début en ISO 8601 (ex. `2025-01-01`) |
| `to` | `string` | Non | Date de fin en ISO 8601 (ex. `2025-01-31`) |
| `group_by` | `string` | Non | Agréger les résultats par : `model` \| `day` \| `project` |
| `model` | `string` | Non | Filtrer par modèle spécifique (ex. `gpt-4o`) |
| `limit` | `number` | Non | Nombre maximum d'enregistrements (défaut : `100`, max : `1000`) |
| `offset` | `number` | Non | Décalage pour la pagination (défaut : `0`) |

## Exemples de requêtes

### Tous les projets, mois dernier

```bash
curl "https://api.gatectr.com/v1/usage?from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

### Projet unique, groupé par modèle

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "project_id=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-31" \
  --data-urlencode "group_by=model"
```

### Projet unique, groupé par jour

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "project_id=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-07" \
  --data-urlencode "group_by=day"
```

## Réponse

### Réponse par défaut (sans `group_by`)

```json
{
  "total_tokens": 4820000,
  "total_cost_usd": 14.23,
  "tokens_saved": 1920000,
  "requests": 12400,
  "prompt_tokens": 3100000,
  "completion_tokens": 1720000,
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  }
}
```

### Réponse groupée par modèle (`group_by=model`)

```json
{
  "total_tokens": 4820000,
  "total_cost_usd": 14.23,
  "tokens_saved": 1920000,
  "requests": 12400,
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  },
  "by_model": {
    "gpt-4o": {
      "tokens": 2100000,
      "cost_usd": 10.50,
      "requests": 5200,
      "tokens_saved": 840000
    },
    "gpt-3.5-turbo": {
      "tokens": 2720000,
      "cost_usd": 3.73,
      "requests": 7200,
      "tokens_saved": 1080000
    }
  }
}
```

### Réponse groupée par jour (`group_by=day`)

```json
{
  "total_tokens": 980000,
  "total_cost_usd": 2.89,
  "tokens_saved": 392000,
  "requests": 2480,
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-07"
  },
  "by_day": {
    "2025-01-01": { "tokens": 140000, "cost_usd": 0.41, "requests": 354 },
    "2025-01-02": { "tokens": 152000, "cost_usd": 0.45, "requests": 385 },
    "2025-01-03": { "tokens": 138000, "cost_usd": 0.40, "requests": 349 }
  }
}
```

### Réponse groupée par projet (`group_by=project`)

```json
{
  "total_tokens": 4820000,
  "total_cost_usd": 14.23,
  "by_project": {
    "proj_123": { "tokens": 2900000, "cost_usd": 8.55, "requests": 7400 },
    "proj_456": { "tokens": 1920000, "cost_usd": 5.68, "requests": 5000 }
  }
}
```

### Champs de la réponse

| Champ | Type | Description |
|-------|------|-------------|
| `total_tokens` | `number` | Total des tokens utilisés dans la période |
| `total_cost_usd` | `number` | Coût total estimé en USD |
| `tokens_saved` | `number` | Tokens supprimés par l'Optimiseur de Contexte |
| `requests` | `number` | Nombre total de requêtes |
| `prompt_tokens` | `number` | Tokens de prompt dans toutes les requêtes |
| `completion_tokens` | `number` | Tokens de completion dans toutes les requêtes |
| `period.from` | `string` | Début de la période interrogée |
| `period.to` | `string` | Fin de la période interrogée |
| `by_model` | `object` | Détail par modèle (avec `group_by=model`) |
| `by_day` | `object` | Détail par jour (avec `group_by=day`) |
| `by_project` | `object` | Détail par projet (avec `group_by=project`) |

## Exemples SDK

### Node.js

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const usage = await client.usage({
  projectId: 'proj_123',
  from: '2025-01-01',
  to: '2025-01-31',
  groupBy: 'model',
});

console.log(`Coût total : $${usage.total_cost_usd}`);
console.log(`Tokens économisés : ${usage.tokens_saved}`);
```

### Python

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

usage = client.usage(
    project_id="proj_123",
    from_date="2025-01-01",
    to_date="2025-01-31",
    group_by="model",
)

print(f"Coût total : ${usage['total_cost_usd']}")
print(f"Tokens économisés : {usage['tokens_saved']}")
```

## Réponses d'erreur

| Statut | Type | Description |
|--------|------|-------------|
| `400` | `bad_request` | Plage de dates invalide ou valeur `group_by` inconnue |
| `401` | `unauthorized` | Clé API invalide ou manquante |
| `403` | `forbidden` | La clé API n'a pas accès au projet demandé |
