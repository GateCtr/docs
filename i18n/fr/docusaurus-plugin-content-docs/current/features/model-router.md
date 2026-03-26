---
id: model-router
title: Routeur de Modèles
description: Le Routeur de Modèles de GateCtr sélectionne automatiquement le meilleur et moins cher LLM pour chaque requête en fonction de la complexité de la tâche, des exigences de qualité et des prix.
keywords: [routeur de modèles, sélection LLM, modèle auto, optimisation des coûts, routage intelligent]
sidebar_label: Routeur de Modèles
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Routeur de Modèles

GateCtr choisit le bon LLM pour chaque requête. Vous payez moins.

## Comment ça fonctionne

Quand le routage est activé, GateCtr évalue chaque requête selon un ensemble de critères et sélectionne le modèle optimal :

- **Complexité de la tâche** — simple Q&R vs. raisonnement multi-étapes
- **Exigences de sortie** — longueur, format et qualité attendue
- **Prix actuels des modèles** — coût par token en temps réel par fournisseur
- **Vos préférences de fournisseur configurées** — autoriser/bloquer des modèles ou fournisseurs spécifiques
- **Exigences de latence** — équilibre vitesse vs. qualité selon vos paramètres

Les requêtes simples vont vers les modèles moins chers. Les complexes vers le meilleur modèle pour le travail.

## Activer

### Option 1 : Définir `model: "auto"`

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'auto',   // déclenche le Routeur de Modèles
  messages: [{ role: 'user', content: 'Combien font 2 + 2 ?' }],
});

console.log(response.gatectr.model_used);      // ex. "gpt-3.5-turbo"
console.log(response.gatectr.routing_reason);  // ex. "low_complexity"
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="auto",   # déclenche le Routeur de Modèles
    messages=[{"role": "user", "content": "Combien font 2 + 2 ?"}],
)

print(response.gatectr["model_used"])      # ex. "gpt-3.5-turbo"
print(response.gatectr["routing_reason"])  # ex. "low_complexity"
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{ "role": "user", "content": "Combien font 2 + 2 ?" }]
  }'
```

  </TabItem>
</Tabs>

### Option 2 : Activer `route: true`

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({
  model: 'gpt-4o',        // votre préférence, le Routeur peut substituer
  messages,
  gatectr: { route: true },
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
response = client.complete(
    model="gpt-4o",       # votre préférence, le Routeur peut substituer
    messages=messages,
    gatectr={"route": True},
)
```

  </TabItem>
</Tabs>

### Option 3 : Activer globalement

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  route: true,   // appliqué à toutes les requêtes
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    route=True,   # appliqué à toutes les requêtes
)
```

  </TabItem>
</Tabs>

## Logique de routage

| Type de requête | Sélection typique |
|----------------|-------------------|
| Q&R simple, tâches courtes | `gpt-3.5-turbo`, `mistral-small` |
| Résumé, classification | `gpt-4o-mini`, `claude-3-haiku` |
| Raisonnement complexe, analyse | `gpt-4o`, `claude-3-5-sonnet` |
| Génération de code, débogage | `gpt-4o`, `claude-3-5-sonnet` |
| Rédaction longue | `gpt-4o`, `mistral-large` |

## Configurer les préférences de fournisseur

Dans le tableau de bord : **Paramètres → Routeur de Modèles**

Vous pouvez :

- **Liste d'autorisation** — restreindre le routage à des fournisseurs spécifiques (ex. OpenAI uniquement)
- **Liste de blocage** — exclure des modèles spécifiques de la sélection
- **Seuil de coût** — ne jamais router vers un modèle au-dessus d'un prix donné par million de tokens
- **Mode latence** — préférer les modèles plus rapides même légèrement plus coûteux

## Champs de réponse

Le champ `gatectr` inclut les métadonnées de routage :

```json
{
  "gatectr": {
    "model_used": "gpt-3.5-turbo",
    "model_requested": "auto",
    "routing_reason": "low_complexity",
    "cost_usd": 0.00008
  }
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `model_used` | `string` | Le modèle ayant réellement traité la requête |
| `model_requested` | `string` | Le modèle spécifié dans la requête |
| `routing_reason` | `string` | Raison du choix du Routeur |
| `cost_usd` | `number` | Coût estimé en USD |

### Valeurs de `routing_reason`

| Valeur | Description |
|--------|-------------|
| `low_complexity` | Requête simple, modèle moins cher sélectionné |
| `high_complexity` | Raisonnement complexe requis, modèle premium sélectionné |
| `provider_preference` | La configuration allow/block a influencé le choix |
| `cost_threshold` | Le routage est resté sous votre limite de coût configurée |
| `latency_mode` | Modèle plus rapide sélectionné selon la préférence de latence |

## Combiner avec l'Optimiseur de Contexte

Le Routeur de Modèles et l'Optimiseur de Contexte fonctionnent ensemble :

```typescript
const response = await client.complete({
  model: 'auto',
  messages,
  gatectr: {
    route: true,     // laisser le Routeur choisir le modèle
    optimize: true,  // compresser le prompt
  },
});

// Les deux économies s'additionnent
console.log(response.gatectr.tokens_saved);  // économies de l'optimiseur
console.log(response.gatectr.model_used);    // sélection du routeur
console.log(response.gatectr.cost_usd);      // coût total optimisé
```

## Disponible sur

Forfait Pro et supérieur.
