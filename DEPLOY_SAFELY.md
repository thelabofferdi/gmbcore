# 🚨 DÉPLOIEMENT SÉCURISÉ - OBLIGATOIRE

## ⚠️ ATTENTION DÉVELOPPEUR

L'installation `node_modules` est **CORROMPUE**. Ne pas déployer directement en production !

## 🔧 PROCÉDURE OBLIGATOIRE

### 1. **RÉPARATION D'ABORD** ⚠️
```bash
# Nettoyer l'installation corrompue
rm -rf node_modules package-lock.json

# Réinstaller proprement
npm install

# VÉRIFIER que ça compile
npm run build
```

### 2. **TEST EN PREVIEW** 🧪
```bash
# Déployer en environnement de test
npx vercel

# ✅ Tester sur l'URL temporaire fournie
# ✅ Vérifier toutes les fonctionnalités
# ✅ Tester sur mobile et desktop
```

### 3. **PRODUCTION SEULEMENT SI OK** 🚀
```bash
# SI le preview fonctionne parfaitement
npx vercel --prod

# SINON, ne pas déployer !
```

## 🎯 NOUVELLES FONCTIONNALITÉS À TESTER

- ✅ Interface GMB CORE OS (avec `?prospect=test`)
- ✅ Responsive mobile (tous écrans)
- ✅ Système multi-distributeurs
- ✅ Timeout 5s anti-blocage
- ✅ 9 clés API Gemini
- ✅ Questions courtes José
- ✅ TTS optimisé

## 🆘 EN CAS DE PROBLÈME

```bash
# Revenir à la version stable
git revert HEAD
npx vercel --prod
```

## 📞 CONTACT

Si problème : créer une issue GitHub avec logs d'erreur.

---
**⚠️ NE JAMAIS SKIP CETTE PROCÉDURE ⚠️**
