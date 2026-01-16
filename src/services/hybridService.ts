// Service hybride : Gemini pour images/TTS + Groq pour chat
const GEMINI_KEYS = [
  'AIzaSyAWJO3TIqpaOjTu_3FjPSYwdxyl3cj-vXI',
  'AIzaSyDiIAXjEmFTkyTpZZnVrgq5pbe67jl5qIc',
  'AIzaSyCfJOM6wO9w9NXEjqqwodUvmEXnlQY33gw',
  'AIzaSyCRq2KQIfYysPIvTej9-x1yE8BAbWgpOZo',
  'AIzaSyBna8vcirJ96PR4XNAGiEedEkVPy_yY6AQ'
];

let currentKeyIndex = 0;

function getNextGeminiKey() {
  const key = GEMINI_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
  return key;
}

// Analyse d'image avec Gemini
export const analyzeImageWithGemini = async (imageData: string, mimeType: string) => {
  const key = getNextGeminiKey();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Analyse ce document médical et extrait les données biologiques importantes. Réponds en français.' },
            {
              inlineData: {
                mimeType,
                data: imageData
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('Gemini Vision Error:', error);
    throw new Error('Analyse d\'image temporairement indisponible');
  }
};

// TTS avec Gemini
export const generateGeminiAudio = async (text: string) => {
  const key = getNextGeminiKey();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Charon"
              }
            }
          }
        }
      })
    });

    if (!response.ok) throw new Error(`Gemini TTS error: ${response.status}`);

    const data = await response.json();
    return data.candidates[0].content.parts[0].inlineData.data;

  } catch (error) {
    console.error('Gemini TTS Error:', error);
    // Fallback vers TTS natif
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.onend = () => resolve('native-tts-complete');
      utterance.onerror = reject;
      speechSynthesis.speak(utterance);
    });
  }
};

// Embedding avec Gemini
export const embedText = async (text: string): Promise<number[]> => {
  const key = getNextGeminiKey();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: {
          parts: [{ text }]
        }
      })
    });

    if (!response.ok) throw new Error(`Gemini Embedding error: ${response.status}`);

    const data = await response.json();
    return data.embedding.values;

  } catch (error) {
    console.error('Gemini Embedding Error:', error);
    return []; // Retourner un tableau vide en cas d'erreur pour ne pas bloquer
  }
};
