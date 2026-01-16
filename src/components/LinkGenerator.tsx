import React, { useState } from 'react';
import { Link, Copy, Bot, Plus } from 'lucide-react';

interface LinkGeneratorProps {
  userId: string;
}

export const LinkGenerator: React.FC<LinkGeneratorProps> = ({ userId }) => {
  const [prospectLinks, setProspectLinks] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const generateProspectLink = () => {
    const linkId = `prospect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const link = `${window.location.origin}?prospect=${linkId}&ref=${userId}`;
    setProspectLinks([...prospectLinks, link]);
  };

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Générateur de Lien Coach José</h2>
        <p className="text-slate-400">Partagez l'IA Coach José avec vos prospects</p>
      </div>

      {/* Lien Unique Coach José */}
      <div className="bg-gradient-to-br from-[#00d4ff]/10 to-[#00d4ff]/5 p-8 rounded-3xl border border-[#00d4ff]/20">
        <div className="flex items-center mb-6">
          <Bot className="w-8 h-8 text-[#00d4ff] mr-3" />
          <div>
            <h3 className="text-2xl font-bold text-white">Coach José IA</h3>
            <p className="text-slate-400 text-sm">Santé Cellulaire & Business NeoLife</p>
          </div>
        </div>

        <p className="text-slate-300 mb-6 leading-relaxed">
          Générez un lien unique pour que vos prospects discutent avec Coach José.
          L'IA s'occupe de tout : analyse santé, recommandations produits et présentation de l'opportunité business.
        </p>

        <button
          onClick={generateProspectLink}
          className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-slate-950 py-4 px-6 rounded-2xl hover:brightness-110 transition-all font-bold text-lg flex items-center justify-center shadow-lg shadow-[#00d4ff]/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Générer Nouveau Lien
        </button>

        <div className="space-y-3 mt-6 max-h-80 overflow-y-auto">
          {prospectLinks.map((link, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
              <span className="text-sm text-slate-300 truncate flex-1 mr-3 font-mono">
                {link}
              </span>
              <button
                onClick={() => copyToClipboard(link)}
                className="bg-[#00d4ff]/20 hover:bg-[#00d4ff]/30 text-[#00d4ff] p-2 rounded-lg transition-colors"
                title="Copier le lien"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {prospectLinks.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Aucun lien généré pour le moment
          </div>
        )}
      </div>

      {/* Notification de copie */}
      {copiedLink && (
        <div className="fixed bottom-4 right-4 bg-[#00d4ff] text-slate-950 px-6 py-3 rounded-2xl shadow-lg font-bold animate-in slide-in-from-bottom-4">
          ✓ Lien copié !
        </div>
      )}
    </div>
  );
};
