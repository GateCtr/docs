---
id: quickstart
title: Démarrage rapide
description: Démarrez avec GateCtr en 5 minutes. Installez le SDK, obtenez une clé API et effectuez votre première requête LLM via la passerelle.
keywords: [démarrage rapide, installation SDK, clé API, première requête]
sidebar_label: Démarrage rapide
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Démarrage rapide

Opérationnel en 5 min. Aucune modification de code requise.

## 1. Obtenez votre clé API

Créez un compte sur [gatectr.com](https://gatectr.com) et récupérez votre clé API depuis le tableau de bord.

## 2. Installez le SDK

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```bash
npm install @gatectr/sdk
```

  </TabItem>
  <TabItem value="python" label="Python">

```bash
pip install gatectr-sdk
```

  </TabItem>
  <TabItem value="curl" label="cURL">

Aucune installation nécessaire.

  </TabItem>
</Tabs>

## 3. Effectuez votre première requête

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Bonjour' }],
});

console.log(response.choices[0].message.content);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Bonjour"}],
)

print(response.choices[0].message.content)
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{ "role": "user", "content": "Bonjour" }]
  }'
```

  </TabItem>
</Tabs>

C'est tout. GateCtr optimise, route et trace maintenant chaque requête.

## Ce qui vient de se passer

- L'Optimiseur de Contexte a compressé votre prompt avant de l'envoyer au LLM
- Le Pare-feu Budgétaire a vérifié vos limites de projet
- Les analytiques ont enregistré l'utilisation des tokens et le coût dans votre tableau de bord

## Prochaines étapes

- [Configurer un Pare-feu Budgétaire](../features/budget-firewall.md)
- [Activer l'Optimiseur de Contexte](../features/context-optimizer.md)
- [Configurer les Webhooks](../features/webhooks.md)
