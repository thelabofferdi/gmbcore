# 🌐 Configuration Domaine Namecheap avec Netlify

## 1. Configuration dans Netlify

### Ajouter le domaine personnalisé
1. Va sur ton site Netlify → **Domain settings**
2. **Add custom domain** → Tape ton domaine (ex: `axiosOS.com`)
3. Netlify va te donner les DNS à configurer

### Obtenir les DNS Netlify
Netlify va afficher quelque chose comme :
```
Type: CNAME
Name: www
Value: ton-site.netlify.app

Type: A
Name: @
Value: 75.2.60.5 (IP de Netlify)
```

## 2. Configuration dans Namecheap

### Accéder aux DNS
1. Connecte-toi sur [namecheap.com](https://namecheap.com)
2. **Domain List** → Clique sur ton domaine
3. **Advanced DNS** tab

### Configurer les enregistrements
Supprime les enregistrements existants et ajoute :

```
Type: A Record
Host: @
Value: 75.2.60.5
TTL: Automatic

Type: CNAME Record  
Host: www
Value: ton-site.netlify.app
TTL: Automatic
```

## 3. SSL/HTTPS
- Netlify configure automatiquement le SSL gratuit
- Attendre 24-48h pour propagation DNS
- Forcer HTTPS dans Netlify settings

## 4. Mettre à jour Supabase
Une fois le domaine actif, dans Supabase :
- Site URL: `https://ton-domaine.com`
- Redirect URLs: `https://ton-domaine.com/**`

## 5. Variables d'environnement
Pas besoin de changer les variables Netlify, elles fonctionneront avec le nouveau domaine.

**Temps de propagation :** 1-24 heures selon les DNS
