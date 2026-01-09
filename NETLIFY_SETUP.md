# 🎉 axiosOS Déployé sur GitHub !

## ✅ Status
- **Repository** : https://github.com/thelabofferdi/gmbcore
- **Branch** : main
- **Commit** : Code complet avec Supabase + Gemini AI

## 🚀 Déploiement Netlify

### Étapes Suivantes :
1. **Va sur** : [netlify.com](https://netlify.com)
2. **"New site from Git"** → GitHub
3. **Sélectionne** : `thelabofferdi/gmbcore`
4. **Build settings** :
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `axiosOS` (important !)

5. **Variables d'environnement** (Site settings > Environment variables) :
   ```
   VITE_API_KEY=AIzaSyDe9K6gfTLw2UJJvT6yaBsqi9uyveZosXc
   VITE_SUPABASE_URL=https://dkllpttvzuxsvicikabk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbGxwdHR2enV4c3ZpY2lrYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDkzMDYsImV4cCI6MjA4MzUyNTMwNn0.SegAfhr_s0ASdE7mukgB0UZ7Fop9SrukccVJLnH7R-I
   ```

## 🗄️ Configuration Supabase Storage
Après déploiement, configure le bucket :
- https://supabase.com/dashboard/project/dkllpttvzuxsvicikabk/storage/buckets
- Créer bucket `clinical-files` (public)

## 🔄 Déploiement Automatique
Chaque push sur `main` déclenchera un redéploiement automatique !

**Prêt pour Netlify !** 🚀
