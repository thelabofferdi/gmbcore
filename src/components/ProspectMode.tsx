import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MessageCircle } from 'lucide-react';
import { AssistantJose } from './AssistantJose';
import { prospectService } from '../services/prospectService';

interface ProspectModeProps {
  linkId: string;
  referrerId: string;
}

export const ProspectMode: React.FC<ProspectModeProps> = ({ linkId, referrerId }) => {
  const [step, setStep] = useState<'welcome' | 'chat' | 'contact'>('welcome');
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [conversationData, setConversationData] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleStartChat = () => {
    setStep('chat');
  };

  const handleChatEnd = (messages: any[]) => {
    setConversationData(messages);
    if (messages.length > 2) { // Si conversation significative
      setStep('contact');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const leadId = await prospectService.collectProspectInfo(
      linkId,
      contactInfo,
      conversationData
    );

    if (leadId) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">Merci !</h2>
          <p className="text-slate-300 mb-6">
            Votre conseiller vous contactera bientôt pour personnaliser votre programme.
          </p>
          <p className="text-xs text-slate-500">
            Vous pouvez fermer cette page en toute sécurité.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-2xl border border-[#00d4ff]/30 p-8 rounded-3xl text-center max-w-lg">
          <div className="w-20 h-20 bg-gradient-to-r from-[#00d4ff] to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-black font-bold text-3xl">🧬</span>
          </div>

          <h1 className="text-3xl font-black text-white mb-4">
            <span className="text-[#00d4ff]">Coach José</span><br />
            Intelligence Santé & Business
          </h1>

          <p className="text-gray-300 mb-6 leading-relaxed">
            Votre expert en nutrition cellulaire et développement d'affaires NeoLife. Découvrez comment optimiser votre santé et transformer votre situation financière.
          </p>

          <div className="bg-gray-700/50 p-4 rounded-lg mb-6 text-left space-y-2">
            <p className="text-[#00d4ff] text-sm flex items-center">
              <span className="mr-2">🧬</span> Analyse santé cellulaire personnalisée
            </p>
            <p className="text-[#00d4ff] text-sm flex items-center">
              <span className="mr-2">💊</span> Recommandations produits NeoLife
            </p>
            <p className="text-[#00d4ff] text-sm flex items-center">
              <span className="mr-2">💰</span> Opportunité business digital
            </p>
            <p className="text-[#00d4ff] text-sm flex items-center">
              <span className="mr-2">🤖</span> Accompagnement IA 24/7
            </p>
          </div>

          <button
            onClick={handleStartChat}
            className="bg-gradient-to-r from-[#00d4ff] to-cyan-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-lg transition-all w-full border-2 border-[#00d4ff]/50 hover:border-[#00d4ff] hover:shadow-lg hover:shadow-[#00d4ff]/50 transform hover:scale-105"
          >
            DÉMARRER LA CONVERSATION
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Consultation gratuite • Aucune inscription requise
          </p>
        </div>
      </div>
    );
  }

  if (step === 'contact') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 max-w-md w-full">
          <div className="text-center mb-6">
            <User className="text-[#00d4ff] mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-black text-white mb-2">Restons en Contact</h2>
            <p className="text-slate-300 text-sm">
              Pour recevoir votre programme personnalisé et un suivi expert
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Nom complet</label>
              <input
                type="text"
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500"
                placeholder="Votre nom"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Email</label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Téléphone (optionnel)</label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold transition-colors"
            >
              Recevoir Mon Programme
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            Vos données sont sécurisées et ne seront jamais partagées
          </p>
        </div>
      </div>
    );
  }


  if (step === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header Coach José */}
        <div className="bg-gradient-to-r from-[#00d4ff]/20 to-cyan-600/20 p-4 border-b border-[#00d4ff]/30 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#00d4ff] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🧬</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Coach José - Intelligence Santé & Business</h1>
                <p className="text-[#00d4ff] text-sm">Nutrition Cellulaire NeoLife • Développement d'Affaires</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#00d4ff] text-sm font-bold">Session Sécurisée</div>
              <div className="text-emerald-400 text-xs">Confidentiel • RGPD</div>
            </div>
          </div>
        </div>

        {/* Interface de chat unifiée */}
        <div className="max-w-4xl mx-auto p-4">
          <AssistantJose 
            language="fr"
            currentSubscriberId={referrerId}
            prospectMode={true}
            linkId={linkId}
            referrerId={referrerId}
            onConversationEnd={handleChatEnd}
          />
        </div>
      </div>
    );
  }
};
