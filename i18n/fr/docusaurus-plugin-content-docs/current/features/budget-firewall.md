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

Des plafonds stricts par projet. Plus de factures surprises.

## Comment ça fonctionne

Chaque requête passe par le Pare-feu Budgétaire avant d'atteindre le LLM. Si le budget du projet est dépassé, la requête est bloquée et un `429` est retourné immédiatement. Aucun token consommé. Aucun coût engagé.

```
Requête → Vérification du Pare-feu Budgétaire
  ├─ Sous la limite → transmission au LLM → réponse
  └─ Au-dessus     → 429 Budget Dépassé (aucun appel LLM effectué)
```

## Définir un budget

### Via le tableau de bord

Allez dans **Projets → Votre projet → Budget** dans le [tableau de bord GateCtr](https://app.gatectr.com).

### Via API

```bash
curl -X PATCH https://api.gatectr.com/v1/budget \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "limit_tokens": 100000,
    "period": "day",
    "alert_at_percent": 80
  }'
```

### Via SDK

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

await client.budget.set({
  projectId: 'proj_123',
  limitTokens: 100000,
  period: 'day',
  alertAtPercent: 80,
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

client.budget.set(
    project_id="proj_123",
    limit_tokens=100000,
    period="day",
    alert_at_percent=80,
)
```

  </TabItem>
</Tabs>

## Types de budget

| Type | Champ | Description |
|------|-------|-------------|
| Plafond en tokens | `limit_tokens` | Plafond sur le total de tokens (prompt + completion) |
| Plafond en coût | `limit_cost_usd` | Plafond sur le coût estimé en USD |

Vous pouvez définir les deux — celui qui est atteint en premier déclenche le blocage.

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

## Alertes préventives

Définissez un seuil pour recevoir un webhook avant d'atteindre le plafond strict :

```json
{
  "project_id": "proj_123",
  "limit_tokens": 100000,
  "period": "day",
  "alert_at_percent": 80
}
```

À 80% d'utilisation (80 000 tokens), GateCtr déclenche un événement webhook `budget.threshold_reached`. Le blocage strict s'effectue toujours à 100%.

Consultez [Webhooks](./webhooks.md) pour configurer où les alertes sont envoyées.

## Remplacer le budget par requête

Utilisez `gatectr.budget_id` pour appliquer un budget différent à une requête spécifique :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({
  model: 'gpt-4o',
  messages,
  gatectr: {
    budget_id: 'proj_456',   // utiliser le budget d'un autre projet
  },
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
response = client.complete(
    model="gpt-4o",
    messages=messages,
    gatectr={"budget_id": "proj_456"},
)
```

  </TabItem>
</Tabs>

## Réponse en cas de blocage

Quand une requête est bloquée par le Pare-feu Budgétaire, GateCtr retourne :

**Statut HTTP :** `429 Too Many Requests`

```json
{
  "error": {
    "type": "budget_exceeded",
    "message": "Requête bloquée. Limite budgétaire atteinte.",
    "request_id": "req_xyz789",
    "project_id": "proj_123",
    "limit": 100000,
    "used": 100012,
    "period": "day",
    "resets_at": "2025-01-02T00:00:00Z"
  }
}
```

### Gérer l'erreur dans le code

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { BudgetExceededError } from '@gatectr/sdk';

try {
  const response = await client.complete({ model: 'gpt-4o', messages });
} catch (err) {
  if (err instanceof BudgetExceededError) {
    console.warn(`Budget dépassé. Réinitialisation à : ${err.resetsAt}`);
    // Notifier l'équipe, mettre la requête en file d'attente, etc.
  }
}
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
from gatectr.exceptions import BudgetExceededError

try:
    response = client.complete(model="gpt-4o", messages=messages)
except BudgetExceededError as e:
    print(f"Budget dépassé. Réinitialisation à : {e.resets_at}")
    # Notifier l'équipe, mettre la requête en file d'attente, etc.
```

  </TabItem>
</Tabs>

## Vérifier l'utilisation actuelle

```bash
curl "https://api.gatectr.com/v1/usage?project_id=proj_123" \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

La réponse inclut `total_tokens` et `total_cost_usd` pour suivre votre proximité de la limite.

## Disponible sur

Forfait gratuit et supérieur.
