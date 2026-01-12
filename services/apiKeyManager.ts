import { supabase } from './supabaseService';

// Clé de chiffrement simple (en production, utiliser une vraie clé de chiffrement)
const ENCRYPTION_KEY = 'GMB_CORE_OS_2026_SECURE_KEY_ROTATION';

// Chiffrement simple XOR (en production, utiliser AES)
function encrypt(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(result);
}

function decrypt(encrypted: string): string {
  const text = atob(encrypted);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return result;
}

interface ApiKey {
  id: string;
  key_name: string;
  encrypted_key: string;
  status: 'active' | 'rate_limited' | 'expired' | 'disabled';
  error_count: number;
  last_used?: string;
  last_error?: string;
}

class ApiKeyManager {
  private currentKey: string | null = null;
  private keyRotationIndex = 0;

  // Initialiser les nouvelles clés dans Supabase
  async initializeKeys() {
    // Les clés sont maintenant récupérées depuis les variables d'environnement
    const newKeys = [];
    for (let i = 1; i <= 13; i++) {
      const key = import.meta.env[`VITE_GEMINI_KEY_${i}`];
      if (key) newKeys.push(key);
    }

    if (newKeys.length === 0) {
      console.error('❌ Aucune clé API trouvée dans les variables d\'environnement');
      return;
    }

    console.log('🔐 Initialisation des clés API sécurisées...');

    for (let i = 0; i < newKeys.length; i++) {
      const keyName = `gemini_key_${i + 1}`;
      const encryptedKey = encrypt(newKeys[i]);

      const { error } = await supabase
        .from('api_keys')
        .upsert({
          key_name: keyName,
          encrypted_key: encryptedKey,
          status: 'active',
          error_count: 0
        });

      if (error) {
        console.error(`❌ Erreur lors de l'ajout de la clé ${keyName}:`, error);
      } else {
        console.log(`✅ Clé ${keyName} ajoutée avec succès`);
      }
    }
  }

  // Obtenir une clé API fonctionnelle
  async getWorkingKey(): Promise<string | null> {
    try {
      const { data: keys, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('status', 'active')
        .order('error_count', { ascending: true })
        .order('last_used', { ascending: true, nullsFirst: true });

      if (error || !keys || keys.length === 0) {
        console.error('❌ Aucune clé API disponible');
        return null;
      }

      // Essayer les clés une par une
      for (const keyData of keys) {
        const decryptedKey = decrypt(keyData.encrypted_key);
        
        if (await this.testKey(decryptedKey)) {
          this.currentKey = decryptedKey;
          
          // Mettre à jour la dernière utilisation
          await supabase
            .from('api_keys')
            .update({ 
              last_used: new Date().toISOString(),
              last_error: null 
            })
            .eq('id', keyData.id);

          console.log(`✅ Clé ${keyData.key_name} sélectionnée`);
          return decryptedKey;
        } else {
          // Marquer la clé comme ayant une erreur
          await this.markKeyError(keyData.id, 'Test failed');
        }
      }

      console.error('❌ Aucune clé fonctionnelle trouvée');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des clés:', error);
      return null;
    }
  }

  // Tester si une clé fonctionne
  private async testKey(key: string): Promise<boolean> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Test' }] }]
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // Marquer une clé comme ayant une erreur
  async markKeyError(keyId: string, error: string) {
    const { data } = await supabase
      .from('api_keys')
      .select('error_count')
      .eq('id', keyId)
      .single();

    const newErrorCount = (data?.error_count || 0) + 1;
    const newStatus = newErrorCount >= 3 ? 'rate_limited' : 'active';

    await supabase
      .from('api_keys')
      .update({
        error_count: newErrorCount,
        status: newStatus,
        last_error: error,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId);
  }

  // Obtenir la clé actuelle ou en récupérer une nouvelle
  async getCurrentKey(): Promise<string | null> {
    if (this.currentKey) {
      return this.currentKey;
    }
    return await this.getWorkingKey();
  }

  // Rotation automatique en cas d'erreur
  async rotateKey(): Promise<string | null> {
    console.log('🔄 Rotation de clé API...');
    this.currentKey = null;
    return await this.getWorkingKey();
  }
}

export const apiKeyManager = new ApiKeyManager();
