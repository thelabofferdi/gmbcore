// Analyse d'image avec Groq Vision
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'gsk_temp_key';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export const analyzeImageWithGroq = async (imageData: string, mimeType: string) => {
  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llava-v1.5-7b-4096-preview', // Modèle vision de Groq
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyse ce document médical et extrait les données biologiques importantes. Réponds en français.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageData}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq Vision error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Groq Vision Error:', error);
    throw new Error('Analyse d\'image temporairement indisponible');
  }
};
