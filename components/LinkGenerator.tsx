import React, { useState } from 'react';
import { Link, Copy, Users, ShoppingCart, Plus } from 'lucide-react';

interface LinkGeneratorProps {
  userId: string;
}

export const LinkGenerator: React.FC<LinkGeneratorProps> = ({ userId }) => {
  const [recruitmentLinks, setRecruitmentLinks] = useState<string[]>([]);
  const [salesLinks, setSalesLinks] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const generateRecruitmentLink = () => {
    const linkId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const link = `${window.location.origin}?prospect=${linkId}&ref=${userId}`;
    setRecruitmentLinks([...recruitmentLinks, link]);
  };

  const generateSalesLink = () => {
    const linkId = `sales_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const link = `${window.location.origin}?prospect=${linkId}&ref=${userId}`;
    setSalesLinks([...salesLinks, link]);
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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Générateur de Liens</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Liens Recrutement */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-blue-800">Recrutement</h3>
          </div>
          
          <button
            onClick={generateRecruitmentLink}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Générer Lien Recrutement
          </button>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recruitmentLinks.map((link, index) => (
              <div key={index} className="bg-white p-3 rounded border flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                  {link}
                </span>
                <button
                  onClick={() => copyToClipboard(link)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Copier le lien"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Liens Vente */}
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <ShoppingCart className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-xl font-semibold text-green-800">Vente Produits</h3>
          </div>
          
          <button
            onClick={generateSalesLink}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors mb-4 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Générer Lien Vente
          </button>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {salesLinks.map((link, index) => (
              <div key={index} className="bg-white p-3 rounded border flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                  {link}
                </span>
                <button
                  onClick={() => copyToClipboard(link)}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="Copier le lien"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification de copie */}
      {copiedLink && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
          Lien copié !
        </div>
      )}
    </div>
  );
};
