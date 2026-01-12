# 🚨 CLÉS API À METTRE À JOUR

## Problème Critique
La clé API Gemini a été compromise et doit être remplacée immédiatement.

## Actions Requises

### 1. Nouvelle Clé Gemini
1. Aller sur https://aistudio.google.com/app/apikey
2. Créer une nouvelle clé API
3. Remplacer `NOUVELLE_CLE_GEMINI_ICI` dans `.env`

### 2. Variables Vercel
Mettre à jour la variable `VITE_API_KEY` dans Vercel :
- Dashboard Vercel → Settings → Environment Variables
- Remplacer par la nouvelle clé

### 3. Redéploiement
```bash
git add .
git commit -m "fix: Update Gemini API key"
git push
npx vercel --prod
```

## Sécurité
- ✅ Ancienne clé révoquée automatiquement par Google
- ✅ Nouvelle clé à garder secrète
- ✅ Ne jamais commiter les clés dans Git
