import React, { useState, useEffect } from 'react';
import { Share2, Copy, Users, Phone, Mail, CheckCircle } from 'lucide-react';
import { prospectService, ShareableLink, ProspectLead } from '../services/prospectService';

interface ShareLinkGeneratorProps {
  currentUser: {
    id: string;
    name: string;
    neoLifeId: string;
  };
}

export const ShareLinkGenerator: React.FC<ShareLinkGeneratorProps> = ({ currentUser }) => {
  const [shareLink, setShareLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [currentUser.id]);

  const generateLink = () => {
    const shareableLink = prospectService.generateShareableLink(
      currentUser.neoLifeId, 
      currentUser.name
    );
    const url = prospectService.createShareUrl(shareableLink);
    setShareLink(url);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadLeads = async () => {
    setLoading(true);
    const userLeads = await prospectService.getLeadsByReferrer(currentUser.neoLifeId);
    setLeads(userLeads);
    setLoading(false);
  };

  const updateLeadStatus = async (leadId: string, status: ProspectLead['status']) => {
    await prospectService.updateLeadStatus(leadId, status);
    loadLeads(); // Recharger la liste
  };

  return (
    <div className="space-y-6">
      {/* Générateur de lien */}
      <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-3xl border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="text-[#00d4ff]" size={24} />
          <h3 className="text-xl font-black text-white">Partage Prospect</h3>
        </div>

        <p className="text-slate-400 text-sm mb-4">
          Générez un lien pour que vos prospects discutent avec José sans inscription.
          Leurs informations de contact seront automatiquement collectées.
        </p>

        <div className="space-y-4">
          <button
            onClick={generateLink}
            className="bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black px-6 py-3 rounded-2xl font-bold transition-colors"
          >
            Générer Lien Prospect
          </button>

          {shareLink && (
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl text-white flex items-center gap-2"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copié!' : 'Copier'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Liste des leads */}
      <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-3xl border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Users className="text-emerald-400" size={24} />
          <h3 className="text-xl font-black text-white">Mes Prospects ({leads.length})</h3>
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-4">Chargement...</div>
        ) : leads.length === 0 ? (
          <div className="text-slate-400 text-center py-4">Aucun prospect pour le moment</div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-bold">
                      {lead.prospect_name || 'Prospect Anonyme'}
                    </h4>
                    <div className="flex gap-4 text-sm text-slate-400">
                      {lead.prospect_email && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} /> {lead.prospect_email}
                        </span>
                      )}
                      {lead.prospect_phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {lead.prospect_phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id!, e.target.value as ProspectLead['status'])}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-xs"
                  >
                    <option value="new">Nouveau</option>
                    <option value="contacted">Contacté</option>
                    <option value="converted">Converti</option>
                    <option value="lost">Perdu</option>
                  </select>
                </div>
                
                <div className="text-xs text-slate-500">
                  Dernière activité: {new Date(lead.last_activity || lead.created_at!).toLocaleDateString()}
                  {lead.conversation_data?.length > 0 && (
                    <span className="ml-2">• {lead.conversation_data.length} messages</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
