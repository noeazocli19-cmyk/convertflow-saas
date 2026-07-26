# ConvertFlow SaaS - Guide d'installation

## Prérequis

- **Node.js** 18+ 
- **pnpm** (install : `npm install -g pnpm`)
- Un compte **Neon PostgreSQL** (gratuit)

## Installation en 5 étapes

### 1. Cloner et installer

```bash
unzip convertflow-saas.zip
cd convertflow-saas
pnpm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos clés :

| Variable | Obligatoire | Où la trouver |
|----------|-------------|---------------|
| `DATABASE_URL` | ✅ Oui | [Neon Console](https://console.neon.tech) → Projet → Connection Details |
| `NEXTAUTH_SECRET` | ✅ Oui | Générer : `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ Oui | `http://localhost:3000` en local |
| `CLOUDCONVERT_API_KEY` | Recommandé | [CloudConvert](https://cloudconvert.com/dashboard/api/v2/keys) |
| `CONVERTAPI_SECRET` | Alternative | [ConvertAPI](https://www.convertapi.com) → Dashboard → API Secret |
| `CLOUDINARY_*` | Optionnel | [Cloudinary Console](https://console.cloudinary.com) → Settings → API Keys |
| `RESEND_API_KEY` | Optionnel | [Resend](https://resend.com) → Dashboard → API Keys |

### 3. Base de données

```bash
pnpm db:push
```

### 4. Lancer en développement

```bash
pnpm dev
```

### 5. Ouvrir dans le navigateur

👉 http://localhost:3000

---

## Où obtenir les clés API pour la conversion

### 🔴 OBLIGATOIRE

#### Neon PostgreSQL (Base de données)
1. Allez sur **https://console.neon.tech**
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Copiez la **Connection string** dans les paramètres
5. Collez-la dans `DATABASE_URL` de votre `.env`

### 🟡 RECOMMANDÉ (au moins un)

#### CloudConvert (200+ formats de conversion)
1. Allez sur **https://cloudconvert.com**
2. Créez un compte gratuit
3. Allez dans **Dashboard → API → API Keys**
4. Créez une clé API
5. Collez-la dans `CLOUDCONVERT_API_KEY`
- **Gratuit** : 25 conversions/jour
- **Payant** : $9/mois pour 1 000 conversions

#### ConvertAPI (Alternative à CloudConvert)
1. Allez sur **https://www.convertapi.com**
2. Créez un compte gratuit
3. Allez dans **Dashboard → API Secret**
4. Copiez le secret
5. Collez-le dans `CONVERTAPI_SECRET`
- **Gratuit** : 1 500 conversions/mois

### 🟢 OPTIONNEL

#### Cloudinary (Stockage images)
1. Allez sur **https://console.cloudinary.com**
2. Créez un compte gratuit
3. Allez dans **Settings → API Keys**
4. Copiez Cloud Name, API Key et API Secret
- **Gratuit** : 25 GB stockage

#### Resend (Emails transactionnels)
1. Allez sur **https://resend.com**
2. Créez un compte gratuit
3. Allez dans **Dashboard → API Keys → Create API Key**
4. Collez-la dans `RESEND_API_KEY`
- **Gratuit** : 100 emails/jour

---

## Ce qui fonctionne SANS clé API de conversion

Même sans CloudConvert/ConvertAPI, ces conversions fonctionnent déjà grâce aux **librairies locales** :

| Fonctionnalité | Librairie | Pas besoin de clé API |
|---------------|-----------|----------------------|
| Image → Image (PNG, JPG, WebP, AVIF, GIF, TIFF, BMP) | **Sharp** | ✅ |
| Redimensionner une image | **Sharp** | ✅ |
| Compresser une image | **Sharp** | ✅ |
| Rotation d'image | **Sharp** | ✅ |
| Fusionner des PDF | **pdf-lib** | ✅ |
| Diviser des PDF | **pdf-lib** | ✅ |
| Compresser des PDF | **pdf-lib** | ✅ |
| Ajouter un filigrane | **pdf-lib** | ✅ |
| Numéroter les pages | **pdf-lib** | ✅ |
| Signer un PDF | **pdf-lib** | ✅ |
| Rotation de pages PDF | **pdf-lib** | ✅ |
| Supprimer des pages PDF | **pdf-lib** | ✅ |
| Extraire des pages PDF | **pdf-lib** | ✅ |

## Ce qui NÉCESSITE une clé API (CloudConvert ou ConvertAPI)

| Fonctionnalité | Pourquoi |
|---------------|----------|
| DOCX → PDF | Nécessite LibreOffice ou API externe |
| XLSX → PDF | Nécessite LibreOffice ou API externe |
| PPTX → PDF | Nécessite LibreOffice ou API externe |
| Vidéo → Vidéo (MP4, AVI, etc.) | Nécessite FFmpeg ou API externe |
| Audio → Audio (MP3, WAV, etc.) | Nécessite FFmpeg ou API externe |
| eBook (ePUB, MOBI) | Nécessite Calibre ou API externe |

---

## Déploiement sur Vercel

```bash
pnpm build
```

1. Poussez le code sur GitHub
2. Connectez le repo dans [Vercel](https://vercel.com)
3. Ajoutez les variables d'environnement dans les paramètres Vercel
4. Déployez !

---

## Commandes utiles

```bash
pnpm dev          # Lancer en développement
pnpm build        # Build de production
pnpm start        # Lancer en production
pnpm lint         # Vérifier le code
pnpm db:push      # Pousser le schéma Prisma vers la BDD
pnpm db:migrate   # Créer une migration
pnpm db:studio    # Ouvrir Prisma Studio (interface BDD)
pnpm db:reset     # Réinitialiser la BDD
```
