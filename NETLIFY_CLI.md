# 🚀 Netlify CLI - Gestion Domaine

## ✅ Status Actuel
- **Site** : serene-taffy-d0c529
- **URL** : https://gmbcoreos.com
- **Repo** : https://github.com/thelabofferdi/gmbcore
- **CLI** : Connecté et lié

## 🌐 Commandes Netlify CLI pour Domaines

### Voir les domaines
```bash
npx netlify open:site  # Ouvre le dashboard
npx netlify open:admin # Ouvre les settings
```

### Déploiement
```bash
npx netlify build      # Build local
npx netlify deploy     # Deploy preview
npx netlify deploy --prod  # Deploy production
```

### Variables d'environnement
```bash
npx netlify env:list   # Voir les variables
npx netlify env:set VITE_API_KEY "AIzaSyDe9K6gfTLw2UJJvT6yaBsqi9uyveZosXc"
```

## 🔧 Configuration Domaine Namecheap
Ton site est déjà sur **gmbcoreos.com** !

### Mettre à jour Supabase
Va sur : https://supabase.com/dashboard/project/dkllpttvzuxsvicikabk/auth/url-configuration

Remplace :
- **Site URL** : `https://gmbcoreos.com`
- **Redirect URLs** : `https://gmbcoreos.com/**`

## 🎯 Prochaines étapes
1. ✅ Vérifier variables d'env Netlify
2. ✅ Mettre à jour URLs Supabase  
3. ✅ Tester l'authentification sur gmbcoreos.com
