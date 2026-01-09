# 🚀 Déploiement axiosOS - Guide Complet

## ✅ État Actuel
- **Build** : Production ready (1.5MB gzippé)
- **Supabase** : Configuré avec auth + storage
- **Gemini AI** : Fonctionnel
- **Variables d'env** : Configurées

## 📦 Déploiement Netlify

### Option 1: Drag & Drop (Plus Rapide)
1. Va sur [netlify.com](https://netlify.com)
2. Drag & drop le dossier `dist/` 
3. Configure les variables d'environnement :
   ```
   VITE_API_KEY=AIzaSyDe9K6gfTLw2UJJvT6yaBsqi9uyveZosXc
   VITE_SUPABASE_URL=https://dkllpttvzuxsvicikabk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbGxwdHR2enV4c3ZpY2lrYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDkzMDYsImV4cCI6MjA4MzUyNTMwNn0.SegAfhr_s0ASdE7mukgB0UZ7Fop9SrukccVJLnH7R-I
   ```

### Option 2: Git Deploy (Automatisé)
1. Push le code sur GitHub
2. Connecte le repo à Netlify
3. Build settings : `npm run build` → `dist`

## 🗄️ Configuration Supabase Storage
1. Va sur : https://supabase.com/dashboard/project/dkllpttvzuxsvicikabk/storage/buckets
2. Crée le bucket `clinical-files` (public)
3. Configure les politiques RLS (voir STORAGE_CONFIG.md)

## 🔗 URLs à Mettre à Jour Après Déploiement
Une fois déployé sur Netlify, remplace dans le code :
- `window.location.origin` → ton domaine Netlify
- URLs fictives → vrais domaines

## 🧪 Tests Post-Déploiement
- ✅ Authentification (inscription/connexion)
- ✅ Assistant José (génération IA)
- ✅ Upload d'images médicales
- ✅ Synthèse vocale
- ✅ Sauvegarde données

**Prêt pour le déploiement !** 🚀
