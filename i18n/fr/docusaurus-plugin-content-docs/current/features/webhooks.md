---
id: webhooks
title: Webhooks
description: GateCtr peut pousser des événements en temps réel vers n'importe quelle URL — alertes budgétaires, messages Slack, et plus. Apprenez à configurer et vérifier les webhooks.
keywords: [webhooks, alertes budgétaires, intégration Slack, notifications d'événements, signature webhook]
sidebar_label: Webhooks
---

# Webhooks

Envoyez des événements vers Slack, Teams ou n'importe quelle URL.

## Événements supportés

| Événement | Description |
|-----------|-------------|
| `budget.threshold_reached` | Alerte préventive de budget déclenchée |
| `budget.limit_exceeded` | Plafond strict du budget atteint |
| `request.completed` | Requête traitée avec succès |
| `request.failed` | Échec de la requête |

## Configurer un webhook

Dans le tableau de bord : **Paramètres → Webhooks → Ajouter un endpoint**

Ou via l'API :

```bash
curl -X POST https://api.gatectr.com/v1/webhooks \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -d '{
    "url": "https://votre-app.com/webhooks/gatectr",
    "events": ["budget.threshold_reached", "budget.limit_exceeded"]
  }'
```

## Format du payload

```json
{
  "id": "evt_abc123",
  "type": "budget.threshold_reached",
  "timestamp": "2025-03-16T14:22:00Z",
  "data": {
    "project_id": "proj_123",
    "project_name": "Mon App",
    "limit_tokens": 100000,
    "used_tokens": 80012,
    "percent": 80,
    "period": "day"
  }
}
```

## Vérifier la signature webhook

Chaque requête inclut un en-tête `X-GateCtr-Signature`. Vérifiez-le :

```typescript
import { verifyWebhook } from '@gatectr/sdk';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('X-GateCtr-Signature') ?? '';

  const event = verifyWebhook(body, signature, process.env.GATECTR_WEBHOOK_SECRET);

  if (event.type === 'budget.threshold_reached') {
    // gérer l'événement
  }

  return Response.json({ ok: true });
}
```

## Intégration Slack

Pointez l'URL du webhook vers un Slack Incoming Webhook :

```
https://hooks.slack.com/services/xxx/yyy/zzz
```

GateCtr envoie automatiquement un message Slack formaté pour les événements budgétaires.

## Nouvelles tentatives

Les livraisons échouées (réponse non-2xx) sont réessayées jusqu'à 3 fois avec un recul exponentiel : 1s, 5s, 30s.

## Disponible sur

Forfait Pro et supérieur.
