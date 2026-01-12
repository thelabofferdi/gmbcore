import React, { useEffect } from 'react';
import { AssistantJose } from './AssistantJose';
import { ShoppingCart, Heart, Shield, Zap } from 'lucide-react';
import { initializeTracking, redirectToShop } from '../services/trackingService';

interface SalesInterfaceProps {
  customerId?: string;
  healthData?: any;
}

export const SalesInterface: React.FC<SalesInterfaceProps> = ({ 
  customerId, 
  healthData 
}) => {
  useEffect(() => {
    // Initialiser le tracking dès l'arrivée
    initializeTracking();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header GMB CORE OS Santé */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-16 h-16 text-cyan-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-500 bg-clip-text text-transparent">
                GMB CORE OS
              </h1>
              <p className="text-gray-400 text-sm">ANALYSE SANTÉ CELLULAIRE</p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl text-gray-300 mb-6">
              VOTRE BILAN SANTÉ PERSONNALISÉ
            </p>
            <p className="text-lg text-cyan-300 mb-8">
              Découvrez les produits NeoLife recommandés spécialement pour vous 
              basés sur votre <span className="text-yellow-400 font-semibold">profil de santé cellulaire</span>.
            </p>
            
            <button 
              onClick={redirectToShop}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg border-2 border-yellow-400 hover:border-yellow-300 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/25"
            >
              ACCÉDER À MA BOUTIQUE NEOLIFE
            </button>
          </div>
        </div>

        {/* José en mode vente */}
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl border border-green-500/30 shadow-xl shadow-green-500/10">
          <AssistantJose 
            prospectMode={false}
            salesMode={true}
            customerId={customerId}
            healthData={healthData}
          />
        </div>

        {/* Protocole de consultation */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg border border-green-500/30 text-center">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-green-300">TRE-EN-EN</h3>
            <p className="text-sm text-gray-400">
              Barrière cellulaire - Priorité absolue pour la reconstitution
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30 text-center">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-black font-bold">37°</span>
            </div>
            <h3 className="font-semibold mb-2 text-cyan-300">Facteur Thermique</h3>
            <p className="text-sm text-gray-400">
              Lien émotions/maladies - Le corps est à 37°C, pas glacé
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-yellow-500/30 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-yellow-300">Trio de Relance</h3>
            <p className="text-sm text-gray-400">
              3-5 produits NeoLife - Reconstitution, pas symptômes
            </p>
          </div>
        </div>

        {/* Citation philosophique */}
        <div className="mt-12 text-center">
          <blockquote className="text-lg italic text-gray-300 max-w-2xl mx-auto border-l-4 border-yellow-500 pl-6">
            "La pauvreté n'est pas un péché mais elle est dégradante. 
            On travaille pour devenir riche, on prie pour être plus humain."
          </blockquote>
        </div>
      </div>
    </div>
  );
};
