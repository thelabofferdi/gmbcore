// Service Groq d'urgence
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'gsk_temp_key';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export const generateGroqResponseStream = async (prompt: string, history: any[] = []) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `Tu es José, expert GMB CORE OS en nutrition cellulaire et business MLM. 
        
MISSION : Transformer la santé et la richesse des utilisateurs.
PROTOCOLE : TRE-EN-EN → Facteur Thermique → Carences → Trio de Relance
PHILOSOPHIE : "En un an, devenez millionnaire. L'IA travaille 24/7 pour vous."

Réponds de manière concise, professionnelle et motivante. Maximum 2 paragraphes.`
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
        model: 'mixtral-8x7b-32768',
        messages,
        temperature: 0.1,
        max_tokens: 800,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    return response;

  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('José fait une pause technique, revenez dans un moment ! 🔧');
  }
};
