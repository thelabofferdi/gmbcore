
import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, Share2, Check, Copy, Target, Globe, Fingerprint, Activity, BarChart3, TrendingUp, Users, MessageSquare, Volume2, Square
} from 'lucide-react';
import { SYSTEM_CONFIG } from '../constants';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';
import { getSocialStats, trackShare, SocialStats } from '../services/socialStatsService';

export const SocialSync: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [customId, setCustomId] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [socialStats, setSocialStats] = useState<SocialStats>({
    reach: 0,
    engagement: 0,
    viralSpeed: 'LOADING...',
    shares: 0,
    clicks: 0,
    conversions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem('ndsa_personal_id');
    if (savedId) setCustomId(savedId);
    else setCustomId(SYSTEM_CONFIG.founder.id);
    
    // Charger les vraies statistiques sociales
    loadSocialStats();
  }, []);

  const loadSocialStats = async () => {
    setIsLoading(true);
    try {
      const stats = await getSocialStats();
      setSocialStats(stats);
    } catch (error) {
      console.error('Erreur chargement stats sociales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomId(val);
    localStorage.setItem('ndsa_personal_id', val);
  };

  const smartLink = `${window.location.origin}${window.location.pathname}#ref=${customId || SYSTEM_CONFIG.founder.id}`;
  const inviteLink = `https://axioma-app.com/join?ref=${customId || SYSTEM_CONFIG.founder.id}`;
  const shareMessage = `J'utilise ${SYSTEM_CONFIG.brand} et l'IA ${SYSTEM_CONFIG.ai.name} pour ma santé cellulaire. Rejoins mon équipe !`;

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
    const textToRead = `Bienvenue dans le Moteur de Viralité AXIOMA. Votre Smart Link Élite vous permet de capturer des prospects bio-numériques. Chaque clic redirige vers Coach ${SYSTEM_CONFIG.ai.name}. Partagez votre impact sur WhatsApp et Facebook.`;
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

  const copySmartLink = () => {
    navigator.clipboard.writeText(smartLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTo = async (platform: 'whatsapp' | 'facebook') => {
    // Tracker le partage
    await trackShare(platform, 'smart_link');
    
    let url = "";
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + " " + smartLink)}`;
    } else {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(smartLink)}`;
    }
    window.open(url, '_blank');
    
    // Recharger les stats après partage
    setTimeout(loadSocialStats, 1000);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Lien d'invitation copié ! Partagez-le avec vos prospects.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-1000">
      <div className="bg-slate-950/40 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-12 md:p-16 relative overflow-hidden shadow-3xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00d4ff]/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full text-[11px] font-black text-[#00d4ff] uppercase tracking-[0.3em]">
                  <Zap size={16} /> Moteur de Viralité AXIOMA
                </div>
                <button 
                  onClick={handleRead}
                  className={`p-4 rounded-2xl border transition-all ${isReading ? 'bg-[#00d4ff] text-slate-950 shadow-[0_0_15px_#00d4ff]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                >
                  {isReading ? <Square size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">Votre Smart Link Élite</h2>
              <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl">
                Générez votre lien de capture bio-numérique. Chaque clic redirige vers Coach {SYSTEM_CONFIG.ai.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                    <Fingerprint size={12} /> Votre ID NeoLife / AXIOMA
                  </label>
                  <input 
                    type="text" 
                    value={customId} 
                    onChange={handleIdChange}
                    placeholder="Ex: 067-2922111" 
                    className="w-full bg-white/5 border border-white/10 px-8 py-6 rounded-3xl text-white font-black italic text-lg outline-none focus:border-[#00d4ff] transition-all"
                  />
               </div>
               
               {/* Share Zone Dynamique */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Partager mon impact</label>
                  <div className="p-4 bg-white/5 rounded-3xl border border-white/10 flex justify-around items-center gap-4">
                    <button 
                      onClick={() => shareTo('whatsapp')}
                      aria-label="Partager sur WhatsApp"
                      className="p-4 bg-green-600/20 rounded-2xl border border-green-500/30 hover:bg-green-600/40 transition-all"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WhatsApp" />
                    </button>
                    <button 
                      onClick={() => shareTo('facebook')}
                      aria-label="Partager sur Facebook"
                      className="p-4 bg-blue-600/20 rounded-2xl border border-blue-500/30 hover:bg-blue-600/40 transition-all"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" className="w-6 h-6" alt="Facebook" />
                    </button>
                    <button 
                      onClick={copyInviteLink}
                      className="flex-1 py-4 bg-amber-600/20 border border-amber-500/30 rounded-2xl text-[10px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-600/40 transition-all"
                    >
                      INVIT LINK
                    </button>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Lien de Capture (Smart Link)</label>
               <div className="flex gap-4">
                  <div className="flex-1 bg-slate-950/60 border border-white/5 px-8 py-6 rounded-3xl text-[#00d4ff] font-mono text-xs truncate flex items-center shadow-inner">
                    {smartLink}
                  </div>
                  <button 
                    onClick={copySmartLink} 
                    className="p-6 bg-[#00d4ff] text-slate-950 rounded-3xl transition-all shadow-2xl hover:brightness-110 active:scale-90"
                  >
                    {copied ? <Check size={28} /> : <Copy size={28} />}
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 p-12 rounded-[4rem] border border-white/10 shadow-xl overflow-hidden relative backdrop-blur-md">
         <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-4 italic uppercase leading-none"><BarChart3 size={32} className="text-[#00d4ff]" /> Performance de Viralité</h3>
              <p className="text-slate-500 text-lg font-medium mt-2">Mesure de l'impact organique de vos partages Social Sync.</p>
            </div>
            <div className="px-6 py-3 bg-[#00d4ff]/10 text-[#00d4ff] rounded-2xl text-[11px] font-black uppercase tracking-widest border border-[#00d4ff]/20 flex items-center gap-2">
              <Activity size={16} className="animate-pulse" /> Live Feedback
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                label: "Portée Totale", 
                value: isLoading ? "..." : socialStats.reach.toLocaleString(), 
                icon: Users, 
                color: "text-[#00d4ff]",
                subtitle: `${socialStats.shares} partages`
              },
              { 
                label: "Engagement", 
                value: isLoading ? "..." : `${socialStats.engagement}%`, 
                icon: TrendingUp, 
                color: "text-emerald-400",
                subtitle: `${socialStats.clicks} clics`
              },
              { 
                label: "Vitesse Virale", 
                value: isLoading ? "..." : socialStats.viralSpeed, 
                icon: Zap, 
                color: "text-amber-500",
                subtitle: `${socialStats.conversions} conversions`
              }
            ].map((stat, i) => (
              <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/10 transition-colors group">
                <stat.icon size={32} className={`${stat.color} group-hover:scale-110 transition-transform`} />
                <div>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">{stat.label}</p>
                  <h4 className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</h4>
                  <p className="text-[10px] text-slate-600 mt-1 font-medium">{stat.subtitle}</p>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
