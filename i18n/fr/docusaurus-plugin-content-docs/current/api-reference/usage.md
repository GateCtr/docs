---
id: usage
title: GET /v1/usage
description: Interrogez les données d'utilisation des tokens, les coûts et les analytiques pour vos projets GateCtr via l'endpoint API /v1/usage.
keywords: [API d'utilisation, utilisation des tokens, analytiques de coûts, facturation, référence API]
sidebar_label: GET /v1/usage
---

# GET /v1/usage

Interrogez les métriques d'utilisation des tokens et de coûts pour vos projets GateCtr.

## Endpoint

```
GET https://api.gatectr.com/v1/usage
```

## En-têtes

| En-tête | Valeur | Requis |
|---------|--------|--------|
| `Authorization` | `Bearer <votre-clé-api>` | Oui |

## Paramètres de requête

| Paramètre | Type | Requis | Défaut | Description |
|-----------|------|--------|--------|-------------|
| `projectId` | `string` | Non | — | Filtrer par ID de projet. Omettez pour obtenir l'agrégé de tous les projets |
| `from` | `string` | Non | Il y a 30 jours | Début de la période (format YYYY-MM-DD) |
| `to` | `string` | Non | Aujourd'hui | Fin de la période (format YYYY-MM-DD) |

## Exemple de requête

```bash
curl "https://api.gatectr.com/v1/usage?projectId=proj_123&from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

## Réponse

```json
{
  "totalTokens": 4820000,
  "totalRequests": 12400,
  "totalCostUsd": 14.23,
  "savedTokens": 1920000,
  "from": "2025-01-01",
  "to": "2025-01-31",
  "byProject": [
    {
      "projectId": "proj_123",
      "totalTokens": 2900000,
      "totalRequests": 7400,
      "totalCostUsd": 8.55
    },
    {
      "projectId": "proj_456",
      "totalTokens": 1920000,
      "totalRequests": 5000,
      "totalCostUsd": 5.68
    }
  ]
}
```

### Champs de la réponse

| Champ | Type | Description |
|-------|------|-------------|
| `totalTokens` | `number` | Total des tokens utilisés (prompt + completion) dans la période |
| `totalRequests` | `number` | Nombre total de requêtes dans la période |
| `totalCostUsd` | `number` | Coût total estimé en USD |
| `savedTokens` | `number` | Tokens économisés par l'Optimiseur de Contexte |
| `from` | `string` | Début de la période interrogée |
| `to` | `string` | Fin de la période interrogée |
| `byProject` | `array` | Utilisation détaillée par projet |

Chaque entrée dans `byProject` :

| Champ | Type | Description |
|-------|------|-------------|
| `projectId` | `string \| null` | ID du projet (null pour les requêtes sans projet) |
| `totalTokens` | `number` | Tokens utilisés par ce projet |
| `totalRequests` | `number` | Requêtes de ce projet |
| `totalCostUsd` | `number` | Coût estimé pour ce projet |

## Exemples SDK

### Node.js

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const usage = await client.usage({
  projectId: 'proj_123',
  from: '2025-01-01',
  to: '2025-01-31',
});

console.log(`Coût total : $${usage.totalCostUsd}`);
console.log(`Tokens économisés : ${usage.savedTokens}`);
console.log(`Requêtes totales : ${usage.totalRequests}`);
console.log('Par projet :', usage.byProject);
```

### Python

```python
import os
from gatectr import GateCtr
from gatectr.types import UsageParams

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

usage = await client.usage(UsageParams(
    project_id="proj_123",
    from_="2025-01-01",
    to="2025-01-31",
))

print(f"Coût total : ${usage.total_cost_usd}")
print(f"Tokens économisés : {usage.saved_tokens}")
print(f"Requêtes totales : {usage.total_requests}")
for p in usage.by_project:
    print(f"  {p.project_id} : {p.total_tokens} tokens, ${p.total_cost_usd}")
```

## Réponses d'erreur

| Statut | Description |
|--------|-------------|
| `400` | Paramètres de requête invalides (ex. format de date incorrect) |
| `401` | Clé API invalide ou manquante |
| `403` | Accès refusé pour le projet spécifié |
