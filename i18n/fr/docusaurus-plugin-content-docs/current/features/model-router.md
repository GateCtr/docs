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

- **Complexité de la tâche** — Q&R simple vs. raisonnement multi-étapes
- **Exigences de sortie** — longueur, format et qualité attendue
- **Prix actuels des modèles** — coût par token en temps réel chez les fournisseurs
- **Vos préférences de fournisseur** — autoriser/bloquer des modèles ou fournisseurs spécifiques
- **Exigences de latence** — équilibrer vitesse et qualité selon vos paramètres

Les requêtes simples vont vers des modèles moins chers. Les complexes vont vers le meilleur modèle pour la tâche.

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

console.log(response.gatectr.modelUsed);  // ex. "gpt-3.5-turbo"
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = await client.complete(
    model="auto",   # déclenche le Routeur de Modèles
    messages=[{"role": "user", "content": "Combien font 2 + 2 ?"}],
)

print(response.gatectr.model_used)  # ex. "gpt-3.5-turbo"
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
  model: 'gpt-4o',        // votre préférence, le Routeur peut l'ignorer
  messages,
  gatectr: { route: true },
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
from gatectr.types import PerRequestOptions

response = await client.complete(
    model="gpt-4o",       # votre préférence, le Routeur peut l'ignorer
    messages=messages,
    gatectr=PerRequestOptions(route=True),
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
| Q&R simple, courtes tâches | `gpt-3.5-turbo`, `mistral-small` |
| Résumé, classification | `gpt-4o-mini`, `claude-3-haiku` |
| Raisonnement complexe, analyse | `gpt-4o`, `claude-3-5-sonnet` |
| Génération de code, débogage | `gpt-4o`, `claude-3-5-sonnet` |
| Rédaction longue forme | `gpt-4o`, `mistral-large` |

Le routeur évalue la requête dynamiquement — le même message à des moments différents peut être routé différemment en fonction des prix actuels.

## Configurer les préférences de fournisseur

Dans le tableau de bord : **Paramètres → Routeur de Modèles**

Vous pouvez :

- **Liste d'autorisation** — restreindre le routage à des fournisseurs spécifiques (ex. OpenAI uniquement)
- **Liste de blocage** — exclure des modèles spécifiques du routage
- **Seuil de coût** — ne jamais router vers un modèle au-dessus d'un prix donné par million de tokens
- **Mode latence** — préférer des modèles plus rapides même légèrement plus chers

## Métadonnées de la réponse

Après le routage, `response.gatectr.modelUsed` vous indique quel modèle a réellement traité la requête :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({
  model: 'auto',
  messages: [{ role: 'user', content: 'Combien font 2 + 2 ?' }],
});

console.log(response.gatectr.modelUsed);  // ex. "gpt-3.5-turbo"
console.log(response.gatectr.tokensSaved);
console.log(response.gatectr.latencyMs);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
response = await client.complete(
    model="auto",
    messages=[{"role": "user", "content": "Combien font 2 + 2 ?"}],
)

print(response.gatectr.model_used)    # ex. "gpt-3.5-turbo"
print(response.gatectr.tokens_saved)
print(response.gatectr.latency_ms)
```

  </TabItem>
</Tabs>

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

// Les deux économies s'accumulent
console.log(response.gatectr.tokensSaved);  // économies de l'optimiseur
console.log(response.gatectr.modelUsed);    // sélection du routeur
```

## Disponible sur

Forfait Pro et supérieur.
