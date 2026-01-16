import { supabase } from './supabaseService';
import { Message } from '../types/types';

export interface ProspectSession {
    id: string;
    prospect_id: string;
    referrer_id: string;
    referrer_web_alias?: string;
    device_fingerprint?: string;
    first_visit: string;
    last_activity: string;
    total_messages: number;
    conversation_duration: number;
    consent_given: boolean;
}

export interface ProspectMetrics {
    intent?: 'HEALTH' | 'BUSINESS' | 'GENERAL' | 'BOTH';
    products_viewed: string[];
    links_clicked: number;
    engagement_score: number;
    ready_to_buy: boolean;
    ready_to_recruit: boolean;
    last_topic?: string;
    pain_points: string[];
    objections: string[];
}

export interface ProspectContact {
    whatsapp?: string;
    email?: string;
    name?: string;
    consent_marketing: boolean;
}

// Génère un fingerprint unique du device (simple hash basé sur navigator)
export const generateDeviceFingerprint = (): string => {
    const data = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset()
    ].join('|');

    // Simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
};

// Génère ou récupère l'ID prospect depuis localStorage
export const getOrCreateProspectId = (): string => {
    let prospectId = localStorage.getItem('gmb_prospect_id');
    if (!prospectId) {
        prospectId = crypto.randomUUID();
        localStorage.setItem('gmb_prospect_id', prospectId);
    }
    return prospectId;
};

// Crée ou récupère une session prospect
export const getOrCreateSession = async (
    referrerId: string,
    webAlias?: string
): Promise<string | null> => {
    try {
        const prospectId = getOrCreateProspectId();
        const fingerprint = generateDeviceFingerprint();

        // Chercher une session existante
        const { data: existingSession } = await supabase
            .from('prospect_sessions')
            .select('id')
            .eq('prospect_id', prospectId)
            .eq('referrer_id', referrerId)
            .single();

        if (existingSession) {
            // Mettre à jour last_activity
            await supabase
                .from('prospect_sessions')
                .update({ last_activity: new Date().toISOString() })
                .eq('id', existingSession.id);

            return existingSession.id;
        }

        // Créer nouvelle session
        const { data: newSession, error } = await supabase
            .from('prospect_sessions')
            .insert({
                prospect_id: prospectId,
                referrer_id: referrerId,
                referrer_web_alias: webAlias,
                device_fingerprint: fingerprint,
                consent_given: false // Sera mis à true après consentement
            })
            .select('id')
            .single();

        if (error) {
            console.error('Erreur création session:', error);
            return null;
        }

        return newSession.id;
    } catch (error) {
        console.error('Erreur getOrCreateSession:', error);
        return null;
    }
};

// Sauvegarde un message dans la conversation
export const saveMessage = async (
    sessionId: string,
    role: 'user' | 'model',
    content: string
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('conversation_messages')
            .insert({
                session_id: sessionId,
                role,
                content,
                timestamp: new Date().toISOString()
            });

        if (error) {
            console.error('Erreur sauvegarde message:', error);
            return false;
        }

        // Incrémenter total_messages
        await supabase.rpc('increment_message_count', { session_id: sessionId });

        return true;
    } catch (error) {
        console.error('Erreur saveMessage:', error);
        return false;
    }
};

// Récupère l'historique de conversation
export const getConversationHistory = async (sessionId: string): Promise<Message[]> => {
    try {
        const { data, error } = await supabase
            .from('conversation_messages')
            .select('role, content, timestamp')
            .eq('session_id', sessionId)
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('Erreur récupération historique:', error);
            return [];
        }

        return data.map((msg, index) => ({
            id: `msg-${index}`,
            role: msg.role as 'user' | 'model',
            parts: [{ text: msg.content }],
            timestamp: new Date(msg.timestamp)
        }));
    } catch (error) {
        console.error('Erreur getConversationHistory:', error);
        return [];
    }
};

// Met à jour les métriques du prospect
export const updateMetrics = async (
    sessionId: string,
    metrics: Partial<ProspectMetrics>
): Promise<boolean> => {
    try {
        // Vérifier si metrics existe déjà
        const { data: existing } = await supabase
            .from('prospect_metrics')
            .select('id')
            .eq('session_id', sessionId)
            .single();

        if (existing) {
            // Update
            const { error } = await supabase
                .from('prospect_metrics')
                .update({
                    ...metrics,
                    updated_at: new Date().toISOString()
                })
                .eq('session_id', sessionId);

            if (error) {
                console.error('Erreur update metrics:', error);
                return false;
            }
        } else {
            // Insert
            const { error } = await supabase
                .from('prospect_metrics')
                .insert({
                    session_id: sessionId,
                    ...metrics
                });

            if (error) {
                console.error('Erreur insert metrics:', error);
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Erreur updateMetrics:', error);
        return false;
    }
};

// Enregistre le consentement RGPD
export const saveConsent = async (sessionId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('prospect_sessions')
            .update({ consent_given: true })
            .eq('id', sessionId);

        if (error) {
            console.error('Erreur sauvegarde consentement:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur saveConsent:', error);
        return false;
    }
};

// Sauvegarde les informations de contact (si prospect les donne)
export const saveContact = async (
    sessionId: string,
    contact: ProspectContact
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('prospect_contacts')
            .insert({
                session_id: sessionId,
                ...contact
            });

        if (error) {
            console.error('Erreur sauvegarde contact:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur saveContact:', error);
        return false;
    }
};

// Calcule le score d'engagement basé sur l'activité
export const calculateEngagementScore = (
    totalMessages: number,
    linksClicked: number,
    productsViewed: number,
    conversationDuration: number // en secondes
): number => {
    let score = 0;

    // Messages (max 40 points)
    score += Math.min(totalMessages * 2, 40);

    // Liens cliqués (max 30 points)
    score += Math.min(linksClicked * 10, 30);

    // Produits vus (max 20 points)
    score += Math.min(productsViewed * 5, 20);

    // Durée conversation (max 10 points) - 1 point par minute
    score += Math.min(Math.floor(conversationDuration / 60), 10);

    return Math.min(score, 100);
};

// Détecte l'intent basé sur les mots-clés de la conversation
export const detectIntent = (messages: Message[]): 'HEALTH' | 'BUSINESS' | 'BOTH' | 'GENERAL' => {
    const allText = messages
        .filter(m => m.role === 'user')
        .map(m => m.parts[0]?.text || '')
        .join(' ')
        .toLowerCase();

    const healthKeywords = ['santé', 'mal', 'fatigue', 'vitalité', 'douleur', 'symptôme', 'stress', 'sommeil'];
    const businessKeywords = ['argent', 'business', 'gagner', 'finance', 'opportunité', 'revenu'];

    const hasHealth = healthKeywords.some(kw => allText.includes(kw));
    const hasBusiness = businessKeywords.some(kw => allText.includes(kw));

    if (hasHealth && hasBusiness) return 'BOTH';
    if (hasHealth) return 'HEALTH';
    if (hasBusiness) return 'BUSINESS';
    return 'GENERAL';
};
