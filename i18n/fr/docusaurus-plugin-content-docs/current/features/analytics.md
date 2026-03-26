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
|---------|------|-------------|
| `tokens_in` | `number` | Tokens de prompt envoyés au LLM |
| `tokens_out` | `number` | Tokens de completion reçus |
| `tokens_saved` | `number` | Tokens supprimés par l'Optimiseur de Contexte |
| `original_tokens` | `number` | Nombre de tokens avant optimisation |
| `cost_usd` | `number` | Coût estimé de la requête en USD |
| `model` | `string` | Modèle ayant traité la requête |
| `model_requested` | `string` | Modèle spécifié dans la requête |
| `latency_ms` | `number` | Latence de bout en bout en millisecondes |
| `project_id` | `string` | Projet auquel appartient la requête |
| `timestamp` | `string` | Horodatage UTC (ISO 8601) |
| `optimized` | `boolean` | Si l'Optimiseur de Contexte s'est exécuté |
| `routed` | `boolean` | Si le Routeur de Modèles a sélectionné le modèle |

## Tableau de bord

Consultez votre utilisation sur [app.gatectr.com](https://app.gatectr.com) :

- **Vue d'ensemble** — total des tokens, coût total, requêtes/jour pour tous les projets
- **Par projet** — détail des coûts et tokens par projet
- **Par modèle** — coût par modèle pour identifier les charges les plus coûteuses
- **Tendances** — graphiques 7j / 30j / 90j avec trajectoire des coûts
- **Économies d'optimisation** — tokens et coûts économisés par l'Optimiseur de Contexte

## Requête via API

<Tabs>
  <TabItem value="curl" label="cURL" default>

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "project_id=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-31" \
  --data-urlencode "group_by=model"
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
  groupBy: 'model',
});

console.log(`Coût total : $${usage.total_cost_usd}`);
console.log(`Tokens économisés par l'optimiseur : ${usage.tokens_saved}`);
```

  </TabItem>
  <TabItem value="python" label="Python">

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

  </TabItem>
</Tabs>

### Réponse

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

Consultez la référence complète de [GET /v1/usage](../api-reference/usage.md) pour tous les paramètres et options de groupement.

## Accéder aux analytiques dans votre application

Récupérez les données d'utilisation par programmation pour créer des tableaux de bord internes, déclencher des alertes ou générer des rapports :

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const daily = await client.usage({
  projectId: 'proj_123',
  from: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  groupBy: 'day',
});

if (daily.total_cost_usd > 5) {
  console.warn(`Dépenses élevées détectées : $${daily.total_cost_usd} aujourd'hui`);
}
```

## Export

Exportez les données d'utilisation en CSV depuis le tableau de bord : **Analytiques → Exporter**.

Disponible sur le forfait Team et supérieur.

## Rétention

| Forfait | Rétention |
|---------|-----------|
| Gratuit | 7 jours |
| Pro | 30 jours |
| Team | 90 jours |
| Entreprise | Personnalisée (jusqu'à illimitée) |
