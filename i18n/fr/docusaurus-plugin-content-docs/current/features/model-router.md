---
id: model-router
title: Routeur de Modèles
description: Le Routeur de Modèles de GateCtr sélectionne automatiquement le meilleur et moins cher LLM pour chaque requête en fonction de la complexité de la tâche, des exigences de qualité et des prix.
keywords: [routeur de modèles, sélection LLM, modèle auto, optimisation des coûts, routage intelligent]
sidebar_label: Routeur de Modèles
---

# Routeur de Modèles

GateCtr choisit le bon LLM pour chaque requête. Vous payez moins.

## Comment ça fonctionne

Quand le routage est activé, GateCtr évalue chaque requête selon un ensemble de critères et sélectionne le modèle optimal :

- Complexité de la tâche (simple Q&R vs. raisonnement multi-étapes)
- Qualité de sortie requise
- Prix actuels des modèles
- Vos préférences de fournisseur configurées

Les requêtes simples vont vers les modèles moins chers. Les complexes vers le meilleur modèle pour le travail.

## Activer

```typescript
const response = await client.complete({
  model: 'auto', // déclenche le Routeur de Modèles
  messages,
});

console.log(response.gatectr.model_used); // ex. "gpt-3.5-turbo"
```

Ou activer globalement :

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  route: true,
});
```

## Logique de routage

| Type de requête | Sélection typique |
|----------------|-------------------|
| Q&R simple, tâches courtes | `gpt-3.5-turbo`, `mistral-small` |
| Résumé, classification | `gpt-4o-mini`, `claude-3-haiku` |
| Raisonnement complexe, code | `gpt-4o`, `claude-3-5-sonnet` |

## Configurer les préférences de fournisseur

Dans le tableau de bord : **Paramètres → Routeur de Modèles**

Vous pouvez restreindre le routage à des fournisseurs spécifiques ou exclure des modèles entièrement.

## Champs de réponse

```json
"gatectr": {
  "model_used": "gpt-3.5-turbo",
  "model_requested": "auto",
  "routing_reason": "low_complexity",
  "cost_usd": 0.00008
}
```

## Disponible sur

Forfait Pro et supérieur.
