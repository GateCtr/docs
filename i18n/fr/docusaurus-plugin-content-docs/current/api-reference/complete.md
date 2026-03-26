---
id: complete
title: POST /v1/complete
description: Référence API pour l'endpoint GateCtr /v1/complete — envoyez des requêtes de completion via la passerelle LLM avec optimisation, routage et application du budget.
keywords: [référence API, endpoint complete, chat completion, API LLM, compatible OpenAI]
sidebar_label: POST /v1/complete
---

# POST /v1/complete

Envoyez une requête de completion via GateCtr.

## Endpoint

```
POST https://api.gatectr.com/v1/complete
```

## En-têtes

| En-tête | Valeur |
|---------|--------|
| `Authorization` | `Bearer <votre-clé-api>` |
| `Content-Type` | `application/json` |

## Corps de la requête

```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "Vous êtes un assistant utile." },
    { "role": "user", "content": "Bonjour" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": false,
  "gatectr": {
    "optimize": true,
    "route": false,
    "budget_id": "proj_123"
  }
}
```

### Paramètres

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `model` | `string` | Oui | Nom du modèle ou `"auto"` pour le Routeur de Modèles |
| `messages` | `array` | Oui | Tableau de messages compatible OpenAI |
| `temperature` | `number` | Non | Température d'échantillonnage (0–2) |
| `max_tokens` | `number` | Non | Tokens de completion maximum |
| `stream` | `boolean` | Non | Activer le streaming (défaut : `false`) |
| `gatectr.optimize` | `boolean` | Non | Activer l'Optimiseur de Contexte (défaut : `true`) |
| `gatectr.route` | `boolean` | Non | Activer le Routeur de Modèles (défaut : `false`) |
| `gatectr.budget_id` | `string` | Non | Surcharger le budget du projet |

## Réponse

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Bonjour ! Comment puis-je vous aider ?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 9,
    "total_tokens": 21
  },
  "gatectr": {
    "optimized": true,
    "original_tokens": 20,
    "tokens_saved": 8,
    "model_used": "gpt-4o",
    "cost_usd": 0.00021
  }
}
```

## Réponses d'erreur

| Statut | Type | Description |
|--------|------|-------------|
| `401` | `unauthorized` | Clé API invalide ou manquante |
| `429` | `budget_exceeded` | Limite budgétaire du projet atteinte |
| `422` | `validation_error` | Corps de requête invalide |
| `502` | `provider_error` | Le fournisseur LLM a retourné une erreur |
