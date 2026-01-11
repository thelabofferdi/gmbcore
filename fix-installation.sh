#!/bin/bash

# 🚨 SCRIPT DE RÉPARATION GMB CORE OS
# Utiliser si l'agent dev a cassé l'installation

echo "🔧 Réparation de l'installation GMB CORE OS..."

# 1. Nettoyage complet
echo "🧹 Nettoyage des dépendances corrompues..."
rm -rf node_modules package-lock.json

# 2. Réinstallation propre
echo "📦 Réinstallation des dépendances..."
npm install

# 3. Test de compilation
echo "🔨 Test de compilation..."
npm run build

# 4. Déploiement
echo "🚀 Déploiement..."
npx vercel --prod --yes

echo "✅ Réparation terminée !"
echo "🌐 App disponible sur : https://gmbcoreos.com"
