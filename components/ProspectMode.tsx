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
            Votre conseiller vous contactera bientôt pour personnaliser votre programme de santé.
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
        <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 text-center max-w-md">
          <div className="w-20 h-20 bg-[#00d4ff] rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="text-black" size={40} />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-4">
            Bienvenue chez <span className="text-[#00d4ff]">JOSÉ</span>
          </h1>
          
          <p className="text-slate-300 mb-6">
            Votre expert en nutrition cellulaire vous attend. 
            Analysez vos bilans de santé et obtenez des recommandations personnalisées.
          </p>
          
          <button
            onClick={handleStartChat}
            className="bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black px-8 py-4 rounded-2xl font-black text-lg transition-colors w-full"
          >
            Commencer l'Analyse
          </button>
          
          <p className="text-xs text-slate-500 mt-4">
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
                onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
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
                onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
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
                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AssistantJose 
        language="fr"
        currentSubscriberId={referrerId}
        prospectMode={true}
        onConversationEnd={handleChatEnd}
      />
    </div>
  );
};
