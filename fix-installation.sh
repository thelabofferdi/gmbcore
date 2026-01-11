#!/bin/bash

# 🚨 SCRIPT DE RÉPARATION GMB CORE OS
# ⚠️ OBLIGATOIRE avant tout déploiement

echo "🔧 Réparation de l'installation GMB CORE OS..."
echo "⚠️  Installation corrompue détectée"

# 1. Nettoyage complet
echo "🧹 Nettoyage des dépendances corrompues..."
rm -rf node_modules package-lock.json

# 2. Réinstallation propre
echo "📦 Réinstallation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation npm"
    exit 1
fi

# 3. Test de compilation OBLIGATOIRE
echo "🔨 Test de compilation OBLIGATOIRE..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur de compilation - NE PAS DÉPLOYER"
    exit 1
fi

echo "✅ Installation réparée avec succès !"
echo ""
echo "🧪 PROCHAINE ÉTAPE - Test en preview:"
echo "   npx vercel"
echo ""
echo "🚀 SI preview OK - Déploiement production:"
echo "   npx vercel --prod"
echo ""
echo "⚠️  NE PAS déployer en production sans tester le preview d'abord !"
