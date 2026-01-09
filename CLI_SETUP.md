# Création Projet Supabase via CLI

## Option 1: Via Interface Web (Recommandé)
1. Va sur [supabase.com](https://supabase.com)
2. Crée un projet "axiosOS"
3. Récupère URL + anon key dans Settings > API

## Option 2: Via CLI (Nécessite token)
1. **Obtenir un token d'accès :**
   - Va sur [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
   - Crée un nouveau token d'accès
   - Copie le token

2. **Se connecter :**
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_token_here
   npx supabase login
   ```

3. **Créer le projet :**
   ```bash
   npx supabase projects create axiosOS --db-password your_secure_password --region eu-west-1
   ```

4. **Lier le projet local :**
   ```bash
   npx supabase link --project-ref your_project_ref
   ```

5. **Déployer le schéma :**
   ```bash
   npx supabase db push
   ```

## Recommandation
Pour aller plus vite, utilise l'interface web pour créer le projet et récupérer les clés. Le CLI est plus utile pour la gestion quotidienne du projet.
