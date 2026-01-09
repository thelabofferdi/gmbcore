# Éléments Externes à Gérer - axiosOS

## 🌐 APIs et Services Externes

### ✅ Déjà Configurés
1. **Gemini AI** - `AIzaSyDe9K6gfTLw2UJJvT6yaBsqi9uyveZosXc`
   - Génération de texte, TTS, analyse d'images
   - Quotas : 1,500 req/jour gratuit

2. **Supabase** - `https://dkllpttvzuxsvicikabk.supabase.co`
   - Auth, base de données, storage
   - Projet créé et configuré

### ⚠️ URLs à Mettre à Jour

3. **URLs Fictives dans le Code :**
   ```javascript
   // constants.ts
   officialShopUrl: "https://shopneolife.com/startupforworld/shop/atoz"
   tos_url: "https://axioma-os.com/terms"
   privacy_url: "https://axioma-os.com/privacy"
   
   // SocialSync.tsx
   inviteLink: "https://axioma-app.com/join?ref=${id}"
   ```

4. **Images Externes :**
   ```javascript
   // Dicebear pour avatars
   https://api.dicebear.com/7.x/avataaars/svg
   
   // Unsplash pour backgrounds
   https://images.unsplash.com/photo-1516321318423-f06f85e504b3
   
   // Wikipedia pour icônes sociales
   https://upload.wikimedia.org/wikipedia/commons/
   ```

5. **CDN Externes :**
   ```html
   <!-- index.html -->
   https://cdn.tailwindcss.com
   https://fonts.googleapis.com/css2?family=Inter
   ```

## 🔧 Actions Requises

### Immédiat
- ✅ Remplacer URLs fictives par vraies URLs
- ✅ Configurer domaines de redirection Supabase
- ✅ Créer bucket Storage Supabase

### Production
- 🔄 Migrer de IndexedDB vers Supabase (storageService.ts)
- 🔄 Héberger images localement (éviter dépendances externes)
- 🔄 Configurer domaine personnalisé

## 📊 Dépendances Critiques
1. **Gemini AI** - Cœur de l'app (José)
2. **Supabase** - Auth + Data + Storage
3. **Tailwind CDN** - Interface utilisateur
4. **Google Fonts** - Typographie
