import { getPromptForMode } from './promptService';
import { supabase } from './supabaseService';
import { embedText } from './hybridService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'gsk_temp_key';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// Fonction pour récupérer le contexte pertinent
async function getRelevantContext(query: string): Promise<string> {
  try {
    // 1. Vectoriser la requête
    const embedding = await embedText(query);
    if (!embedding || embedding.length === 0) return '';

    // 2. Chercher dans Supabase
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.5, // Seuil de pertinence
      match_count: 5 // Nombre de morceaux à récupérer
    });

    if (error) {
      console.warn('Erreur recherche vectorielle:', error);
      return '';
    }

    if (!documents || documents.length === 0) return '';

    // 3. Formater le contexte
    const contextText = documents.map((doc: any) => doc.content).join('\n---\n');
    return `\n\nINFORMATION CONTEXTUELLE PERTINENTE (Issue de la base de connaissances NeoLife) :\n${contextText}\n\nUtilise ces informations pour répondre précisément si elles sont pertinentes.`;

  } catch (e) {
    console.warn('Erreur récupération contexte:', e);
    return '';
  }
}

export const generateGroqResponseStream = async (
  prompt: string,
  history: any[] = [],
  mode: 'recruitment' | 'sales' = 'sales',
  distributorId: string = '067-2922111',
  webAlias: string = 'startupforworld',
  customSystemInstruction?: string // Nouveau paramètre optionnel
) => {
  try {
    // On utilise l'instruction fournie par le routeur, sinon vide
    const baseSystemPrompt = customSystemInstruction || "";

    const context = await getRelevantContext(prompt); // Récupérer le contexte RAG

    // Injecter le webAlias (nom d'équipe) du distributeur pour générer les liens d'affiliation
    // Note: Le prompt custom gère déjà l'alias, mais on renforce ici au cas où
    const enhancedPrompt = `${baseSystemPrompt}

${context ? `CONTEXTE SUP BDD NEOLIFE :\n${context}` : ''}

RAPPEL TECHNIQUE LIENS :
Tu DOIS utiliser l'alias "${webAlias}" dans tes liens.
`;

    const messages = [
      {
        role: 'system',
        content: enhancedPrompt
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
