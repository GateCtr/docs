---
id: analytics
title: Analytiques
description: GateCtr trace chaque token, coût, modèle et latence en temps réel. Interrogez les données d'utilisation via l'API ou explorez-les dans le tableau de bord.
keywords: [analytiques, utilisation des tokens, suivi des coûts, observabilité LLM, tableau de bord]
sidebar_label: Analytiques
---

# Analytiques

Chaque token. Chaque coût. En temps réel.

## Ce qui est suivi

Chaque requête via GateCtr est enregistrée automatiquement :

| Métrique | Description |
|---------|-------------|
| `tokens_in` | Tokens de prompt envoyés |
| `tokens_out` | Tokens de completion reçus |
| `tokens_saved` | Tokens supprimés par l'Optimiseur de Contexte |
| `cost_usd` | Coût estimé de la requête |
| `model` | Modèle utilisé |
| `latency_ms` | Latence de bout en bout |
| `project_id` | Projet auquel appartient la requête |
| `timestamp` | Horodatage UTC |

## Tableau de bord

Consultez votre utilisation sur [gatectr.com/dashboard](https://gatectr.com/dashboard) :

- **Vue d'ensemble** — total des tokens, coût total, requêtes/jour
- **Par projet** — détail par projet
- **Par modèle** — coût par modèle
- **Tendances** — graphiques 7j / 30j / 90j

## Requête via API

```bash
curl https://api.gatectr.com/v1/usage \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -G \
  --data-urlencode "project_id=proj_123" \
  --data-urlencode "from=2025-01-01" \
  --data-urlencode "to=2025-01-31"
```

Réponse :

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

## Export

Exportez les données d'utilisation en CSV depuis le tableau de bord : **Analytiques → Exporter**.

Disponible sur le forfait Team et supérieur.

## Rétention

| Forfait | Rétention |
|---------|-----------|
| Gratuit | 7 jours |
| Pro | 30 jours |
| Team | 90 jours |
| Entreprise | Personnalisée |
