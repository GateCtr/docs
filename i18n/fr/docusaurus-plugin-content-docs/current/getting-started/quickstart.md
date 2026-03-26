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

Opérationnel en 5 min. Aucune modification de code nécessaire.

## 1. Obtenez votre clé API

Inscrivez-vous sur [gatectr.com](https://gatectr.com) et récupérez votre clé API depuis le [tableau de bord](https://app.gatectr.com).

Votre clé ressemblera à `gct_live_xxxxxxxxxxxx`. Stockez-la dans une variable d'environnement — ne la committez jamais dans votre code source.

```bash
export GATECTR_API_KEY="gct_live_xxxxxxxxxxxx"
```

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
# ou
uv add gatectr-sdk
```

  </TabItem>
  <TabItem value="curl" label="cURL">

Aucune installation nécessaire.

  </TabItem>
</Tabs>

## 3. Faites votre première requête

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });

const response = await client.complete({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Bonjour' }],
});

console.log(response.choices[0].text);
// → "Bonjour ! Comment puis-je vous aider ?"

// Métadonnées GateCtr sur chaque réponse
console.log(response.gatectr.tokensSaved);  // tokens économisés par l'optimiseur
console.log(response.gatectr.modelUsed);    // modèle qui a traité la requête
console.log(response.gatectr.latencyMs);    // latence bout-en-bout
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])

response = await client.complete(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Bonjour"}],
)

print(response.choices[0].text)
# → "Bonjour ! Comment puis-je vous aider ?"

# Métadonnées GateCtr sur chaque réponse
print(response.gatectr.tokens_saved)  # tokens économisés par l'optimiseur
print(response.gatectr.model_used)    # modèle qui a traité la requête
print(response.gatectr.latency_ms)    # latence bout-en-bout
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

C'est tout. GateCtr optimise, route et suit maintenant chaque requête.

## 4. Remplacement OpenAI (optionnel)

Vous utilisez déjà le SDK OpenAI ? Pointez-le vers GateCtr — aucune autre modification :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GATECTR_API_KEY,
  baseURL: 'https://api.gatectr.com/v1',
});

// Tous les appels existants fonctionnent sans modification
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Bonjour' }],
});
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["GATECTR_API_KEY"],
    base_url="https://api.gatectr.com/v1",
)

# Tous les appels existants fonctionnent sans modification
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Bonjour"}],
)
```

  </TabItem>
</Tabs>

## Ce qui vient de se passer

- **L'Optimiseur de Contexte** a compressé votre prompt avant de l'envoyer au LLM
- **Le Pare-feu Budgétaire** a vérifié vos limites de projet
- **Les Analytiques** ont enregistré l'utilisation des tokens et le coût dans votre tableau de bord

Consultez le détail complet de l'utilisation sur [app.gatectr.com](https://app.gatectr.com).

## Prochaines étapes

- [Configurer un Pare-feu Budgétaire](../features/budget-firewall.md) — éviter les coûts incontrôlés
- [Activer l'Optimiseur de Contexte](../features/context-optimizer.md) — économiser jusqu'à 40% sur les tokens
- [Utiliser le Routeur de Modèles](../features/model-router.md) — choisir automatiquement le modèle le moins cher
- [Configurer les Webhooks](../features/webhooks.md) — recevoir des alertes Slack sur les événements budgétaires
