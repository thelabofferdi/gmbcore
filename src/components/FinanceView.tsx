
import React, { useState, useRef, useEffect } from 'react';
import { SYSTEM_CONFIG } from '../constants';
import { PricingZone, AuthUser } from '../types/types';
import { getDashboardStats, DashboardStats } from '../services/statsService';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  DollarSign, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  Briefcase, 
  Globe, 
  Activity, 
  Info,
  Layers,
  Volume2,
  Square
} from 'lucide-react';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';

export const FinanceView: React.FC<{ currentUser?: AuthUser }> = ({ currentUser }) => {
  const [copied, setCopied] = React.useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const dashboardStats = await getDashboardStats(currentUser.id);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading finance stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [currentUser]);

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }
    setIsReading(false);
  };

  const handleRead = async () => {
    if (isReading) { stopAudio(); return; }
    setIsReading(true);
    const textToRead = `Modèle de Revenus Hybride NDSA. Combinaison stratégique du Digital SaaS et du MLM Biologique. Vous percevez des revenus récurrents sur les abonnements et des commissions sur les ventes NeoLife. Consultez votre solde et gérez votre boutique.`;
    const base64 = await generateJoseAudio(textToRead);
    if (base64) {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      const decoded = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(decoded, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      activeSourceRef.current = source;
      source.start();
      source.onended = () => setIsReading(false);
    } else { setIsReading(false); }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Entity Branding / Business Model Clarification */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-[#FFD700] shadow-xl shrink-0">
             <Layers size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modèle de Revenus Hybride NDSA</h2>
              <button 
                onClick={handleRead}
                className={`p-3 rounded-2xl border transition-all ${isReading ? 'bg-blue-600 text-white shadow-lg animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isReading ? <Square size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
            <p className="text-slate-500 font-medium text-lg mt-1">
              Combinaison stratégique du <span className="text-blue-600 font-bold">Digital SaaS</span> et du <span className="text-emerald-600 font-bold">MLM Biologique</span>.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
             <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2">
                <Globe size={14} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Digital SaaS</span>
             </div>
             <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                <Activity size={14} className="text-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Partner MLM</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SaaS Revenue (Subscribers) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shadow-inner">
              <Users size={24} />
            </div>
            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase">SaaS Rev</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Abonnements Plateforme</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">
            {loading ? '...' : `$${stats?.subscriptionMRR || 0}`}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Mensuel Récurrent (MRR)</p>
        </div>

        {/* MLM Volume (NeoLife Sales) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 shadow-inner">
              <Activity size={24} />
            </div>
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase">MLM Vol</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Volume NeoLife (PV/BV)</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">
            {loading ? '...' : `$${stats?.salesVolume || 0}`}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Généré via José & Shop</p>
        </div>

        {/* Affiliate Commission NDSA */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 shadow-inner">
              <TrendingUp size={24} />
            </div>
            <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase">Comm %</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Commissions Directes</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">
            {loading ? '...' : `$${stats?.commissions || 0}`}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Affiliation Plateforme</p>
        </div>

        {/* Wallet Balance */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={80} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Solde Disponible</p>
            <h3 className="text-3xl font-black text-[#FFD700] mt-2">
              {loading ? '...' : `$${((stats?.commissions || 0) + (stats?.subscriptionMRR || 0) * 0.3).toFixed(2)}`}
            </h3>
          </div>
          <button className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30">
            Retirer mes gains
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pillar 1: Digital SaaS NDSA */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-blue-50/30">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Pôle Digital (SaaS)</h3>
              <p className="text-xs text-slate-500 mt-1">Abonnements d'accès aux outils IA</p>
            </div>
            <ShieldCheck className="text-blue-600" size={24} />
          </div>
          <div className="p-8 space-y-6 flex-1">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsabilité NDSA</p>
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase">Actif</span>
               </div>
               <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  NDSA fournit l'infrastructure IA (José), l'hébergement de vos hubs, les formations de l'Academy et le support technique. Les frais d'abonnement couvrent ces services premium.
               </p>
            </div>
            
            <div className="space-y-3">
              {Object.entries(SYSTEM_CONFIG.billing.pricing).map(([zone, data]) => (
                <div key={zone} className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${zone === 'AFRICA' ? 'bg-amber-400' : zone === 'EUROPE' ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{data.label}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{zone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900">{data.amount} <span className="text-xs">{data.currency}</span></span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Mensuel</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
               <Info size={18} className="text-blue-600 shrink-0 mt-1" />
               <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                  En tant qu'affilié, vous percevez 20% sur chaque abonnement actif recommandé via votre lien.
               </p>
            </div>
          </div>
        </div>

        {/* Pillar 2: Partner MLM NeoLife */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-emerald-900 text-xl tracking-tight">Pôle Produit (MLM)</h3>
              <p className="text-xs text-emerald-600 mt-1">Volume d'Affaires Partenaire NeoLife</p>
            </div>
            <Activity className="text-emerald-600" size={24} />
          </div>
          <div className="p-8 space-y-8 flex-1">
            <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 transition-transform group-hover:rotate-0">
                  <ExternalLink size={100} />
               </div>
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Lien de Destination Biologique</p>
                  <h4 className="text-xl font-black mb-4">Boutique de {SYSTEM_CONFIG.founder.name}</h4>
                  <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20 font-mono text-xs truncate mb-6">
                    {SYSTEM_CONFIG.founder.officialShopUrl}
                  </div>
                  <div className="flex gap-3">
                     <button 
                        onClick={() => handleCopy(SYSTEM_CONFIG.founder.officialShopUrl, 'shop')}
                        className="flex-1 py-4 bg-white text-emerald-900 font-black rounded-xl hover:bg-[#FFD700] transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                     >
                        {copied === 'shop' ? <Check size={16} /> : <Copy size={16} />} 
                        {copied === 'shop' ? 'Lien Copié' : 'Copier ma boutique'}
                     </button>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails du Modèle MLM</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Responsabilité</p>
                     <p className="text-xs font-bold text-slate-800">Logistique, Stock & Paiement Commissions Réseau</p>
                  </div>
                  <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Relation</p>
                     <p className="text-xs font-bold text-slate-800">Fournisseur de solutions nutritives (SAB)</p>
                  </div>
               </div>
               
               <div className="bg-[#FFD700]/10 p-6 rounded-[2rem] border border-[#FFD700]/20">
                  <p className="text-[11px] text-[#003366] font-black leading-relaxed text-center uppercase tracking-wider">
                     "NDSA construit votre HUB digital. NeoLife livre votre IMPACT biologique."
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
