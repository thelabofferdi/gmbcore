import { GoogleGenAI } from "@google/genai";
import apiKeysConfig from '../config/api-keys.json';

interface ApiKey {
  key: string;
  name: string;
  status: 'active' | 'rate_limited' | 'invalid';
  last_used: string | null;
  error_count: number;
}

class ApiKeyManager {
  private keys: ApiKey[] = apiKeysConfig.gemini_keys;
  private currentKeyIndex = 0;
  private maxRetries = apiKeysConfig.fallback_config.max_retries;

  // Obtenir la clé active actuelle
  getCurrentKey(): string {
    const activeKeys = this.keys.filter(k => k.status === 'active');
    if (activeKeys.length === 0) {
      throw new Error('Aucune clé API disponible');
    }
    
    const key = activeKeys[this.currentKeyIndex % activeKeys.length];
    return key.key;
  }

  // Marquer une clé comme ayant une erreur
  markKeyError(keyValue: string, errorType: 'rate_limit' | 'invalid' | 'other') {
    const keyObj = this.keys.find(k => k.key === keyValue);
    if (!keyObj) return;

    keyObj.error_count++;
    keyObj.last_used = new Date().toISOString();

    if (errorType === 'rate_limit') {
      keyObj.status = 'rate_limited';
      console.log(`🔑 Clé ${keyObj.name} mise en rate limit`);
    } else if (errorType === 'invalid') {
      keyObj.status = 'invalid';
      console.log(`🔑 Clé ${keyObj.name} marquée comme invalide`);
    }

    // Passer à la clé suivante
    this.rotateKey();
  }

  // Rotation vers la clé suivante
  private rotateKey() {
    const activeKeys = this.keys.filter(k => k.status === 'active');
    if (activeKeys.length > 1) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % activeKeys.length;
      console.log(`🔄 Rotation vers la clé: ${activeKeys[this.currentKeyIndex].name}`);
    }
  }

  // Marquer une clé comme utilisée avec succès
  markKeySuccess(keyValue: string) {
    const keyObj = this.keys.find(k => k.key === keyValue);
    if (keyObj) {
      keyObj.last_used = new Date().toISOString();
      keyObj.error_count = Math.max(0, keyObj.error_count - 1); // Réduire le compteur d'erreurs
    }
  }

  // Obtenir une instance GoogleGenAI avec fallback automatique
  async getAIInstance(): Promise<{ ai: GoogleGenAI; keyUsed: string }> {
    let attempts = 0;
    let lastError: any;

    while (attempts < this.maxRetries) {
      try {
        const currentKey = this.getCurrentKey();
        const ai = new GoogleGenAI({ apiKey: currentKey });
        
        // Test rapide de la clé
        await this.testKey(ai);
        
        this.markKeySuccess(currentKey);
        return { ai, keyUsed: currentKey };
        
      } catch (error: any) {
        attempts++;
        lastError = error;
        
        const currentKey = this.getCurrentKey();
        
        if (error.message?.includes('quota') || error.message?.includes('429')) {
          this.markKeyError(currentKey, 'rate_limit');
        } else if (error.message?.includes('invalid') || error.message?.includes('403')) {
          this.markKeyError(currentKey, 'invalid');
        } else {
          this.markKeyError(currentKey, 'other');
        }

        // Attendre avant le prochain essai
        if (attempts < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, apiKeysConfig.fallback_config.retry_delay_ms));
        }
      }
    }

    throw new Error(`Toutes les clés API ont échoué. Dernière erreur: ${lastError?.message}`);
  }

  // Test rapide d'une clé
  private async testKey(ai: GoogleGenAI): Promise<void> {
    // Test minimal pour vérifier que la clé fonctionne
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    await model.generateContent('test');
  }

  // Statistiques des clés
  getKeyStats() {
    return {
      total: this.keys.length,
      active: this.keys.filter(k => k.status === 'active').length,
      rate_limited: this.keys.filter(k => k.status === 'rate_limited').length,
      invalid: this.keys.filter(k => k.status === 'invalid').length,
      current_key: this.keys.find(k => k.key === this.getCurrentKey())?.name
    };
  }
}

export const apiKeyManager = new ApiKeyManager();
