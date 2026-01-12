import React, { useEffect } from 'react';
import { AssistantJose } from './AssistantJose';
import { Users, UserPlus, Zap } from 'lucide-react';
import { initializeTracking } from '../services/trackingService';

interface RecruitmentInterfaceProps {
  linkId?: string;
  referrerId?: string;
}

export const RecruitmentInterface: React.FC<RecruitmentInterfaceProps> = ({ 
  linkId, 
  referrerId 
}) => {
  useEffect(() => {
    // Initialiser le tracking dès l'arrivée
    initializeTracking();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header GMB CORE OS */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Zap className="w-16 h-16 text-cyan-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                GMB CORE OS
              </h1>
              <p className="text-gray-400 text-sm">ÉCOSYSTÈME DIGITAL</p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl text-gray-300 mb-6">
              BIENVENUE DANS L'ÉCOSYSTÈME GMB CORE OS
            </p>
            <p className="text-lg text-cyan-300 mb-8">
              Votre corps est une machine biologique, votre business est un système numérique. 
              <span className="text-yellow-400 font-semibold"> Nous optimisons les deux.</span>
            </p>
            
            <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg border-2 border-yellow-400 hover:border-yellow-300 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/25">
              DÉMARRER MON ANALYSE SANTÉ & BUSINESS
            </button>
          </div>
        </div>

        {/* José en mode recrutement */}
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
          <AssistantJose 
            prospectMode={true}
            recruitmentMode={true}
            linkId={linkId}
            referrerId={referrerId}
          />
        </div>

        {/* Arguments de recrutement */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30 text-center">
            <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-cyan-300">Réseau Mondial</h3>
            <p className="text-sm text-gray-400">
              "Même sans instruction, si vous partagez vos liens, l'IA vous fait réussir mondialement"
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-yellow-500/30 text-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-black font-bold">€</span>
            </div>
            <h3 className="font-semibold mb-2 text-yellow-300">Vitesse</h3>
            <p className="text-sm text-gray-400">
              "Autrefois c'était long, aujourd'hui c'est une 'sucette'. En un an, devenez millionnaire"
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-purple-500/30 text-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">★</span>
            </div>
            <h3 className="font-semibold mb-2 text-purple-300">Spiritualité</h3>
            <p className="text-sm text-gray-400">
              "On ne meurt pas pour revenir. La richesse se construit ici et maintenant"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
