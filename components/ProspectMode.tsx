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

  // Déterminer le mode basé sur le linkId
  const isRecruitmentMode = linkId?.startsWith('rec_');
  const isSalesMode = linkId?.startsWith('sales_');

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
    if (isRecruitmentMode) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-yellow-500/50 p-8 rounded-3xl text-center max-w-lg">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-black font-bold text-2xl">€</span>
            </div>
            
            <h1 className="text-3xl font-black text-white mb-4">
              <span className="text-yellow-400">GMB CORE OS</span><br/>
              Écosystème Business
            </h1>
            
            <p className="text-gray-300 mb-6">
              "Autrefois c'était long, aujourd'hui c'est une 'sucette'. En un an, devenez millionnaire."
            </p>
            
            <div className="bg-gray-700/50 p-4 rounded-lg mb-6 text-left">
              <p className="text-cyan-300 text-sm mb-2">✨ Même sans instruction</p>
              <p className="text-cyan-300 text-sm mb-2">🤖 L'IA travaille 24/7 pour vous</p>
              <p className="text-cyan-300 text-sm">🌍 Succès mondial garanti</p>
            </div>
            
            <button
              onClick={handleStartChat}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-2xl font-black text-lg transition-colors w-full border-2 border-yellow-400 hover:border-yellow-300"
            >
              DÉMARRER MON BUSINESS
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              Formation gratuite • Aucune inscription requise
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-green-500/50 p-8 rounded-3xl text-center max-w-lg">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-black font-bold text-2xl">🩺</span>
            </div>
            
            <h1 className="text-3xl font-black text-white mb-4">
              <span className="text-green-400">Analyse Santé</span><br/>
              Nutrition Cellulaire
            </h1>
            
            <p className="text-gray-300 mb-6">
              Votre expert en nutrition cellulaire vous attend. Protocole TRE-EN-EN et recommandations personnalisées.
            </p>
            
            <div className="bg-gray-700/50 p-4 rounded-lg mb-6 text-left">
              <p className="text-green-300 text-sm mb-2">🧬 Barrière cellulaire (TRE-EN-EN)</p>
              <p className="text-green-300 text-sm mb-2">🌡️ Facteur thermique & émotionnel</p>
              <p className="text-green-300 text-sm">💊 Trio de relance personnalisé</p>
            </div>
            
            <button
              onClick={handleStartChat}
              className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-8 py-4 rounded-2xl font-black text-lg transition-colors w-full border-2 border-green-400 hover:border-green-300"
            >
              COMMENCER L'ANALYSE
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              Consultation gratuite • Aucune inscription requise
            </p>
          </div>
        </div>
      );
    }
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

  if (step === 'chat') {
    if (isSalesMode) {
      return (
        <div className="min-h-screen bg-gray-900">
          {/* Header médical professionnel */}
          <div className="bg-gradient-to-r from-green-800 to-cyan-800 p-4 border-b border-green-500/30">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🩺</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Analyse Biologique Professionnelle</h1>
                  <p className="text-green-200 text-sm">Dr. José - Expert en Nutrition Cellulaire</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-300 text-sm">Consultation Sécurisée</div>
                <div className="text-green-400 text-xs">Confidentiel • RGPD</div>
              </div>
            </div>
          </div>

          {/* Interface d'analyse */}
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-gray-800 rounded-xl border border-green-500/30 shadow-xl">
              {/* Zone d'upload de documents */}
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-green-300 mb-4">
                  📋 Téléchargez vos documents biologiques
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg text-center border border-green-500/20">
                    <div className="text-2xl mb-2">🩸</div>
                    <div className="text-sm text-gray-300">Bilan Sanguin</div>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg text-center border border-green-500/20">
                    <div className="text-2xl mb-2">💊</div>
                    <div className="text-sm text-gray-300">Ordonnance</div>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg text-center border border-green-500/20">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm text-gray-300">Analyses Urinaires</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 text-center">
                  Formats acceptés: PDF, JPG, PNG • Taille max: 10MB • Données chiffrées
                </div>
              </div>

              {/* Chat médical */}
              <AssistantJose 
                language="fr"
                currentSubscriberId={referrerId}
                prospectMode={true}
                salesMode={true}
                linkId={linkId}
                referrerId={referrerId}
                onConversationEnd={handleChatEnd}
              />
            </div>

            {/* Protocole médical affiché */}
            <div className="mt-6 grid md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-green-500/20 text-center">
                <div className="text-green-400 font-bold text-sm mb-1">ÉTAPE 1</div>
                <div className="text-xs text-gray-300">Barrière Cellulaire</div>
                <div className="text-xs text-green-300">TRE-EN-EN</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-cyan-500/20 text-center">
                <div className="text-cyan-400 font-bold text-sm mb-1">ÉTAPE 2</div>
                <div className="text-xs text-gray-300">Facteur Thermique</div>
                <div className="text-xs text-cyan-300">37°C Optimal</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-yellow-500/20 text-center">
                <div className="text-yellow-400 font-bold text-sm mb-1">ÉTAPE 3</div>
                <div className="text-xs text-gray-300">Carences</div>
                <div className="text-xs text-yellow-300">Déficits Nutritionnels</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-purple-500/20 text-center">
                <div className="text-purple-400 font-bold text-sm mb-1">ÉTAPE 4</div>
                <div className="text-xs text-gray-300">Trio de Relance</div>
                <div className="text-xs text-purple-300">3-5 Produits</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Interface recrutement normale
      return (
        <div className="min-h-screen bg-gray-900">
          <AssistantJose 
            language="fr"
            currentSubscriberId={referrerId}
            prospectMode={true}
            recruitmentMode={true}
            linkId={linkId}
            referrerId={referrerId}
            onConversationEnd={handleChatEnd}
          />
        </div>
      );
    }
  }
};
