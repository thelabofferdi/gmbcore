// Service Groq d'urgence
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'gsk_temp_key';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export const generateGroqResponseStream = async (prompt: string, history: any[] = []) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `Tu es José, expert GMB CORE OS en nutrition cellulaire et business MLM. Réponds de manière concise et professionnelle. Maximum 2 paragraphes.`
      },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.parts[0].text
      })),
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Nouveau modèle stable
        messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error Details:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    return response;

  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('José fait une pause technique, revenez dans un moment ! 🔧');
  }
};
