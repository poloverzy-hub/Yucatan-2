# Yucatán — questionnaire familial

Une petite application mobile en français pour recueillir les envies de **Marie-Jo** et **Tabeth**, puis les comparer dans un espace organisateur privé.

Elle ne dépend d’aucune clé côté navigateur : le site statique appelle trois fonctions Netlify. Celles-ci vérifient le code personnel, signent une session de 8 heures et enregistrent/lisent les réponses côté Supabase avec une clé secrète conservée par Netlify.

## Ce qui est inclus

- Cinq univers illustrés : farniente, fonds marins, nature et cénotes, cités mayas, villes/haciendas.
- Quatre votes pour chaque univers : *Pas du tout*, *Un peu*, *Beaucoup*, *Passionnément*.
- Un code distinct pour Marie-Jo, Tabeth et l’organisateur.
- Une réponse par personne, réenregistrable à volonté ; chaque enregistrement remplace le précédent.
- Une page organisateur qui affiche le comparatif, sans exposer les réponses aux participantes.
- Une table Supabase avec RLS activée et aucune politique publique.

## Mise en ligne (compter environ 20 minutes)

### 1. Créer le projet Supabase gratuit

1. Ouvrez [supabase.com/dashboard](https://supabase.com/dashboard), créez un compte puis **New project**.
2. Donnez-lui un nom, choisissez une région proche de vous et conservez le mot de passe de base de données dans votre gestionnaire de mots de passe (il ne sert pas au site).
3. Une fois le projet prêt, ouvrez **SQL Editor** → **New query**.
4. Copiez-collez tout le contenu de [`supabase/schema.sql`](supabase/schema.sql), puis cliquez sur **Run**. Cela crée la table et interdit tout accès direct depuis un navigateur.
5. Dans **Connect**, copiez l’URL du projet. Dans **Settings** → **API Keys**, créez ou copiez une **Secret key** (elle commence par `sb_secret_`). Ne choisissez pas la Publishable key.

> La Secret key donne des droits élevés : elle ne doit jamais être envoyée par WhatsApp, mise dans GitHub, ni ajoutée aux fichiers de ce projet. Elle sera saisie uniquement dans les variables secrètes de Netlify.

### 2. Préparer les codes

Choisissez trois codes longs et tous différents (au moins 16 caractères, idéalement une petite phrase + chiffres) :

- `MARIE_JO_CODE` : celui à communiquer seulement à Marie-Jo ;
- `TABETH_CODE` : celui à communiquer seulement à Tabeth ;
- `ORGANIZER_CODE` : le vôtre, à ne pas diffuser ;
- `SESSION_SIGNING_SECRET` : une quatrième valeur aléatoire de plus de 32 caractères, jamais communiquée. Vous pouvez en générer une dans un gestionnaire de mots de passe.

### 3. Mettre le projet dans GitHub

Netlify peut déployer directement depuis GitHub. Créez un **nouveau dépôt privé** GitHub, puis envoyez-y tous les fichiers de ce dossier, **sauf** un éventuel `.env`. Le fichier `.env.example` est seulement un modèle et ne contient pas de secrets.

Si vous préférez ne pas utiliser GitHub, Netlify permet aussi de glisser-déposer un dossier ; dans ce cas, utilisez le dossier complet afin d’inclure `netlify/functions`. Le raccordement GitHub reste le plus simple pour mettre à jour le questionnaire ensuite.

### 4. Créer le site Netlify gratuit

1. Ouvrez [app.netlify.com](https://app.netlify.com) et créez un compte gratuit.
2. Cliquez **Add new project** → **Import an existing project**, puis autorisez GitHub et choisissez le dépôt privé.
3. Netlify détecte `netlify.toml`. Laissez les réglages proposés : publication `site`, fonctions `netlify/functions`. Il n’y a pas de commande de build obligatoire.
4. Avant de déployer, ouvrez **Site configuration** → **Environment variables** et ajoutez ces six variables, toutes avec portée **Production** :

| Nom | Valeur |
| --- | --- |
| `SUPABASE_URL` | l’URL du projet Supabase |
| `SUPABASE_SECRET_KEY` | la Secret key Supabase (`sb_secret_…`) |
| `MARIE_JO_CODE` | le code de Marie-Jo |
| `TABETH_CODE` | le code de Tabeth |
| `ORGANIZER_CODE` | votre code organisateur |
| `SESSION_SIGNING_SECRET` | la longue valeur aléatoire |

5. Cliquez **Deploy**. À la fin, Netlify affiche une adresse du type `https://nom-choisi.netlify.app` ; renommez-la dans **Domain management** si vous le souhaitez.

Les variables sont lues par les fonctions côté serveur. Ne les préfixez pas avec `VITE_`, `NEXT_PUBLIC_` ou `PUBLIC_`, ce qui les rendrait visibles dans la page.

### 5. Vérifier avant l’envoi WhatsApp

1. Ouvrez l’URL Netlify en navigation privée.
2. Testez le code Marie-Jo, choisissez les cinq votes et enregistrez.
3. Faites de même avec le code Tabeth.
4. Ouvrez de nouveau le lien avec votre code organisateur : le tableau doit montrer les deux lignes de votes.
5. Envoyez le **même lien Netlify** sur WhatsApp à chacune, avec son code dans un message séparé. Aucun nom de participante n’est nécessaire dans l’URL.

## Utilisation quotidienne

- Une participante peut rouvrir le lien et saisir à nouveau son code pour modifier ses réponses.
- Le tableau organisateur se recharge quand vous ouvrez le lien avec votre code. Les sessions expirent automatiquement après 8 heures ou quand on clique sur « Quitter ».
- Pour fermer le questionnaire après le voyage, dans Netlify, retirez temporairement les variables de codes ou désactivez le site. Gardez la Secret key privée.

## Développement local facultatif

Copiez `.env.example` en `.env`, remplissez les valeurs puis exécutez `npm run serve`. Netlify CLI proposera l’adresse locale. Cette étape est facultative pour une publication GitHub + Netlify.

## Sécurité — en bref

Les codes sont comparés dans une fonction Netlify, pas dans le JavaScript livré aux téléphones. La clé secrète Supabase reste uniquement dans Netlify ; elle permet aux fonctions de contourner RLS, tandis que les rôles navigateur (`anon` et `authenticated`) n’ont aucun droit sur `trip_responses`. Supabase recommande précisément une Secret key pour les composants serveur et rappelle qu’elle ne doit jamais être exposée dans un navigateur. [Documentation Supabase](https://supabase.com/docs/guides/getting-started/api-keys) · [variables Netlify](https://docs.netlify.com/build/environment-variables/overview/)

Ce système protège les données contre un accès direct au tableau ou à Supabase. Comme pour tout lien protégé par code, utilisez des codes longs et évitez de les transférer dans une conversation de groupe.
