---
id: first-request
title: Votre première requête
description: Comprenez le cycle de vie d'une requête GateCtr — de votre application à travers la vérification du budget, l'optimisation du prompt, le routage de modèle, et le retour avec des analytiques complètes.
keywords: [cycle de vie des requêtes, compatible OpenAI, format de réponse, modèles supportés]
sidebar_label: Votre première requête
---

# Votre première requête

Un regard plus approfondi sur ce que GateCtr fait avec chaque requête.

## Cycle de vie d'une requête

```
Votre application
  → API GateCtr
    → Vérification du Pare-feu Budgétaire
    → Optimiseur de Contexte (compression du prompt)
    → Routeur de Modèles (sélection du modèle si route: true)
    → Fournisseur LLM (OpenAI, Anthropic, Mistral...)
    → Réponse + analytiques enregistrées
  → Votre application
```

## Format de la réponse

GateCtr retourne une réponse compatible OpenAI avec un champ `gatectr` supplémentaire :

```json
{
  "id": "chatcmpl-abc123",
  "model": "gpt-4o",
  "choices": [
    {
      "message": { "role": "assistant", "content": "Bonjour !" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 8,
    "total_tokens": 20
  },
  "gatectr": {
    "tokens_saved": 18,
    "original_tokens": 30,
    "model_used": "gpt-4o",
    "optimized": true,
    "cost_usd": 0.00024
  }
}
```

## Le champ `gatectr`

| Champ | Description |
|-------|-------------|
| `tokens_saved` | Tokens supprimés par l'Optimiseur de Contexte |
| `original_tokens` | Nombre de tokens avant optimisation |
| `model_used` | Modèle réellement utilisé (pertinent quand le routage est activé) |
| `optimized` | Si l'Optimiseur de Contexte s'est exécuté |
| `cost_usd` | Coût estimé de cette requête |

## Modèles supportés

GateCtr est compatible avec n'importe quel modèle compatible OpenAI. Fournisseurs testés :

- **OpenAI** — `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`
- **Anthropic** — `claude-3-5-sonnet`, `claude-3-haiku`
- **Mistral** — `mistral-large`, `mistral-small`
- **Gemini** — `gemini-1.5-pro`, `gemini-1.5-flash`

Utilisez `model: "auto"` pour laisser le Routeur de Modèles décider.
