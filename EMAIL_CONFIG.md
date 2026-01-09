# Configuration Email Supabase

## 1. Accéder aux paramètres
- Va sur : https://supabase.com/dashboard/project/dkllpttvzuxsvicikabk
- Authentication > Settings

## 2. Configuration Email Confirmation
- **Enable email confirmations** : ✅ Activé
- **Confirm email change** : ✅ Activé  
- **Enable secure email change** : ✅ Activé

## 3. URLs de redirection
Dans "Site URL" et "Redirect URLs", ajoute :
```
http://localhost:5173
https://ton-domaine-netlify.netlify.app
```

## 4. Templates Email (Authentication > Email Templates)

### Template de Confirmation :
```html
<h2>Confirmez votre compte axiosOS</h2>
<p>Bienvenue dans l'écosystème NDSA GMBC OS !</p>
<p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
<p><a href="{{ .ConfirmationURL }}">Confirmer mon compte</a></p>
<p>Ce lien expire dans 24 heures.</p>
<p>L'équipe axiosOS</p>
```

### Template de Récupération :
```html
<h2>Réinitialisation de mot de passe</h2>
<p>Vous avez demandé à réinitialiser votre mot de passe axiosOS.</p>
<p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>
<p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
<p>L'équipe axiosOS</p>
```

## 5. Configuration SMTP (Optionnel)
Pour un email professionnel, configure ton propre SMTP dans Settings > Auth
