---
id: webhooks
title: Webhooks
description: GateCtr peut pousser des événements en temps réel vers n'importe quelle URL — alertes budgétaires, messages Slack, et plus. Apprenez à configurer, vérifier et gérer les webhooks.
keywords: [webhooks, alertes budgétaires, intégration Slack, notifications d'événements, signature webhook, HMAC]
sidebar_label: Webhooks
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Webhooks

Envoyez des événements vers Slack, Teams ou n'importe quelle URL en temps réel.

## Événements supportés

| Événement | Description |
|-----------|-------------|
| `budget.threshold_reached` | Alerte préventive de budget déclenchée (ex. à 80%) |
| `budget.limit_exceeded` | Plafond strict du budget atteint — les requêtes sont bloquées |
| `request.completed` | Requête traitée avec succès |
| `request.failed` | Échec de la requête (erreur fournisseur ou validation) |

## Configurer un webhook

### Via le tableau de bord

Allez dans **Paramètres → Webhooks → Ajouter un endpoint** dans le [tableau de bord GateCtr](https://app.gatectr.com).

### Via API

```bash
curl -X POST https://api.gatectr.com/v1/webhooks \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://votre-app.com/webhooks/gatectr",
    "events": ["budget.threshold_reached", "budget.limit_exceeded"],
    "secret": "votre-secret-de-signature"
  }'
```

### Via SDK

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const webhook = await client.webhooks.create({
  url: 'https://votre-app.com/webhooks/gatectr',
  events: ['budget.threshold_reached', 'budget.limit_exceeded'],
});

console.log(webhook.id);      // wh_abc123
console.log(webhook.secret);  // conservez-le pour la vérification de signature
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

webhook = client.webhooks.create(
    url="https://votre-app.com/webhooks/gatectr",
    events=["budget.threshold_reached", "budget.limit_exceeded"],
)

print(webhook["id"])      # wh_abc123
print(webhook["secret"])  # conservez-le pour la vérification de signature
```

  </TabItem>
</Tabs>

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
    "period": "day",
    "resets_at": "2025-03-17T00:00:00Z"
  }
}
```

### Payload `budget.limit_exceeded`

```json
{
  "id": "evt_def456",
  "type": "budget.limit_exceeded",
  "timestamp": "2025-03-16T16:05:00Z",
  "data": {
    "project_id": "proj_123",
    "project_name": "Mon App",
    "limit_tokens": 100000,
    "used_tokens": 100023,
    "period": "day",
    "resets_at": "2025-03-17T00:00:00Z"
  }
}
```

## Vérifier la signature webhook

Chaque requête webhook inclut un en-tête `X-GateCtr-Signature` contenant une signature HMAC-SHA256. Vérifiez-la toujours avant de traiter l'événement.

<Tabs>
  <TabItem value="nodejs" label="Node.js (Next.js)" default>

```typescript
import { verifyWebhook } from '@gatectr/sdk';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('X-GateCtr-Signature') ?? '';

  let event;
  try {
    event = verifyWebhook(body, signature, process.env.GATECTR_WEBHOOK_SECRET!);
  } catch {
    return new Response('Signature invalide', { status: 401 });
  }

  switch (event.type) {
    case 'budget.threshold_reached':
      console.log(`Projet ${event.data.project_id} à ${event.data.percent}%`);
      // Notifier l'équipe via Slack, email, etc.
      break;
    case 'budget.limit_exceeded':
      console.log(`Budget du projet ${event.data.project_id} dépassé — requêtes bloquées`);
      break;
    case 'request.failed':
      // Enregistrer pour l'observabilité
      break;
  }

  return Response.json({ ok: true });
}
```

  </TabItem>
  <TabItem value="python" label="Python (FastAPI)">

```python
import os
from fastapi import FastAPI, Request, HTTPException
from gatectr import verify_webhook

app = FastAPI()

@app.post("/webhooks/gatectr")
async def handle_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-GateCtr-Signature", "")

    try:
        event = verify_webhook(body, signature, os.environ["GATECTR_WEBHOOK_SECRET"])
    except ValueError:
        raise HTTPException(status_code=401, detail="Signature invalide")

    if event["type"] == "budget.threshold_reached":
        project_id = event["data"]["project_id"]
        percent = event["data"]["percent"]
        print(f"Projet {project_id} à {percent}% du budget")

    elif event["type"] == "budget.limit_exceeded":
        project_id = event["data"]["project_id"]
        print(f"Budget du projet {project_id} dépassé — requêtes bloquées")

    return {"ok": True}
```

  </TabItem>
  <TabItem value="express" label="Node.js (Express)">

```typescript
import express from 'express';
import { verifyWebhook } from '@gatectr/sdk';

const app = express();

app.post('/webhooks/gatectr', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-gatectr-signature'] ?? '';

  let event;
  try {
    event = verifyWebhook(req.body.toString(), signature, process.env.GATECTR_WEBHOOK_SECRET!);
  } catch {
    return res.status(401).json({ error: 'Signature invalide' });
  }

  if (event.type === 'budget.threshold_reached') {
    // Gérer l'alerte
  }

  res.json({ ok: true });
});
```

  </TabItem>
</Tabs>

## Intégration Slack

Pointez l'URL du webhook vers un Slack Incoming Webhook :

1. Créez un [Slack Incoming Webhook](https://api.slack.com/messaging/webhooks) pour votre espace de travail
2. Ajoutez l'URL Slack comme endpoint de webhook dans GateCtr
3. Abonnez-vous à `budget.threshold_reached` et `budget.limit_exceeded`

GateCtr formate automatiquement les événements budgétaires en messages Slack lisibles :

```
⚠️ GateCtr — Alerte Budgétaire
Le projet "Mon App" a atteint 80% de son budget quotidien de tokens.
Utilisés : 80 012 / 100 000 tokens. Réinitialisation à minuit UTC.
```

## Nouvelles tentatives

Les livraisons échouées (réponse non-2xx ou expiration) sont réessayées avec un recul exponentiel :

| Tentative | Délai |
|-----------|-------|
| 1re tentative | 1 seconde |
| 2e tentative | 5 secondes |
| 3e tentative | 30 secondes |

Après 3 tentatives échouées, l'événement est marqué comme échoué. Vous pouvez rejouer les événements échoués depuis le tableau de bord : **Paramètres → Webhooks → Événements échoués**.

## Disponible sur

Forfait Pro et supérieur.
