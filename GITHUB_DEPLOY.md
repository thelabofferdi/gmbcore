# 🔐 Configuration GitHub pour Déploiement

## 1. Créer un Token GitHub
1. Va sur : https://github.com/settings/tokens
2. "Generate new token" → "Classic"
3. Sélectionne les scopes : `repo`, `workflow`
4. Copie le token généré

## 2. Configurer Git avec le Token
```bash
cd axiosOS
git remote set-url origin https://TOKEN@github.com/thelabofferdi/gmbcore.git
git push -u origin main
```

## 3. Déploiement Netlify depuis GitHub
1. Va sur [netlify.com](https://netlify.com)
2. "New site from Git" → GitHub
3. Sélectionne le repo `thelabofferdi/gmbcore`
4. Build settings :
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Variables d'environnement :
   ```
   VITE_API_KEY=AIzaSyDe9K6gfTLw2UJJvT6yaBsqi9uyveZosXc
   VITE_SUPABASE_URL=https://dkllpttvzuxsvicikabk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbGxwdHR2enV4c3ZpY2lrYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDkzMDYsImV4cCI6MjA4MzUyNTMwNn0.SegAfhr_s0ASdE7mukgB0UZ7Fop9SrukccVJLnH7R-I
   ```

## 4. Déploiement Automatique
Une fois configuré, chaque push sur `main` déclenchera un déploiement automatique !

**Status :** ✅ Code prêt, commit créé, besoin du token GitHub
