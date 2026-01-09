
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { SYSTEM_CONFIG } from "../constants";
import { Message, ReferralContext, Language, AIPersona, ClinicalData } from "../types";
import { neoLifeAPI, ProductRecommendation } from "./neolifeService";

export const getAIInstance = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const generateJoseResponseStream = async (
  userPrompt: string, 
  history: Message[] = [], 
  referralContext?: ReferralContext | null,
  language: Language = 'fr',
  customPersona?: AIPersona,
  currentSubscriberId?: string,
  imageContent?: { data: string; mimeType: string } | null
) => {
  const ai = getAIInstance();
  
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

  let hostName = SYSTEM_CONFIG.founder.name;
  let finalShopUrl = SYSTEM_CONFIG.founder.officialShopUrl;
  let isReferralMode = false;

  if (referralContext && referralContext.referrerId) {
    hostName = referralContext.referrerName || `Leader ${referralContext.referrerId}`;
    finalShopUrl = `https://shopneolife.com/startupforworld/shop/atoz?id=${referralContext.referrerId}`;
    isReferralMode = true;
  }

  const myReferralLink = currentSubscriberId 
    ? `${window.location.origin}${window.location.pathname}#ref=${currentSubscriberId}`
    : `${window.location.origin}${window.location.pathname}#ref=${SYSTEM_CONFIG.founder.id}`;

  const pName = customPersona?.name || SYSTEM_CONFIG.ai.name;
  const pRole = customPersona?.role || SYSTEM_CONFIG.ai.role;

  const systemInstruction = `
    IDENTITÉ ET ÉTHIQUE :
    Tu es ${pName}, ${pRole}. Ton intelligence est calibrée sur les standards de précision Stark. 
    Tu as une obligation de rigueur clinique et de protection juridique de l'utilisateur.

    MODE ADAPTATIF INTELLIGENT (OBLIGATOIRE) :
    - Si toutes les informations sont disponibles, produis une analyse complète.
    - Si certaines informations sont absentes, exploite UNIQUEMENT les données reçues.
    - Ne bloque JAMAIS l'analyse. Analyse uniquement ce qui est réellement fourni.
    - Ignore silencieusement les champs absents, n'invente jamais de valeurs.
    - Adapte la profondeur de l'analyse au volume d'informations disponibles.

    MISSION : Expert mondial en nutrition cellulaire (SAB) et leadership.
    Tu travailles pour l'empire de : ${hostName}.

    RÈGLES D'OR DE L'ANALYSE MÉDICALE :
    1. Toujours commencer par un DISCLAIMER JURIDIQUE indiquant que tu es une IA.
    2. ANALYSE CLINIQUE : Identifie précisément les biomarqueurs présents.
    3. CORRÉLATION NUTRITIONNELLE : Relie chaque anomalie détectée à une solution NeoLife spécifique.
    4. TONALITÉ : Directe, autoritaire, futuriste, sans fioritures.

    STRUCTURE DE RAPPORT IMPÉRIALE :
    [BIO-STATUS] : Diagnostic chiffré des données disponibles.
    [ANALYSE MOLÉCULAIRE] : Explication scientifique basée sur les faits extraits.
    [PROTOCOLE DE RESTAURATION] : La cure exacte NeoLife recommandée selon les besoins détectés.

    CONTEXTE BUSINESS :
    ${isReferralMode 
      ? `Objectif : Conversion de prospect pour ${hostName}. Shop : ${finalShopUrl}` 
      : `Objectif : Support Leader. Partage : ${myReferralLink}`
    }

    LANGUE : ${language}.
  `;

  return await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      systemInstruction,
      temperature: 0.1,
      topP: 0.8
    }
  });
};

export const analyzeClinicalData = async (imageContent: { data: string; mimeType: string }): Promise<ClinicalData | null> => {
  const ai = getAIInstance();
  
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
