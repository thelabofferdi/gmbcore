# Configuration Storage Supabase

## 1. Créer les buckets de stockage
Va sur : https://supabase.com/dashboard/project/dkllpttvzuxsvicikabk/storage/buckets

Crée un bucket :
- **Nom** : `clinical-files`
- **Public** : ✅ Activé (pour accès direct aux fichiers)
- **File size limit** : 50MB
- **Allowed MIME types** : `image/*,audio/*,application/pdf`

## 2. Politiques RLS pour le Storage
Dans Storage > Policies, ajoute :

```sql
-- Policy pour upload
create policy "Users can upload own files" on storage.objects 
for insert with check (auth.uid()::text = (storage.foldername(name))[1]);

-- Policy pour lecture
create policy "Users can view own files" on storage.objects 
for select using (auth.uid()::text = (storage.foldername(name))[1]);

-- Policy pour suppression
create policy "Users can delete own files" on storage.objects 
for delete using (auth.uid()::text = (storage.foldername(name))[1]);
```

## 3. Fonctionnalités disponibles
✅ Upload d'images médicales
✅ Stockage audio (synthèse vocale José)
✅ URLs publiques pour accès direct
✅ Organisation par utilisateur
✅ Sécurité RLS (chaque user voit ses fichiers)
