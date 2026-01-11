# 🚀 Guide de Déploiement GMB CORE OS

## 📋 Prérequis

- Node.js 18+ 
- Compte Vercel
- Compte Supabase
- Clés API Gemini (9 clés recommandées)

## ⚡ Déploiement Rapide

### 1. **Installation**
```bash
git clone https://github.com/thelabofferdi/gmbcore.git
cd gmbcore
npm install
```

### 2. **Configuration Backend (Supabase)**

#### Variables d'environnement (.env.local)
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

#### Base de données
```sql
-- Exécuter dans l'éditeur SQL Supabase
-- Tables créées automatiquement via les migrations dans /supabase/migrations/
```

### 3. **Configuration Frontend**

#### Clés API Gemini (config/api-keys.json)
```json
{
  "keys": [
    "AIzaSyD...", "AIzaSyE...", "AIzaSyF...",
    "AIzaSyG...", "AIzaSyH...", "AIzaSyI...",
    "AIzaSyJ...", "AIzaSyK...", "AIzaSyL..."
  ],
  "fallbackEnabled": true,
  "maxRetries": 3
}
```

#### Configuration distributeur (constants.ts)
```typescript
export const SYSTEM_CONFIG = {
  founder: {
    id: "067-2922111", // ⚠️ MODIFIER avec l'ID du distributeur
    name: "ABADA M. José Gaétan", // ⚠️ MODIFIER
    webAlias: "startupforworld" // ⚠️ MODIFIER
  }
}
```

### 4. **Déploiement Vercel**

#### Via CLI
```bash
npm run build
npx vercel --prod
```

#### Variables d'environnement Vercel
```bash
# Ajouter dans le dashboard Vercel
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

#### Domaine personnalisé
```bash
# Dans Vercel Dashboard > Settings > Domains
# Ajouter : votredomaine.com
# Configurer DNS : A record → 76.76.19.61
```

## 🔧 Configuration Multi-Distributeurs

### Pour créer une nouvelle instance :

1. **Fork le repo**
2. **Modifier les constantes** :
   ```typescript
   // constants.ts
   export const SYSTEM_CONFIG = {
     founder: {
       id: "067-NOUVEAU-ID",
       name: "Nom Distributeur", 
       webAlias: "alias-distributeur"
     }
   }
   ```
3. **Déployer sur nouveau domaine**
4. **Configurer les variables d'environnement**

## 🐛 Résolution de Problèmes

### Erreur de compilation
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erreur Supabase
- Vérifier les URLs et clés
- Vérifier les politiques RLS
- Vérifier les migrations

### Erreur Gemini API
- Vérifier les 9 clés dans api-keys.json
- Tester les clés individuellement
- Vérifier les quotas API

## 📱 Test Mobile

```bash
# Test local
npm run dev
# Ouvrir sur mobile via IP local
```

## 🔄 Mise à jour

```bash
git pull origin main
npm install
npm run build
npx vercel --prod
```

## 📞 Support

- **Repo :** https://github.com/thelabofferdi/gmbcore
- **Issues :** Créer une issue GitHub
- **Docs :** Voir README.md et INSTANCE_CONFIG.md
