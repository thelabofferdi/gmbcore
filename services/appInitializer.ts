import { apiKeyManager } from './services/apiKeyManager';

// Initialiser les clés API au démarrage de l'application
export const initializeApp = async () => {
  try {
    console.log('🚀 Initialisation de GMB CORE OS...');
    
    // Initialiser les clés API dans Supabase
    await apiKeyManager.initializeKeys();
    
    // Tester qu'au moins une clé fonctionne
    const workingKey = await apiKeyManager.getWorkingKey();
    
    if (workingKey) {
      console.log('✅ Système de clés API opérationnel');
    } else {
      console.warn('⚠️ Aucune clé API fonctionnelle - José sera indisponible');
    }
    
    console.log('✅ GMB CORE OS initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
};

// Auto-initialisation
if (typeof window !== 'undefined') {
  // Initialiser après le chargement de la page
  window.addEventListener('load', initializeApp);
} else {
  // Initialiser immédiatement en mode serveur
  initializeApp();
}
