---
id: authentication
title: Authentification
description: Apprenez à vous authentifier auprès de l'API GateCtr avec des clés API. Obtenez votre clé, utilisez-la comme token Bearer, faites-la tourner et gardez-la sécurisée.
keywords: [authentification, clé API, token Bearer, sécurité, GateCtr, rotation de clé]
sidebar_label: Authentification
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Authentification

Toutes les requêtes API nécessitent une clé API GateCtr.

## Obtenez votre clé API

1. Connectez-vous sur [gatectr.com](https://gatectr.com)
2. Allez dans **Paramètres → Clés API** dans le [tableau de bord](https://app.gatectr.com)
3. Cliquez sur **Créer une clé**
4. Donnez-lui un nom (ex. `production`, `staging`)
5. Copiez-la et conservez-la en sécurité — elle ne sera plus affichée

## Utilisez votre clé API

Passez-la comme token Bearer dans l'en-tête `Authorization` :

```
Authorization: Bearer gct_live_xxxxxxxxxxxx
```

Ou via le SDK :

<Tabs>
  <TabItem value="nodejs" label="Node.js" default>

```typescript
import { GateCtr } from '@gatectr/sdk';

const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import os
from gatectr import GateCtr

client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl https://api.gatectr.com/v1/complete \
  -H "Authorization: Bearer $GATECTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "model": "gpt-4o", "messages": [...] }'
```

  </TabItem>
</Tabs>

## Format des clés

| Préfixe | Environnement | Cas d'utilisation |
|---------|---------------|-------------------|
| `gct_live_` | Production | Appels LLM réels, coûts réels |
| `gct_test_` | Test | Aucun appel LLM réel — renvoie des réponses simulées |

Utilisez des clés de test dans vos pipelines CI/CD et environnements de développement pour éviter les coûts.

## Créer des clés par environnement

Il est recommandé de créer des clés séparées pour chaque environnement :

- `GATECTR_API_KEY_PROD` — clé de production avec contrôles budgétaires complets
- `GATECTR_API_KEY_STAGING` — clé de staging avec un plafond de tokens bas
- `GATECTR_API_KEY_DEV` — clé en mode test pour le développement local (sans coûts réels)

## Faire tourner une clé

Si une clé est compromise :

1. Allez dans **Paramètres → Clés API** dans le [tableau de bord](https://app.gatectr.com)
2. Trouvez la clé compromise et cliquez sur **Révoquer**
3. Créez immédiatement une nouvelle clé
4. Mettez à jour vos variables d'environnement

Les clés révoquées sont rejetées en quelques secondes.

## Bonnes pratiques de sécurité

- **Ne commitez jamais vos clés API** dans le contrôle de version — utilisez `.gitignore` et des fichiers `.env`
- **Utilisez des variables d'environnement** : stockez sous `GATECTR_API_KEY`
- **Faites tourner les clés régulièrement**, surtout après le départ d'un membre de l'équipe
- **Limitez les clés par projet** — utilisez des clés différentes pour des applications différentes
- **Vos clés de fournisseur LLM** sont chiffrées AES-256 au repos — GateCtr ne les expose jamais aux clients

```bash
# Stockez en sécurité dans .env (non commité dans git)
GATECTR_API_KEY=gct_live_xxxxxxxxxxxx
```

```typescript
// Référencez dans le code Node.js
import { GateCtr } from '@gatectr/sdk';
const client = new GateCtr({ apiKey: process.env.GATECTR_API_KEY });
```

```python
# Référencez dans le code Python
import os
from gatectr import GateCtr
client = GateCtr(api_key=os.environ["GATECTR_API_KEY"])
```

## Que se passe-t-il en cas d'échec d'authentification

Si votre clé est invalide ou manquante, GateCtr retourne :

**HTTP 401 Unauthorized**

```json
{
  "error": {
    "type": "unauthorized",
    "message": "Clé API invalide ou manquante.",
    "request_id": "req_xyz789"
  }
}
```
