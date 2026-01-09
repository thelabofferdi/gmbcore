# 🔧 Configuration URLs Supabase pour Production

## 1. Mettre à jour les URLs de redirection dans Supabase

Va sur : https://supabase.com/dashboard/project/dkllpttvzuxsvicikabk/auth/url-configuration

### Site URL
Remplace `http://localhost:5173` par ton URL Netlify :
```
https://ton-site.netlify.app
```

### Redirect URLs
Ajoute ton domaine Netlify :
```
https://ton-site.netlify.app
https://ton-site.netlify.app/**
```

## 2. Variables d'environnement Netlify
Assure-toi que les variables sont bien configurées dans Netlify :
- Site settings > Environment variables

## 3. Test après configuration
1. ✅ Inscription → Email reçu avec bon lien
2. ✅ Clic sur lien → Redirection vers ton site
3. ✅ Connexion → Accès à l'app

## 4. Redéploiement
Après avoir mis à jour le code, push sur GitHub :
```bash
git add .
git commit -m "fix: Update email redirect URLs for production"
git push origin main
```

Netlify redéploiera automatiquement avec les bonnes URLs !
