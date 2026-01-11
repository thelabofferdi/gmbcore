import { supabase } from './supabaseService';

export interface SocialStats {
  reach: number;
  engagement: number;
  viralSpeed: string;
  shares: number;
  clicks: number;
  conversions: number;
}

export const getSocialStats = async (): Promise<SocialStats> => {
  try {
    // Récupérer les vraies données de partage social
    const { data: shareData, error: shareError } = await supabase
      .from('social_shares')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 derniers jours

    if (shareError) throw shareError;

    // Récupérer les clics sur les liens
    const { data: clickData, error: clickError } = await supabase
      .from('link_clicks')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (clickError) throw clickError;

    // Récupérer les conversions
    const { data: conversionData, error: conversionError } = await supabase
      .from('conversions')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (conversionError) throw conversionError;

    const shares = shareData?.length || 0;
    const clicks = clickData?.length || 0;
    const conversions = conversionData?.length || 0;

    // Calculer la portée (estimation basée sur les partages)
    const reach = shares * 25 + clicks * 3; // 25 vues par partage + 3 vues par clic

    // Calculer l'engagement réel
    const engagement = clicks > 0 ? ((conversions / clicks) * 100) : 0;

    // Déterminer la vitesse virale
    let viralSpeed = 'NORMAL';
    if (shares > 50 && engagement > 15) viralSpeed = 'MAX';
    else if (shares > 20 && engagement > 8) viralSpeed = 'HIGH';
    else if (shares > 10 && engagement > 5) viralSpeed = 'MEDIUM';

    return {
      reach: Math.max(reach, 0),
      engagement: Math.round(engagement * 10) / 10,
      viralSpeed,
      shares,
      clicks,
      conversions
    };

  } catch (error) {
    console.error('Erreur récupération stats sociales:', error);
    
    // Fallback avec données réalistes basées sur localStorage
    const savedShares = parseInt(localStorage.getItem('ndsa_total_shares') || '0');
    const savedClicks = parseInt(localStorage.getItem('ndsa_total_clicks') || '0');
    const savedConversions = parseInt(localStorage.getItem('ndsa_total_conversions') || '0');

    return {
      reach: savedShares * 15 + savedClicks * 2,
      engagement: savedClicks > 0 ? Math.round((savedConversions / savedClicks) * 1000) / 10 : 0,
      viralSpeed: savedShares > 10 ? 'HIGH' : 'NORMAL',
      shares: savedShares,
      clicks: savedClicks,
      conversions: savedConversions
    };
  }
};

// Fonction pour enregistrer un partage
export const trackShare = async (platform: string, linkType: string) => {
  try {
    await supabase.from('social_shares').insert({
      platform,
      link_type: linkType,
      created_at: new Date().toISOString()
    });

    // Mettre à jour le localStorage
    const currentShares = parseInt(localStorage.getItem('ndsa_total_shares') || '0');
    localStorage.setItem('ndsa_total_shares', (currentShares + 1).toString());
  } catch (error) {
    console.error('Erreur tracking partage:', error);
  }
};

// Fonction pour enregistrer un clic
export const trackClick = async (source: string) => {
  try {
    await supabase.from('link_clicks').insert({
      source,
      created_at: new Date().toISOString()
    });

    const currentClicks = parseInt(localStorage.getItem('ndsa_total_clicks') || '0');
    localStorage.setItem('ndsa_total_clicks', (currentClicks + 1).toString());
  } catch (error) {
    console.error('Erreur tracking clic:', error);
  }
};
