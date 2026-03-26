---
id: webhooks
title: Webhooks
description: GateCtr pousse des événements en temps réel vers n'importe quel endpoint HTTPS — changements de plan, alertes budgétaires, résultats de requêtes, et plus. Apprenez à enregistrer, vérifier et gérer les webhooks.
keywords: [webhooks, événements temps réel, alertes budgétaires, événements facturation, signature HMAC, BullMQ, livraison webhook]
sidebar_label: Webhooks
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Webhooks

Recevez des notifications en temps réel sur n'importe quel endpoint HTTPS lorsque des événements se produisent dans votre compte GateCtr — changements de plan, alertes budgétaires, résultats de requêtes, et plus.

## Fonctionnement

1. Enregistrez une URL d'endpoint dans le tableau de bord ou via l'API
2. GateCtr génère automatiquement un secret de signature (`whsec_…`)
3. Lorsqu'un événement se produit, GateCtr met en file d'attente une tâche de livraison (BullMQ / Redis)
4. Le worker envoie le payload de l'événement en POST à votre URL, signé avec HMAC-SHA256
5. Les livraisons échouées sont relancées automatiquement (jusqu'à 6 tentatives)

---

## Événements supportés

### Facturation

| Événement | Déclenché quand |
|-----------|-----------------|
| `billing.plan_upgraded` | L'utilisateur passe à un plan supérieur |
| `billing.plan_downgraded` | L'utilisateur passe à un plan inférieur |
| `billing.payment_failed` | Le paiement de la facture Stripe échoue |
| `billing.trial_started` | L'abonnement entre en période d'essai |
| `billing.trial_ending` | La période d'essai est sur le point d'expirer |
| `billing.subscription_cancellation_scheduled` | Annulation programmée en fin de période |

### Budget

| Événement | Déclenché quand |
|-----------|-----------------|
| `budget.threshold_reached` | Les dépenses franchissent un seuil configuré |
| `budget.exceeded` | Le plafond strict du budget est atteint — requêtes bloquées |
| `budget.reset` | La période budgétaire se réinitialise (cron quotidien/mensuel) |

### Requêtes

| Événement | Déclenché quand |
|-----------|-----------------|
| `request.completed` | Requête LLM traitée avec succès |
| `request.failed` | Requête échouée (erreur fournisseur ou validation) |
| `request.routed` | Requête acheminée vers un fournisseur spécifique |

### Fournisseur

| Événement | Déclenché quand |
|-----------|-----------------|
| `provider.fallback` | Le fournisseur principal a échoué, le repli est déclenché |
| `provider.error` | Le fournisseur a retourné une erreur non récupérable |

### Clés API

| Événement | Déclenché quand |
|-----------|-----------------|
| `api_key.created` | Nouvelle clé API créée |
| `api_key.revoked` | Clé API révoquée manuellement |
| `api_key.expired` | Clé API arrivée à sa date d'expiration |

### Projets

| Événement | Déclenché quand |
|-----------|-----------------|
| `project.created` | Nouveau projet créé |

### Équipe

| Événement | Déclenché quand |
|-----------|-----------------|
| `team.member.added` | Membre rejoint l'équipe |
| `team.member.removed` | Membre retiré de l'équipe |

### Usage

| Événement | Déclenché quand |
|-----------|-----------------|
| `usage.daily` | Rapport d'usage quotidien généré (cron minuit) |

### Méta-webhook

| Événement | Déclenché quand |
|-----------|-----------------|
| `webhook.test` | Livraison de test manuelle déclenchée |
| `webhook.failed` | Webhook automatiquement désactivé après trop d'échecs |

---

## Enregistrer un webhook

### Via le tableau de bord

Allez dans **Paramètres → Webhooks → Ajouter un endpoint** dans le [tableau de bord GateCtr](https://app.gatectr.com). Saisissez un nom, une URL HTTPS et sélectionnez les événements auxquels vous abonner.

GateCtr génère et affiche le secret de signature (`whsec_…`) à la création — copiez-le immédiatement, il ne sera plus affiché.

### Via API

```bash
curl -X POST https://api.gatectr.com/v1/webhooks \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon endpoint de production",
    "url": "https://votre-app.com/webhooks/gatectr",
    "events": ["billing.plan_upgraded", "budget.threshold_reached", "request.failed"]
  }'
```

**Réponse** — le champ `secret` n'est retourné qu'à la création :

```json
{
  "id": "clx...",
  "name": "Mon endpoint de production",
  "url": "https://votre-app.com/webhooks/gatectr",
  "secret": "whsec_a3f9...",
  "events": ["billing.plan_upgraded", "budget.threshold_reached", "request.failed"],
  "isActive": true,
  "successCount": 0,
  "failCount": 0,
  "lastFiredAt": null,
  "createdAt": "2026-03-26T10:00:00.000Z"
}
```

:::caution
L'URL **doit utiliser HTTPS**. Les endpoints HTTP sont rejetés avec `url_must_be_https`.
:::

:::tip Abonnement universel
Passez `"events": ["*"]` pour recevoir tous les types d'événements sur un seul endpoint.
:::

---

## Format du payload

Chaque livraison est un POST HTTP avec `Content-Type: application/json` et la structure de corps suivante :

```json
{
  "event": "billing.plan_upgraded",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "previous_plan": "PRO",
    "new_plan": "TEAM",
    "subscription_id": "sub_stripe_xyz"
  }
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `event` | `string` | Type d'événement (ex. `billing.plan_upgraded`) |
| `project_id` | `string` | Votre identifiant utilisateur GateCtr |
| `timestamp` | `string` | Horodatage UTC ISO 8601 |
| `data` | `object` | Payload spécifique à l'événement |

### Exemples de payloads

<Tabs>
  <TabItem value="billing-upgrade" label="billing.plan_upgraded" default>

```json
{
  "event": "billing.plan_upgraded",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "previous_plan": "FREE",
    "new_plan": "PRO",
    "subscription_id": "sub_1ABC..."
  }
}
```

  </TabItem>
  <TabItem value="billing-failed" label="billing.payment_failed">

```json
{
  "event": "billing.payment_failed",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "plan": "PRO",
    "invoice_id": "in_1ABC...",
    "amount_due": 2900,
    "currency": "usd"
  }
}
```

  </TabItem>
  <TabItem value="budget-threshold" label="budget.threshold_reached">

```json
{
  "event": "budget.threshold_reached",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "threshold_percent": 80,
    "used_usd": 8.05,
    "limit_usd": 10.00,
    "period": "monthly"
  }
}
```

  </TabItem>
  <TabItem value="webhook-test" label="webhook.test">

```json
{
  "event": "webhook.test",
  "project_id": "usr_abc123",
  "timestamp": "2026-03-26T10:00:00.000Z",
  "data": {
    "message": "Test delivery from GateCtr"
  }
}
```

  </TabItem>
</Tabs>

---

## En-têtes de requête

Chaque livraison inclut trois en-têtes personnalisés :

| En-tête | Exemple | Description |
|---------|---------|-------------|
| `X-GateCtr-Signature` | `hmac-sha256=3d4f…` | HMAC-SHA256 du corps brut de la requête |
| `X-GateCtr-Event` | `billing.plan_upgraded` | Type d'événement |
| `X-GateCtr-Delivery` | `550e8400-e29b-…` | UUID unique de livraison |

---

## Vérifier la signature

Vérifiez toujours `X-GateCtr-Signature` avant de traiter un événement. La signature est `hmac-sha256=<hex>` calculée sur le **corps brut de la requête** avec votre secret `whsec_…`.

<Tabs>
  <TabItem value="nodejs" label="Node.js (Next.js)" default>

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const sigHeader = req.headers.get('X-GateCtr-Signature') ?? '';

  const expected =
    'hmac-sha256=' +
    createHmac('sha256', process.env.GATECTR_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

  const isValid = timingSafeEqual(
    Buffer.from(sigHeader),
    Buffer.from(expected),
  );

  if (!isValid) {
    return new Response('Signature invalide', { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.event) {
    case 'billing.plan_upgraded':
      console.log(`Plan mis à niveau vers ${event.data.new_plan}`);
      break;
    case 'budget.threshold_reached':
      console.log(`Budget à ${event.data.threshold_percent}%`);
      break;
    case 'billing.payment_failed':
      // Alerter votre équipe
      break;
  }

  return Response.json({ ok: true });
}
```

  </TabItem>
  <TabItem value="python" label="Python (FastAPI)">

```python
import hmac
import hashlib
import json
import os
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.post("/webhooks/gatectr")
async def handle_webhook(request: Request):
    body = await request.body()
    sig_header = request.headers.get("X-GateCtr-Signature", "")
    secret = os.environ["GATECTR_WEBHOOK_SECRET"].encode()

    expected = "hmac-sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(sig_header, expected):
        raise HTTPException(status_code=401, detail="Signature invalide")

    event = json.loads(body)

    if event["event"] == "billing.plan_upgraded":
        print(f"Plan mis à niveau vers {event['data']['new_plan']}")
    elif event["event"] == "budget.threshold_reached":
        print(f"Budget à {event['data']['threshold_percent']}%")

    return {"ok": True}
```

  </TabItem>
  <TabItem value="express" label="Node.js (Express)">

```typescript
import express from 'express';
import { createHmac, timingSafeEqual } from 'crypto';

const app = express();

app.post(
  '/webhooks/gatectr',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const body = req.body.toString();
    const sigHeader = req.headers['x-gatectr-signature'] ?? '';

    const expected =
      'hmac-sha256=' +
      createHmac('sha256', process.env.GATECTR_WEBHOOK_SECRET!)
        .update(body)
        .digest('hex');

    try {
      if (!timingSafeEqual(Buffer.from(sigHeader as string), Buffer.from(expected))) {
        return res.status(401).json({ error: 'Signature invalide' });
      }
    } catch {
      return res.status(401).json({ error: 'Signature invalide' });
    }

    const event = JSON.parse(body);
    // Traiter event.event …

    res.json({ ok: true });
  },
);
```

  </TabItem>
</Tabs>

:::danger Toujours utiliser une comparaison à temps constant
Utilisez `timingSafeEqual` (Node.js) ou `hmac.compare_digest` (Python) pour éviter les attaques temporelles. N'utilisez jamais `===` pour comparer les signatures.
:::

---

## Politique de relance

Le worker de livraison relance automatiquement les livraisons échouées :

| Tentative | Délai | Déclenchée par |
|-----------|-------|----------------|
| 1 (initiale) | — | Toujours |
| 2 | 1 s | Erreur 5xx ou réseau |
| 3 | 2 s | Erreur 5xx ou réseau |
| 4 | 4 s | Erreur 5xx ou réseau |
| 5 | 8 s | Erreur 5xx ou réseau |
| 6 | 16 s | Erreur 5xx ou réseau |

**Cas particuliers :**
- **4xx (sauf 429)** — La livraison échoue immédiatement, pas de relance
- **429 Too Many Requests** — Respecte l'en-tête `Retry-After` de la réponse
- **Délai d'expiration de connexion** — Limite de 10 secondes par tentative, puis relance

**Désactivation automatique :** Si un endpoint accumule plus de **10 échecs consécutifs**, il est automatiquement désactivé. Réactivez-le depuis **Paramètres → Webhooks** une fois le problème résolu.

---

## Journaux de livraison

Chaque tentative de livraison est enregistrée. Récupérez les 50 dernières pour un webhook donné :

```bash
curl https://api.gatectr.com/v1/webhooks/{id}/deliveries \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

```json
{
  "deliveries": [
    {
      "id": "clx...",
      "deliveryId": "550e8400-...",
      "event": "billing.plan_upgraded",
      "status": 200,
      "success": true,
      "responseMs": 142,
      "retryCount": 0,
      "error": null,
      "createdAt": "2026-03-26T10:00:00.000Z"
    }
  ]
}
```

---

## Envoyer une livraison de test

Déclenchez un événement de test immédiat pour vérifier que votre endpoint est accessible :

```bash
curl -X POST https://api.gatectr.com/v1/webhooks/{id}/test \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

```json
{ "queued": true }
```

Le payload de test utilise le type d'événement `webhook.test`.

---

## Gérer les webhooks

### Mettre à jour un endpoint

```bash
curl -X PATCH https://api.gatectr.com/v1/webhooks/{id} \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "isActive": false }'
```

Champs modifiables : `name`, `url`, `events`, `isActive`.

### Supprimer un endpoint

```bash
curl -X DELETE https://api.gatectr.com/v1/webhooks/{id} \
  -H "Authorization: Bearer $GATECTR_API_KEY"
```

Retourne `204 No Content` en cas de succès.

---

## Disponible sur

Forfait Pro et supérieur. Le nombre d'endpoints webhook que vous pouvez créer dépend du quota de votre forfait.
