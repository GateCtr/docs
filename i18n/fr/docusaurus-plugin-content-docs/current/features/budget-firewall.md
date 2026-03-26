---
id: budget-firewall
title: Pare-feu Budgétaire
description: Définissez des plafonds stricts de tokens et de coûts par projet avec le Pare-feu Budgétaire de GateCtr. Bloquez les requêtes dès qu'une limite est atteinte — plus de factures surprises.
keywords: [pare-feu budgétaire, contrôle des coûts, limite de tokens, plafond LLM, alertes budget]
sidebar_label: Pare-feu Budgétaire
---

# Pare-feu Budgétaire

Des plafonds stricts par projet. Plus de factures surprises.

## Comment ça fonctionne

Chaque requête passe par le Pare-feu Budgétaire avant d'atteindre le LLM. Si le budget du projet est dépassé, la requête est bloquée et un `429` est retourné. Aucun token consommé. Aucun coût engagé.

## Définir un budget

Dans le tableau de bord : **Projets → Votre projet → Budget**

Ou via l'API :

```bash
curl -X PATCH https://api.gatectr.com/v1/budget \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -d '{ "project_id": "proj_123", "limit_tokens": 100000, "period": "day" }'
```

## Types de budget

| Type | Description |
|------|-------------|
| `tokens` | Plafond sur le total de tokens (prompt + completion) |
| `cost_usd` | Plafond sur le coût estimé en USD |

## Périodes

| Période | Réinitialisation |
|---------|-----------------|
| `day` | Minuit UTC |
| `month` | 1er du mois UTC |
| `total` | Jamais — plafond à vie |

## Alertes préventives

Définissez un seuil pour recevoir un webhook avant d'atteindre le plafond strict :

```json
{
  "limit_tokens": 100000,
  "alert_at_percent": 80
}
```

À 80% d'utilisation, GateCtr déclenche un événement webhook `budget.threshold_reached`.

## Réponse en cas de blocage

```json
{
  "error": {
    "type": "budget_exceeded",
    "message": "Requête bloquée. Limite budgétaire atteinte.",
    "project_id": "proj_123",
    "limit": 100000,
    "used": 100012
  }
}
```

Statut HTTP : `429 Too Many Requests`

## Disponible sur

Forfait gratuit et supérieur.
