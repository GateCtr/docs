---
id: analytics
title: Analytiques
description: GateCtr trace chaque token, coût, modèle et latence en temps réel. Interrogez les données d'utilisation via l'API ou explorez-les dans le tableau de bord.
keywords: [analytiques, utilisation des tokens, suivi des coûts, observabilité LLM, tableau de bord]
sidebar_label: Analytiques
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Analytiques

Chaque token. Chaque coût. En temps réel.

## Ce qui est suivi

Chaque requête via GateCtr est enregistrée automatiquement :

| Métrique | Type | Description |
|----------|------|-------------|
| `prompt_tokens` | `number` | Tokens de prompt envoyés au LLM |
| `completion_tokens` | `number` | Tokens de completion reçus |
| `saved_tokens` | `number` | Tokens supprimés par l'Optimiseur de Contexte |
| `model` | `string` | Modèle qui a traité la requête |
| `latency_ms` | `number` | Latence bout-en-bout en millisecondes |
| `project_id` | `string` | Projet auquel appartient la requête |
| `timestamp` | `string` | Timestamp UTC (ISO 8601) |
| `overage` | `boolean` | Si la requête a dépassé votre plafond budgétaire |

## Tableau de bord

Visualisez votre utilisation sur [app.gatectr.com](https://app.gatectr.com) :

- **Vue d'ensemble** — tokens totaux, coût total, requêtes/jour tous projets confondus
- **Par projet** — détail des coûts et tokens par projet
- **Tendances** — graphiques 7j / 30j / 90j avec trajectoire de coûts
- **Économies d'optimisation** — tokens et coûts économisés par l'Optimiseur de Contexte

## Interroger via l'API

<Tabs>
  <TabItem value="curl" label="cURL" default>

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "projectId=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-31"
```

  </TabItem>
  <TabItem value="nodejs" label="Node.js">

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
```

  </TabItem>
  <TabItem value="python" label="Python">

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
```

  </TabItem>
</Tabs>

### Réponse

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

Voir la [référence complète GET /v1/usage](../api-reference/usage.md) pour tous les paramètres.

## Accéder aux analytiques dans votre application

Vous pouvez récupérer les données d'utilisation de manière programmatique pour construire des tableaux de bord de coûts internes, déclencher des alertes ou générer des rapports :

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

// Rapport de coût quotidien
const daily = await client.usage({
  projectId: 'proj_123',
  from: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
});

if (daily.totalCostUsd > 5) {
  // Envoyer une alerte Slack, email, etc.
  console.warn(`Dépense élevée détectée : $${daily.totalCostUsd} aujourd'hui`);
}
```

## Export

Exportez les données d'utilisation en CSV depuis le tableau de bord : **Analytiques → Exporter**.

Disponible sur le forfait Team et supérieur.

## Rétention

| Forfait | Rétention |
|---------|-----------|
| Free | 7 jours |
| Pro | 30 jours |
| Team | 90 jours |
| Enterprise | Personnalisé (jusqu'à illimité) |
