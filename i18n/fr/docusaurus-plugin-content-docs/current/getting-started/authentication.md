---
id: authentication
title: Authentification
description: Apprenez à vous authentifier auprès de l'API GateCtr avec des clés API. Obtenez votre clé, utilisez-la comme token Bearer et gardez-la sécurisée.
keywords: [authentification, clé API, token Bearer, sécurité, GateCtr]
sidebar_label: Authentification
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Authentification

Toutes les requêtes API nécessitent une clé API GateCtr.

## Obtenez votre clé API

1. Connectez-vous sur [gatectr.com](https://gatectr.com)
2. Allez dans **Paramètres → Clés API**
3. Cliquez sur **Créer une clé**
4. Copiez-la et conservez-la en sécurité — elle ne sera plus affichée

## Utilisez votre clé API

Passez-la comme token Bearer dans l'en-tête `Authorization` :

```
Authorization: Bearer gct_live_xxxxxxxxxxxx
```

Ou via le SDK :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

  </TabItem>
</Tabs>

## Format des clés

| Préfixe | Environnement |
|---------|---------------|
| `gct_live_` | Production |
| `gct_test_` | Test (aucun appel LLM réel) |

## Sécurité

- Ne commitez jamais vos clés API dans le contrôle de version
- Utilisez des variables d'environnement : `GATECTR_API_KEY`
- Renouvelez les clés dans **Paramètres → Clés API** si compromises
- Vos clés de fournisseur LLM sont chiffrées AES au repos — GateCtr ne les expose jamais
