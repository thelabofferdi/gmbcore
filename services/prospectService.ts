import { supabase } from './supabaseService';

export interface ProspectLead {
  id?: string;
  referrer_id: string; // ID du vendeur qui partage
  prospect_email?: string;
  prospect_phone?: string;
  prospect_name?: string;
  conversation_data: any[];
  clinical_analysis?: any;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  created_at?: string;
  last_activity?: string;
}

export interface ShareableLink {
  link_id: string;
  referrer_id: string;
  referrer_name: string;
  expires_at?: Date;
  max_uses?: number;
  current_uses: number;
}

class ProspectService {
  // Générer un lien de partage unique
  generateShareableLink(referrerId: string, referrerName: string): ShareableLink {
    const linkId = `${referrerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      link_id: linkId,
      referrer_id: referrerId,
      referrer_name: referrerName,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      max_uses: 100,
      current_uses: 0
    };
  }

  // Créer l'URL complète de partage
  createShareUrl(shareableLink: ShareableLink): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}?prospect=${shareableLink.link_id}&ref=${shareableLink.referrer_id}`;
  }

  // Sauvegarder un prospect lead
  async saveProspectLead(lead: ProspectLead): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('prospect_leads')
        .insert([{
          referrer_id: lead.referrer_id,
          prospect_email: lead.prospect_email,
          prospect_phone: lead.prospect_phone,
          prospect_name: lead.prospect_name,
          conversation_data: lead.conversation_data,
          clinical_analysis: lead.clinical_analysis,
          status: lead.status,
          last_activity: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error saving prospect lead:', error);
      return null;
    }
  }

  // Récupérer les leads d'un vendeur
  async getLeadsByReferrer(referrerId: string): Promise<ProspectLead[]> {
    try {
      const { data, error } = await supabase
        .from('prospect_leads')
        .select('*')
        .eq('referrer_id', referrerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  }

  // Mettre à jour le statut d'un lead
  async updateLeadStatus(leadId: string, status: ProspectLead['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('prospect_leads')
        .update({ 
          status,
          last_activity: new Date().toISOString()
        })
        .eq('id', leadId);

      return !error;
    } catch (error) {
      console.error('Error updating lead status:', error);
      return false;
    }
  }

  // Collecter les informations de contact du prospect
  async collectProspectInfo(
    linkId: string, 
    contactInfo: { email?: string; phone?: string; name?: string },
    conversationData: any[]
  ): Promise<string | null> {
    // Extraire l'ID du référent depuis le lien
    const referrerId = linkId.split('-')[0];
    
    const lead: ProspectLead = {
      referrer_id: referrerId,
      prospect_email: contactInfo.email,
      prospect_phone: contactInfo.phone,
      prospect_name: contactInfo.name,
      conversation_data: conversationData,
      status: 'new'
    };

    return await this.saveProspectLead(lead);
  }
}

export const prospectService = new ProspectService();
