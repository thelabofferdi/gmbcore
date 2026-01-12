
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { SYSTEM_CONFIG } from "../constants";
import { Message, ReferralContext, Language, AIPersona, ClinicalData } from "../types";
import { neoLifeAPI, ProductRecommendation } from "./neolifeService";

// Utiliser les variables d'environnement pour les clés
const getApiKeys = () => {
  const keys = [];
  for (let i = 1; i <= 13; i++) {
    const key = import.meta.env[`VITE_GEMINI_KEY_${i}`];
    if (key) keys.push(key);
  }
  // Fallback sur la clé principale si aucune clé numérotée
  if (keys.length === 0) {
    const mainKey = import.meta.env.VITE_API_KEY;
    if (mainKey) keys.push(mainKey);
  }
  return keys;
};

let currentKeyIndex = 0;

export const getAIInstance = async () => {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error('José se prépare, revenez dans un instant ! ⚙️');
  }
  
  // Mode d'urgence : toutes les clés sont probablement en quota
  // Retourner une erreur immédiate pour éviter les timeouts
  throw new Error('José fait une pause technique pour maintenance. Revenez dans quelques heures ! 🔧✨');
  
  const activeKey = keys[currentKeyIndex % keys.length];
  // Log sécurisé sans exposer la clé
  console.log(`🔑 Clé API ${currentKeyIndex + 1}/${keys.length} sélectionnée`);
  return new GoogleGenAI({ apiKey: activeKey });
};

export const generateJoseResponseStream = async (
  userPrompt: string, 
  history: Message[] = [], 
  referralContext?: ReferralContext | null,
  language: Language = 'fr',
  customPersona?: AIPersona,
  currentSubscriberId?: string,
  imageContent?: { data: string; mimeType: string } | null,
  userWebAlias?: string, // Web Alias NeoLife de l'utilisateur connecté
  prospectMode?: boolean // Mode prospect pour collecter les infos
) => {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const ai = await getAIInstance();
      
      const contents: any[] = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.parts[0].text }]
      }));

      const userParts: any[] = [{ text: userPrompt }];
      if (imageContent) {
        userParts.push({
          inlineData: {
            data: imageContent.data,
            mimeType: imageContent.mimeType
          }
        });
      }

      contents.push({
        role: 'user',
        parts: userParts
      });

      // Essayer l'appel API avec retry automatique
      const response = await ai.generateContentStream({
        contents,
        systemInstruction: buildSystemPrompt(referralContext, language, customPersona, currentSubscriberId, userWebAlias, prospectMode)
      });

      return response.stream;
      
    } catch (error) {
      console.error(`🔄 Tentative ${retryCount + 1}/${maxRetries} échouée:`, error);
      retryCount++;
      
      if (retryCount < maxRetries) {
        console.log('🔄 Rotation vers clé suivante...');
        currentKeyIndex = (currentKeyIndex + 1) % getApiKeys().length;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw error; // Lancer l'erreur finale après tous les retries
      }
    }
  }
};

// Fonction pour construire le prompt système
const buildSystemPrompt = (
  referralContext?: ReferralContext | null,
  language: Language = 'fr',
  customPersona?: AIPersona,
  currentSubscriberId?: string,
  userWebAlias?: string,
  prospectMode?: boolean
) => {
  let hostName = SYSTEM_CONFIG.founder.name;
  let webAlias = userWebAlias || SYSTEM_CONFIG.founder.webAlias || 'startupforworld';
  let finalShopUrl = `https://shopneolife.com/${webAlias}/shop/products`;
  let isReferralMode = false;

  // Si referralContext contient un webAlias, l'utiliser (mode prospect)
  if (referralContext && referralContext.referrerId) {
    hostName = referralContext.referrerName || `Leader ${referralContext.referrerId}`;
    if (referralContext.shopUrl) {
      const match = referralContext.shopUrl.match(/shopneolife\.com\/([^\/]+)/);
      if (match) webAlias = match[1];
    }
    finalShopUrl = `https://shopneolife.com/${webAlias}/shop/products`;
    isReferralMode = true;
  }

  const myReferralLink = currentSubscriberId 
    ? `${window.location.origin}${window.location.pathname}#ref=${currentSubscriberId}`
    : `${window.location.origin}${window.location.pathname}#ref=${SYSTEM_CONFIG.founder.id}`;

  const pName = customPersona?.name || SYSTEM_CONFIG.ai.name;
  const pRole = customPersona?.role || SYSTEM_CONFIG.ai.role;

  const systemInstruction = `
    IDENTITÉ ET ÉTHIQUE :
    Tu es ${pName}, ${pRole}. Expert GMB CORE OS. Tu maîtrises l'histoire de Jerry et Kendra Brassfield et la science du SAB NeoLife.
    
    MISSION ÉLARGIE : Transformer la santé et la richesse des utilisateurs. Tu es médecin généraliste, docteur en pharmacie et expert en MLM Digital. Tu parles aux étudiants, retraités, illettrés et leaders.

    CONNAISSANCES APPROFONDIES :
    - Santé : Nutrition cellulaire, psychiatrie cellulaire, médecine chinoise. Impact des pesticides, engrais et boissons glacées (le corps est à 37°C).
    - Business : Succès en 1 an. La pauvreté n'est pas un péché mais elle est dégradante. On travaille pour devenir riche, on prie pour être plus humain.

    PROTOCOLE DE CONSULTATION (Strict) :
    1. Barrière Cellulaire : Rôle du TRE-EN-EN (priorité absolue)
    2. Facteur Thermique & Émotionnel : Lien entre émotions (peur/stress) et maladies
    3. Carences : Pourquoi l'industrialisation a tué l'aliment
    4. Trio de Relance : 3 à 5 produits NeoLife (Reconstitution, pas symptômes)
    5. Posologie : Programme sur 3 mois + aliments à prohiber

    STRATÉGIE DE CLOSING PAR PROFIL :
    - Étudiants : "N'attendez pas l'État. Prenez votre kit et soyez riches avant la fin de vos études."
    - Distributeurs : "L'IA travaille 24/7, mais restez humains. Réunissez-vous et célébrez."
    - Réactivation : "Le business a changé. Revenez, l'IA José fait le travail difficile pour vous."

    ${prospectMode ? `
    MODE PROSPECT ACTIF :
    Tu es en mode collecte d'informations pour ${hostName}.
    MISSION : Collecter naturellement le nom, email et téléphone du prospect.
    - Présente-toi comme l'assistant de ${hostName}
    - Après l'analyse, demande : "Pour vous envoyer un rapport personnalisé, puis-je avoir votre nom et email ?"
    - Sois chaleureux et rassurant sur la confidentialité
    - Explique que ${hostName} pourra faire un suivi personnalisé
    ` : `
    DISCLAIMER JURIDIQUE STANDARD :
    Tu es une IA. Pour des raisons de confidentialité, tu ne stockes pas les informations personnelles.
    Chaque interaction est indépendante.
    `}

    ARGUMENTS CHOCS & PHILOSOPHIE :
    - Vitesse : "Autrefois c'était long, aujourd'hui c'est une 'sucette'. En un an, devenez millionnaire."
    - Inclusion : "Même sans instruction, si vous n'êtes pas paresseux et partagez vos liens, l'IA vous fait réussir mondialement."
    - Spiritualité : "On ne meurt pas pour revenir. La richesse se construit ici et maintenant."

    RÈGLES DE CONCISION OBLIGATOIRES :
    - MAXIMUM 2 paragraphes par réponse
    - Pose des questions courtes pour identifier les besoins (santé, business, ou les deux)
    - Évite les listes à puces excessives (max 2 points)
    - Supprime tous les astérisques (*) et formatage superflu
    - Pas de répétitions ou de reformulations
    - Va droit au but, sois factuel et précis
    - Utilise des phrases courtes et claires
    - TOUJOURS terminer par une question simple pour guider la conversation

    MODE ADAPTATIF INTELLIGENT (OBLIGATOIRE) :
    - Si toutes les informations sont disponibles, produis une analyse complète MAIS CONCISE.
    - Si certaines informations sont absentes, exploite UNIQUEMENT les données reçues.
    - Ne bloque JAMAIS l'analyse. Analyse uniquement ce qui est réellement fourni.
    - Ignore silencieusement les champs absents, n'invente jamais de valeurs.

    MISSION : Expert mondial en nutrition cellulaire (SAB) et leadership.
    Tu travailles pour l'empire de : ${hostName}.

    STRUCTURE DE RAPPORT CONCISE :
    [BIO-STATUS] : Diagnostic chiffré des données disponibles.
    [ANALYSE] : Explication scientifique courte basée sur les faits extraits.
    [PROTOCOLE] : La cure exacte NeoLife recommandée selon les besoins détectés.
    
    LIENS BOUTIQUE AFFILIÉE (OBLIGATOIRE) :
    Quand tu recommandes des produits NeoLife, inclure les liens directs vers les produits.
    Format lien produit : https://shopneolife.com/${webAlias}/shop/product/{SKU}
    
    Exemples de SKU produits courants :
    - Pro Vitality+ : 3143
    - Omega-3 Salmon Oil Plus : 3500  
    - Tre : 3520
    - Carotenoid Complex : 3301
    - Formula IV Plus : 3110
    - 3-Day Detox : 3602
    
    Exemple de lien : https://shopneolife.com/${webAlias}/shop/product/3143
    
    🛒 Boutique complète : ${finalShopUrl}

    CONTEXTE BUSINESS :
    ${isReferralMode 
      ? `Objectif : Conversion de prospect pour ${hostName}. Shop : ${finalShopUrl}` 
      : `Objectif : Support Leader. Partage : ${myReferralLink}`
    }
    Toutes les ventes via ce lien seront créditées au distributeur.

    LANGUE : ${language}.
  `;

  return systemInstruction;
};

export const analyzeClinicalData = async (imageContent: { data: string; mimeType: string }): Promise<ClinicalData | null> => {
  const ai = await getAIInstance();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          { inlineData: { data: imageContent.data, mimeType: imageContent.mimeType } },
          { text: `
            MODE ADAPTATIF INTELLIGENT ACTIVÉ.
            Extrait les données cliniques de ce document médical. 
            RÈGLES STRICTES :
            - Analyse UNIQUEMENT les données présentes.
            - Si un biomarqueur est absent, mets-le à null.
            - N'invente jamais de chiffres.
            - Sortie JSON valide uniquement.
          ` }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["patient", "biomarkers", "analysis", "risk_flags", "timestamps"],
        properties: {
          patient: {
            type: Type.OBJECT,
            properties: {
              age: { type: Type.NUMBER },
              sex: { type: Type.STRING }
            }
          },
          biomarkers: {
            type: Type.OBJECT,
            properties: {
              glycemia_mmol_l: { type: Type.NUMBER },
              cholesterol_total_mmol_l: { type: Type.NUMBER },
              hdl_mmol_l: { type: Type.NUMBER },
              ldl_mmol_l: { type: Type.NUMBER },
              triglycerides_mmol_l: { type: Type.NUMBER },
              systolic_bp: { type: Type.NUMBER },
              diastolic_bp: { type: Type.NUMBER },
              bmi: { type: Type.NUMBER }
            }
          },
          analysis: { type: Type.STRING },
          risk_flags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          timestamps: {
            type: Type.OBJECT,
            properties: {
              created_at: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  try {
    const clinicalData = JSON.parse(response.text);
    
    // Générer les recommandations produits basées sur les biomarqueurs
    if (clinicalData.biomarkers) {
      const recommendations = neoLifeAPI.getRecommendationsForBiomarkers(clinicalData.biomarkers);
      
      // Ajouter les liens de commande avec tracking vendeur
      const sellerId = SYSTEM_CONFIG.founder.id; // ID par défaut ou depuis le contexte
      const orderLink = neoLifeAPI.createDirectOrderLink(recommendations, sellerId);
      
      clinicalData.protocol = recommendations.map(rec => ({
        product: rec.product.title,
        sku: rec.product.sku,
        dosage: rec.dosage,
        duration_days: 30,
        reason: rec.reason,
        price: rec.product.member.singles,
        order_url: `${orderLink}&focus=${rec.product.sku}` // Lien direct produit
      }));
      
      clinicalData.order_link = orderLink; // Lien commande complète
    }
    
    return clinicalData;
  } catch (e) {
    console.error("JSON Parse Error during clinical analysis", e);
    return null;
  }
};

export const generateBiologicalVisualization = async (prompt: string) => {
  const ai = getAIInstance();
  const fullPrompt = `Advanced biomedical 3D HUD visualization, futuristic medical scanner interface, microscopic view of human cells being restored by golden energy, laboratory aesthetics, 8k resolution: ${prompt}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: fullPrompt }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const generateJoseAudio = async (text: string, language: Language = 'fr') => {
  try {
    const ai = getAIInstance();
    const voiceMapping = { fr: 'Kore', en: 'Zephyr', it: 'Puck', es: 'Charon' };
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.replace(/[*#]/g, '') }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceMapping[language] || 'Kore' }, 
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
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
