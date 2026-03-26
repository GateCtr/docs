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

Compresse vos prompts. -40% de tokens. Même qualité de sortie.

## Comment ça fonctionne

Avant de transmettre votre requête au LLM, GateCtr analyse et compresse le prompt :

- Supprime les espaces redondants et les phrases de remplissage
- Condense les instructions verboses sans changer l'intention
- Réduit l'historique des conversations aux tours les plus pertinents
- Déduplique le contexte répété entre les messages
- Préserve tout le sens sémantique et les blocs de code

Réduction moyenne : **-40% de tokens**. La qualité des sorties est maintenue.

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

console.log(`Tokens économisés : ${response.gatectr.tokens_saved}`);
console.log(`Taux de compression : ${response.gatectr.compression_ratio}`);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=messages,
    gatectr={"optimize": True},
)

print(f"Tokens économisés : {response.gatectr['tokens_saved']}")
print(f"Taux de compression : {response.gatectr['compression_ratio']}")
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
    "gatectr": { "optimize": true }
  }'
```

  </TabItem>
</Tabs>

## Activer globalement

Activez l'optimisation pour toutes les requêtes lors de l'initialisation du client :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const client = new GateCtr({
  apiKey: process.env.GATECTR_API_KEY,
  optimize: true,   // appliqué à toutes les requêtes
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(
    api_key=os.environ["GATECTR_API_KEY"],
    optimize=True,   # appliqué à toutes les requêtes
)
```

  </TabItem>
</Tabs>

## Champs de réponse

Le champ `gatectr` dans chaque réponse contient les métadonnées d'optimisation :

```json
{
  "gatectr": {
    "optimized": true,
    "original_tokens": 800,
    "tokens_saved": 320,
    "compression_ratio": 0.40,
    "model_used": "gpt-4o",
    "cost_usd": 0.00384
  }
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `optimized` | `boolean` | Si l'Optimiseur de Contexte s'est exécuté |
| `original_tokens` | `number` | Nombre de tokens du prompt original |
| `tokens_saved` | `number` | Tokens supprimés par l'optimiseur |
| `compression_ratio` | `number` | Part des tokens économisés (ex. `0.40` = 40%) |
| `model_used` | `string` | Modèle ayant traité la requête |
| `cost_usd` | `number` | Coût estimé (après économies d'optimisation) |

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
- Requêtes avec des exemples few-shot soigneusement ajustés
- Requêtes où vous avez déjà minimisé le prompt vous-même

## Exemple d'économies réelles

Une application RAG typique avec :
- Prompt système : 500 tokens
- Contexte récupéré : 2000 tokens
- Historique de conversation : 800 tokens
- Question utilisateur : 50 tokens

**Avant optimisation :** 3 350 tokens → **Après :** ~2 010 tokens → **Économies : ~0,04 $ par requête**

À 10 000 requêtes/jour, cela représente **~400 $/jour** d'économies.

## Disponible sur

Forfait Pro et supérieur.
