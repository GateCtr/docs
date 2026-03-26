---
id: context-optimizer
title: Optimiseur de Contexte
description: L'Optimiseur de Contexte de GateCtr compresse automatiquement les prompts LLM jusqu'à 40% — réduisant les coûts de tokens tout en préservant la qualité des réponses.
keywords: [optimiseur de contexte, compression de prompts, réduction de tokens, économies LLM]
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
- Préserve tout le sens sémantique et le contexte

Réduction moyenne : **-40% de tokens**. La qualité des sorties est maintenue.

## Activer

L'Optimiseur de Contexte est activé par défaut sur les forfaits Pro et supérieur.

Pour le contrôler par requête :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const response = await client.complete({
  model: 'gpt-4o',
  messages,
  gatectr: { optimize: true },
});

console.log(response.gatectr.tokens_saved); // ex. 312
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
response = client.complete(
    model="gpt-4o",
    messages=messages,
    gatectr={"optimize": True},
)

print(response.gatectr["tokens_saved"])  # ex. 312
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [...],
    "gatectr": { "optimize": true }
  }'
```

  </TabItem>
</Tabs>

## Champs de réponse

```json
"gatectr": {
  "optimized": true,
  "original_tokens": 800,
  "tokens_saved": 320,
  "compression_ratio": 0.40
}
```

## Désactiver pour une requête spécifique

```typescript
gatectr: { optimize: false }
```

Utile pour les requêtes où la précision du prompt est critique (ex. sortie structurée, génération de code avec formatage exact).

## Disponible sur

Forfait Pro et supérieur.
