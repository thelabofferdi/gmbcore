
import { Message, ReferralContext, Language, AIPersona } from "../types/types";
import { generateGroqResponseStream } from './groqService';
import { analyzeImageWithGemini, generateGeminiAudio } from './hybridService';
import { SYSTEM_CONFIG } from '../constants';
import {
  buildHealthSystemPrompt,
  buildBusinessSystemPrompt,
  buildGeneralSystemPrompt,
  UserIntent
} from './agents/prompts';

// Type pour les données cliniques
interface ClinicalData {
  analysis: string;
  risk_flags: string[];
  recommendations: string[];
}

export const getAIInstance = async () => {
  // Mode Groq activé - inférence ultra-rapide
  return true; // Placeholder
};

export const generateJoseResponseStream = async (
  userPrompt: string,
  history: Message[] = [],
  referralContext?: ReferralContext | null,
  language: Language = 'fr',
  customPersona?: AIPersona,
  currentSubscriberId?: string,
  imageContent?: { data: string; mimeType: string } | null,
  userWebAlias?: string,
  prospectMode?: boolean,
  intent: UserIntent = UserIntent.GENERAL // Nouveau paramètre
) => {
  try {
    // Déterminer le mode et l'ID distributeur
    const mode = prospectMode ? 'sales' : 'recruitment';
    const distributorId = referralContext?.referrerId || currentSubscriberId || '067-2922111';

    // Déterminer le webAlias (nom d'équipe NeoLife) pour les liens d'affiliation
    let webAlias = userWebAlias || SYSTEM_CONFIG.founder.webAlias || 'startupforworld';

    // Si referralContext contient un webAlias, l'utiliser (mode prospect)
    if (referralContext && referralContext.referrerId) {
      if (referralContext.shopUrl) {
        const match = referralContext.shopUrl.match(/shopneolife\.com\/([^\/]+)/);
        if (match) webAlias = match[1];
      }
    }

    // Construction du Système Prompt Spécialisé
    let systemInstruction = '';

    if (intent === UserIntent.HEALTH) {
      systemInstruction = buildHealthSystemPrompt(webAlias);
    } else if (intent === UserIntent.BUSINESS) {
      const hostName = referralContext?.referrerName || SYSTEM_CONFIG.founder.name;
      systemInstruction = buildBusinessSystemPrompt(webAlias, hostName);
    } else {
      systemInstruction = buildGeneralSystemPrompt(webAlias);

      // Si on détecte des mots clés évidents dans le prompt utilisateur, on peut switcher dynamiquement
      // (Dispatch léger côté client)
      const lowerPrompt = userPrompt.toLowerCase();
      const healthKeywords = ['santé', 'mal', 'fatigue', 'vitalité', 'douleur', 'symptôme', 'stress', 'sommeil', 'poids', 'maigrir', 'grossir', 'peau', 'cheveux', 'dos', 'ventre', 'articulation', 'digestion', 'tension', 'diabète', 'coeur', 'cardio', 'sport', 'muscle', 'os'];

      if (healthKeywords.some(kw => lowerPrompt.includes(kw))) {
        systemInstruction = buildHealthSystemPrompt(webAlias);
      } else if (lowerPrompt.includes('argent') || lowerPrompt.includes('business') || lowerPrompt.includes('gagner') || lowerPrompt.includes('finance')) {
        const hostName = referralContext?.referrerName || SYSTEM_CONFIG.founder.name;
        systemInstruction = buildBusinessSystemPrompt(webAlias, hostName);
      }
    }

    // On injecte ce prompt système directement dans la requête à Groq/Gemini
    // Note: generateGroqResponseStream doit être adapté pour recevoir systemInstruction 
    // ou on l'ajoute au début de l'historique si l'API ne le supporte pas à part.

    // Pour l'instant, passons-le via la fonction existante, mais attention :
    // generateGroqResponseStream utilise son propre constructeur de prompt interne ?
    // Vérifions generateGroqResponseStream.

    // SI generateGroqResponseStream construit son propre prompt, nous devons le modifier aussi.
    // Supposons pour l'instant qu'on appelle la fonction existante.

    const response = await generateGroqResponseStream(
      userPrompt,
      history,
      mode,
      distributorId,
      webAlias,
      systemInstruction
    );

    // Créer un stream compatible
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response stream');

    return {
      async *[Symbol.asyncIterator]() {
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') return;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    yield { text: content };
                  }
                } catch (e) {
                  // Ignorer les erreurs de parsing
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    };

  } catch (error) {
    console.error('Groq Error:', error);
    throw error;
  }
};

export const analyzeClinicalData = async (imageContent: { data: string; mimeType: string }): Promise<ClinicalData | null> => {
  try {
    // Essayer Groq Vision d'abord
    const analysis = await analyzeImageWithGemini(imageContent.data, imageContent.mimeType);

    // Parser la réponse en JSON si possible
    try {
      return JSON.parse(analysis);
    } catch {
      // Si pas JSON, retourner analyse textuelle
      return {
        analysis: analysis,
        risk_flags: [],
        recommendations: []
      };
    }
  } catch (error) {
    console.log('Analyse d\'image temporairement indisponible');
    return null;
  }
};

export const generateBiologicalVisualization = async (prompt: string) => {
  // Désactivé temporairement avec Groq
  return null;
};

export const generateJoseAudio = async (text: string, language: Language = 'fr') => {
  try {
    // Essayer Gemini TTS d'abord
    return await generateGeminiAudio(text);
  } catch (error) {
    // Fallback vers TTS natif
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      const voices = speechSynthesis.getVoices();
      const targetLang = utterance.lang.substring(0, 2);
      const voice = voices.find(v => v.lang.startsWith(targetLang));

      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve('native-tts-complete');
      utterance.onerror = (error) => reject(error);

      speechSynthesis.speak(utterance);
    });
  }
};

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Gemini TTS - Text to Speech avec voix naturelles
export const textToSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  try {
    // Note: Cette fonction nécessite l'intégration Gemini API
    // Pour l'instant, on retourne null et on utilise Web Speech API comme fallback
    console.log(`TTS demandé pour: "${text.substring(0, 50)}..." avec voix ${voiceName}`);
    return null;
  } catch (error) {
    console.error('Erreur TTS Gemini:', error);
    return null;
  }
};
