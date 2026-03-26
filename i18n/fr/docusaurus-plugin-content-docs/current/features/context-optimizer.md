---
id: context-optimizer
title: Optimiseur de Contexte
description: L'Optimiseur de Contexte de GateCtr compresse automatiquement les prompts LLM jusqu'à 40% — réduisant les coûts de tokens tout en préservant la qualité des réponses.
keywords: [optimiseur de contexte, compression de prompts, réduction de tokens, économies LLM, optimisation des prompts]
sidebar_label: Optimiseur de Contexte
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Optimiseur de Contexte

Compresse vos prompts. -40% de tokens. Même qualité de réponse.

## Comment ça fonctionne

Avant de transmettre votre requête au LLM, GateCtr analyse et compresse le prompt :

- Supprime les espaces superflus et les phrases de remplissage
- Condense les instructions verbeuses sans changer l'intention
- Tronque l'historique de conversation aux échanges les plus pertinents
- Déduplique le contexte répété entre les messages
- Préserve toute la sémantique et les blocs de code

Réduction moyenne : **-40% de tokens**. La qualité des réponses est maintenue.

## Activer

L'Optimiseur de Contexte est activé par défaut sur les forfaits Pro et supérieur.

Pour le contrôler par requête :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages,
  gatectr: { optimize: true },
});

console.log(`Tokens économisés : ${response.gatectr.tokensSaved}`);
console.log(`Modèle utilisé : ${response.gatectr.modelUsed}`);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr
from gatectr.types import PerRequestOptions

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = await client.complete(
    model="gpt-4o",
    messages=messages,
    gatectr=PerRequestOptions(optimize=True),
)

print(f"Tokens économisés : {response.gatectr.tokens_saved}")
print(f"Modèle utilisé : {response.gatectr.model_used}")
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "system", "content": "Vous êtes un assistant utile." },
      { "role": "user", "content": "Résumez le texte suivant..." }
    ],
    "optimize": true
  }'
```

  </TabItem>
</Tabs>

## Activer globalement

Activez l'optimisation pour toutes les requêtes par défaut lors de l'initialisation du client :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  optimize: true,   // appliqué à toutes les requêtes (c'est la valeur par défaut)
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    optimize=True,   # appliqué à toutes les requêtes (c'est la valeur par défaut)
)
```

  </TabItem>
</Tabs>

## Métadonnées de la réponse

Chaque réponse GateCtr inclut un champ `gatectr` avec des métadonnées sur la requête :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({ model: 'gpt-4o', messages });

console.log(response.gatectr.tokensSaved);  // tokens supprimés par l'optimiseur
console.log(response.gatectr.modelUsed);    // modèle qui a traité la requête
console.log(response.gatectr.latencyMs);    // latence bout-en-bout
console.log(response.gatectr.overage);      // true si le plafond budgétaire a été dépassé
console.log(response.gatectr.requestId);    // ID unique de cette requête
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
response = await client.complete(model="gpt-4o", messages=messages)

print(response.gatectr.tokens_saved)  # tokens supprimés par l'optimiseur
print(response.gatectr.model_used)    # modèle qui a traité la requête
print(response.gatectr.latency_ms)    # latence bout-en-bout
print(response.gatectr.overage)       # True si le plafond budgétaire a été dépassé
print(response.gatectr.request_id)    # ID unique de cette requête
```

  </TabItem>
</Tabs>

### Champs de `GateCtrMetadata`

| Champ (Node.js) | Champ (Python) | Type | Description |
|-----------------|----------------|------|-------------|
| `requestId` | `request_id` | `string` | ID unique de la requête — pour les tickets de support |
| `latencyMs` | `latency_ms` | `number` | Latence bout-en-bout mesurée par GateCtr |
| `overage` | `overage` | `boolean` | Si la requête a dépassé votre plafond budgétaire |
| `modelUsed` | `model_used` | `string` | Modèle réel qui a traité la requête |
| `tokensSaved` | `tokens_saved` | `number` | Tokens supprimés par l'Optimiseur de Contexte (0 si désactivé) |

## Désactiver pour une requête spécifique

```typescript
const response = await client.complete({
  model: 'gpt-4o',
  messages,
  gatectr: { optimize: false },
});
```

Désactivez l'optimisation pour les requêtes où la précision du prompt est critique :

- Sortie structurée (mode JSON, appel de fonctions)
- Génération de code nécessitant un formatage exact
- Requêtes avec des exemples few-shot soigneusement calibrés
- Requêtes où vous avez déjà minimisé le prompt vous-même

## Exemple d'économies réelles

Une application RAG (retrieval-augmented generation) typique avec :
- Prompt système : 500 tokens
- Contexte récupéré : 2000 tokens
- Historique de conversation : 800 tokens
- Requête utilisateur : 50 tokens

**Avant optimisation :** 3 350 tokens → **Après :** ~2 010 tokens → **Économies : ~0,04 $ par requête**

À 10 000 requêtes/jour, c'est **~400 $/jour** d'économies.

## Disponible sur

Forfait Pro et supérieur.
