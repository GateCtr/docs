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

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <votre-clé-api>` |

## Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `project_id` | `string` | Non | Filtrer par projet |
| `from` | `string` | Non | Date de début (ISO 8601 : `2025-01-01`) |
| `to` | `string` | Non | Date de fin (ISO 8601 : `2025-01-31`) |
| `group_by` | `string` | Non | `model` \| `day` \| `project` |

## Exemple de requête

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "project_id=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-31" \
  --data-urlencode "group_by=model"
```

## Réponse

```json
{
  "total_tokens": 4820000,
  "total_cost_usd": 14.23,
  "tokens_saved": 1920000,
  "requests": 12400,
  "by_model": {
    "gpt-4o": { "tokens": 2100000, "cost_usd": 10.50 },
    "gpt-3.5-turbo": { "tokens": 2720000, "cost_usd": 3.73 }
  }
}
```

## Réponses d'erreur

| Statut | Description |
|--------|-------------|
| `401` | Clé API invalide ou manquante |
| `400` | Plage de dates ou paramètres invalides |
