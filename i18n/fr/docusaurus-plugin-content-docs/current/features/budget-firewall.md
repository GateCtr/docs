---
id: budget-firewall
title: Pare-feu Budgétaire
description: Définissez des plafonds stricts de tokens et de coûts par projet avec le Pare-feu Budgétaire de GateCtr. Bloquez les requêtes dès qu'une limite est atteinte — plus de factures surprises.
keywords: [pare-feu budgétaire, contrôle des coûts, limite de tokens, plafond LLM, alertes budget, webhooks]
sidebar_label: Pare-feu Budgétaire
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pare-feu Budgétaire

Plafonds stricts par projet. Plus de factures surprises.

## Comment ça fonctionne

Chaque requête passe par le Pare-feu Budgétaire avant d'atteindre le LLM. Si le budget du projet est dépassé, la requête est bloquée et un `429` est retourné immédiatement. Aucun token n'est consommé. Aucun coût n'est engagé.

```
Requête → Vérification Pare-feu Budgétaire
  ├─ En dessous de la limite → envoi au LLM → réponse
  └─ Au-dessus de la limite → 429 Budget Dépassé (aucun appel LLM)
```

## Définir un budget

### Via le tableau de bord

Allez dans **Projets → Votre projet → Budget** dans le [tableau de bord GateCtr](https://app.gatectr.com).

### Via l'API

```bash
curl -X PATCH https://api.gatectr.com/v1/budget \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "limit_tokens": 100000,
    "period": "day"
  }'
```

## Types de budget

| Type | Champ | Description |
|------|-------|-------------|
| Plafond de tokens | `limit_tokens` | Plafond sur le total des tokens (prompt + completion) |
| Plafond de coût | `limit_cost_usd` | Plafond sur le coût estimé en USD |

Vous pouvez définir les deux — le premier atteint déclenche le blocage.

```json
{
  "project_id": "proj_123",
  "limit_tokens": 500000,
  "limit_cost_usd": 10.00,
  "period": "month"
}
```

## Périodes

| Période | Description | Réinitialisation |
|---------|-------------|-----------------|
| `day` | Plafond journalier | Minuit UTC |
| `month` | Plafond mensuel | 1er du mois, minuit UTC |
| `total` | Plafond à vie | Jamais — doit être réinitialisé manuellement |

## Alertes douces

Définissez un seuil pour recevoir un webhook avant d'atteindre le plafond dur :

```json
{
  "project_id": "proj_123",
  "limit_tokens": 100000,
  "period": "day",
  "alert_at_percent": 80
}
```

À 80% d'utilisation (80 000 tokens), GateCtr déclenche un webhook `budget.threshold_reached`. Le blocage dur se produit toujours à 100%.

Voir [Webhooks](./webhooks.md) pour configurer où les alertes sont livrées.

## Remplacer le budget par requête

Utilisez `budgetId` pour appliquer un budget différent à une requête spécifique :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({
  model: 'gpt-4o',
  messages,
  gatectr: {
    budgetId: 'proj_456',   // utiliser le budget d'un autre projet
  },
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
from gatectr.types import PerRequestOptions

response = await client.complete(
    model="gpt-4o",
    messages=messages,
    gatectr=PerRequestOptions(budget_id="proj_456"),
)
```

  </TabItem>
</Tabs>

## Réponse de requête bloquée

Quand une requête est bloquée par le Pare-feu Budgétaire, GateCtr retourne :

**Statut HTTP :** `429 Too Many Requests`

```json
{
  "error": {
    "type": "budget_exceeded",
    "message": "Requête bloquée. Limite budgétaire atteinte.",
    "request_id": "req_xyz789"
  }
}
```

### Gérer dans le code

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtrApiError } from '@gatectr/sdk';

try {
  const response = await client.complete({ model: 'gpt-4o', messages });
} catch (err) {
  if (err instanceof GateCtrApiError && err.code === 'budget_exceeded') {
    console.warn(`Budget dépassé. ID de requête : ${err.requestId}`);
    // Notifier l'équipe, mettre la requête en file d'attente, etc.
  }
}
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
from gatectr import GateCtrApiError

try:
    response = await client.complete(model="gpt-4o", messages=messages)
except GateCtrApiError as e:
    if e.code == "budget_exceeded":
        print(f"Budget dépassé. ID de requête : {e.request_id}")
        # Notifier l'équipe, mettre la requête en file d'attente, etc.
```

  </TabItem>
</Tabs>

## Vérifier l'utilisation actuelle

```bash
curl "https://api.gatectr.com/v1/usage?projectId=proj_123" \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

La réponse inclut `totalTokens` et `totalCostUsd` pour suivre votre proximité à la limite.

## Événements Webhook

GateCtr déclenche ces événements webhook pour l'activité budgétaire :

| Événement | Déclencheur |
|-----------|-------------|
| `budget.threshold_reached` | L'utilisation a dépassé le seuil d'alerte configuré (ex. 80%) |
| `budget.exceeded` | Plafond dur atteint — les requêtes sont maintenant bloquées |

Voir [Webhooks](./webhooks.md) pour les instructions de configuration et les détails des payloads.

## Disponible sur

Forfait Free et supérieur.
