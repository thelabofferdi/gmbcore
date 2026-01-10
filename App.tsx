
import React, { useState, useEffect, useRef } from 'react';
import { SYSTEM_CONFIG, I18N } from './constants';
import { AssistantJose } from './components/AssistantJose';
import { AcademyView } from './components/AcademyView';
import { SocialSync } from './components/SocialSync';
import { FinanceView } from './components/FinanceView';
import { AdminMonitor } from './components/AdminMonitor';
import { LeadChart } from './components/LeadChart';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ConversionNotification } from './components/ConversionNotification';
import { MilestoneModal } from './components/MilestoneModal';
import { DiagnosticHistory } from './components/DiagnosticHistory';
import { LegalDisclaimer } from './components/LegalDisclaimer';
import { ShareLinkGenerator } from './components/ShareLinkGenerator';
import { ProspectMode } from './components/ProspectMode';
import { Language, AuthUser } from './types'; 
import { voiceService } from './services/voiceService';
import { supabase, getCurrentUser, signOut } from './services/supabaseService';
import { getCurrentSponsor } from './services/referralService';
import { getDashboardStats, getAdminStats, DashboardStats, AdminStats } from './services/statsService';
import { testNeoLifeIntegration, quickRecommendationTest } from './tests/neolifeTest';
import { 
  LayoutDashboard, Bot, GraduationCap, Share2, Wallet, Menu,
  Zap, Settings, Layers, Cpu, Rocket, Volume2, Square, Clock, Trophy, ShieldCheck, User, Users,
  ClipboardList, Globe, ShieldAlert, X
} from 'lucide-react';

type TabType = 'stats' | 'jose' | 'academy' | 'social' | 'finance' | 'admin' | 'profile' | 'history' | 'prospects';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('jose');
  const [lang, setLang] = useState<Language>('fr');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isReadingBrief, setIsReadingBrief] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState(99.1);
  const [showLegal, setShowLegal] = useState(false);
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  const t = I18N[lang];

  // Vérifier si on est en mode prospect
  const urlParams = new URLSearchParams(window.location.search);
  const prospectLinkId = urlParams.get('prospect');
  const referrerId = urlParams.get('ref');

  // Si mode prospect, afficher ProspectMode
  if (prospectLinkId && referrerId) {
    return <ProspectMode linkId={prospectLinkId} referrerId={referrerId} />;
  }

  useEffect(() => {
    const loadStats = async () => {
      if (currentUser) {
        const stats = await getDashboardStats(currentUser.id);
        setDashboardStats(stats);
        
        if (currentUser.role === 'ADMIN') {
          const adminStatsData = await getAdminStats();
          setAdminStats(adminStatsData);
        }
      }
    };

    loadStats();

    // Test NeoLife API en développement
    if (import.meta.env.DEV) {
      console.log('🧪 Mode développement - Test NeoLife API');
      testNeoLifeIntegration().then(result => {
        console.log('📊 Résultat test NeoLife:', result);
      });
      quickRecommendationTest();
    }
  }, [currentUser]);

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    const syncTimer = setInterval(() => setSyncStatus(prev => +(prev + (Math.random() * 0.1 - 0.05)).toFixed(1)), 5000);
    
    // Check Supabase auth state
    const checkAuth = async () => {
      const { data: { user } } = await getCurrentUser();
      if (user) {
        const authUser: AuthUser = {
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          neoLifeId: SYSTEM_CONFIG.founder.id,
          role: user.email?.includes('admin') ? 'ADMIN' : 'LEADER',
          joinedDate: new Date(user.created_at),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        };
        setCurrentUser(authUser);
      }
      setIsAuthLoading(false);
    };

    checkAuth();
    
    const legalAccepted = localStorage.getItem('ndsa_legal_accepted');
    if (legalAccepted === 'true') setHasAcceptedLegal(true);
    else setShowLegal(true);
    
    return () => { clearInterval(clockTimer); clearInterval(syncTimer); };
  }, []);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setActiveTab('stats');
    if (!localStorage.getItem(`ndsa_onboarding_${user.id}`)) setShowOnboarding(true);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
  };

  const stopBriefing = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }
    setIsReadingBrief(false);
  };

  const handleAcceptLegal = () => {
    setHasAcceptedLegal(true);
    setShowLegal(false);
    localStorage.setItem('ndsa_legal_accepted', 'true');
  };

  const readPageBrief = async () => {
    if (isReadingBrief) { stopBriefing(); return; }
    setIsReadingBrief(true);
    
    let brief = "";
    switch(activeTab) {
      case 'stats': brief = "Bienvenue dans votre Cockpit de Direction. Voici un résumé de vos captures, volume de ventes et conversions de l'IA José. Votre empire digital est sous contrôle."; break;
      case 'jose': brief = "Vous êtes avec Coach José. Je suis prêt à décoder vos documents biologiques, ordonnances et bilans pour une restauration cellulaire optimale selon les protocoles SAB."; break;
      case 'academy': brief = "Bienvenue à la Stark Academy. Forgez votre leadership et apprenez les secrets de la croissance exponentielle et du magnétisme numérique."; break;
      case 'social': brief = "Activez votre Moteur de Viralité AXIOMA. Générez votre smart link magique et partagez votre impact sur les réseaux sociaux pour capturer des leads."; break;
      case 'finance': brief = "Consultez vos flux financiers, commissions SaaS récurrentes et volume MLM NeoLife. Gérez votre expansion financière ici."; break;
      case 'history': brief = "Accédez à vos Bio Archives. Tous vos diagnostics passés et analyses cliniques sont stockés en toute sécurité dans votre base de données locale IndexedDB."; break;
      case 'profile': brief = "Gestion de votre identité leader. Modifiez vos informations, synchronisez votre ID NeoLife et suivez votre progression vers le rang de Diamond Architect."; break;
      case 'admin': brief = "Console Master activée. Supervision globale du réseau, monitoring des revenus SaaS et déploiement de nouveaux hubs White Label."; break;
      case 'prospects': brief = "Générez des liens de partage pour vos prospects. Ils peuvent discuter avec José sans inscription et vous récupérez automatiquement leurs contacts."; break;
      default: brief = `Interface ${activeTab} activée. Systèmes Bio-Sync en ligne. Langue : ${lang}.`;
    }

    const base64 = await generateJoseAudio(brief, lang);
    if (base64) {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      const decoded = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(decoded, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      activeSourceRef.current = source;
      source.start();
      source.onended = () => setIsReadingBrief(false);
    } else { setIsReadingBrief(false); }
  };

  if (isAuthLoading) return null;
  if (showLegal) return <LegalDisclaimer language={lang} onAccept={handleAcceptLegal} />;
  
  // If not logged in and not in welcome mode, show login
  const params = new URLSearchParams(window.location.search);
  if (!currentUser && params.get('mode') !== 'welcome') return <AuthView onLogin={handleLogin} />;

  // Referral / Sponsor display logic
  const sponsor = getCurrentSponsor();
  const myReferralLink = currentUser 
    ? `${window.location.origin}${window.location.pathname}#ref=${currentUser.neoLifeId}`
    : `${window.location.origin}${window.location.pathname}#ref=${SYSTEM_CONFIG.founder.id}`;

  return (
    <div className="min-h-screen flex font-sans antialiased text-white selection:bg-[#00d4ff] selection:text-slate-950" style={{ background: SYSTEM_CONFIG.ui.backgroundGradient }}>
      {showOnboarding && <OnboardingWizard onClose={() => setShowOnboarding(false)} />}
      {showNotification && <ConversionNotification prospectCountry="Côte d'Ivoire" healthFocus="Restauration Cellulaire" onClose={() => setShowNotification(false)} onSocialSync={() => setActiveTab('social')} />}
      {showMilestone && <MilestoneModal onClose={() => setShowMilestone(false)} onUnlock={() => setIsLevel2Unlocked(true)} />}

      <aside className={`fixed inset-y-0 left-0 w-80 bg-slate-950/90 backdrop-blur-3xl z-50 transition-transform lg:translate-x-0 lg:static border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-900 border border-[#00d4ff]/40 shadow-[0_0_30px_rgba(0,212,255,0.4)]"><Layers size={28} className="text-[#00d4ff]" /></div>
            <div>
              <h1 className="font-black text-lg tracking-tighter italic uppercase">{SYSTEM_CONFIG.brand}</h1>
              <p className="text-[10px] text-[#00d4ff] font-black tracking-[0.3em] uppercase mt-1 italic">V{SYSTEM_CONFIG.version}</p>
            </div>
          </div>
          <nav className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
            {[
              { id: 'stats', label: t.dashboard, icon: LayoutDashboard },
              { id: 'jose', label: t.jose, icon: Bot },
              { id: 'history', label: "Bio-Archives", icon: ClipboardList },
              { id: 'prospects', label: "Prospects", icon: Users },
              { id: 'academy', label: t.academy, icon: GraduationCap },
              { id: 'social', label: t.social, icon: Share2 },
              { id: 'finance', label: t.finance, icon: Wallet },
              { id: 'profile', label: "Mon Profil", icon: User },
              ...(currentUser?.role === 'ADMIN' ? [{ id: 'admin', label: t.admin, icon: Settings }] : []),
            ].map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); stopBriefing(); }} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-[14px] font-black transition-all italic uppercase tracking-tight ${activeTab === item.id ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 shadow-2xl' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-4">Network Compliance</p>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
               <ShieldCheck size={16} className="text-emerald-500" />
               <span className="text-[10px] font-bold text-emerald-500 uppercase">SAB & Clinical Ready</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-28 bg-slate-950/40 backdrop-blur-3xl border-b border-white/5 px-10 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button className="lg:hidden p-4 bg-white/5 border border-white/10 rounded-2xl" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <div className="hidden xl:flex items-center gap-6">
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bio-Sync Intelligence</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]" style={{ width: `${syncStatus}%` }}></div>
                  </div>
                  <span className="text-[10px] font-mono text-[#00d4ff] font-bold">{syncStatus}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
                {(['fr', 'en', 'it', 'es'] as Language[]).map(l => (
                  <button 
                    key={l}
                    onClick={() => { setLang(l); stopBriefing(); }}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${lang === l ? 'bg-[#00d4ff] text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    {l}
                  </button>
                ))}
             </div>

             <button onClick={readPageBrief} className={`p-4 rounded-2xl border transition-all ${isReadingBrief ? 'bg-[#00d4ff] text-slate-950 shadow-[0_0_20px_#00d4ff]' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}>
                {isReadingBrief ? <Square size={20} /> : <Volume2 size={20} />}
             </button>
             <button onClick={() => setIsBoosting(true)} className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-[#00d4ff] hover:text-slate-950 transition-all group"><Zap size={20} /></button>
             <div onClick={() => setActiveTab('profile')} className="h-14 w-14 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-white/20 hover:scale-105 transition-transform">
                <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} alt="Avatar" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        <div className="p-10 flex-1 overflow-y-auto no-scrollbar pb-32">
          {activeTab === 'stats' && dashboardStats && <DashboardContent t={t} stats={dashboardStats} myReferralLink={myReferralLink} currentUser={currentUser} />}
          {activeTab === 'jose' && <AssistantJose language={lang} currentSubscriberId={currentUser?.neoLifeId} />}
          {activeTab === 'history' && <DiagnosticHistory />}
          {activeTab === 'prospects' && currentUser && <ShareLinkGenerator currentUser={currentUser} />}
          {activeTab === 'academy' && <AcademyView isLevel2Unlocked={isLevel2Unlocked} />}
          {activeTab === 'social' && <SocialSync />}
          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'profile' && currentUser && <ProfileView user={currentUser} onUpdate={(u) => setCurrentUser(u)} onLogout={() => { localStorage.removeItem('ndsa_session'); setCurrentUser(null); }} />}
          {activeTab === 'admin' && currentUser?.role === 'ADMIN' && adminStats && <AdminMonitor stats={adminStats} />}
        </div>
      </main>
      
      {isBoosting && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[250] flex items-center justify-center text-white animate-in zoom-in duration-500">
           <div className="text-center space-y-10 p-16 bg-white/5 border border-white/10 rounded-[4rem] shadow-3xl max-w-2xl">
              <Cpu size={80} className="text-[#00d4ff] mx-auto animate-spin-slow" />
              <div className="space-y-4">
                <h3 className="text-6xl font-black uppercase tracking-[0.3em] italic text-white">UNIVERSAL SYNC</h3>
                <p className="text-[#00d4ff] font-bold uppercase text-xs tracking-[0.5em] animate-pulse">PROTOCOLS OPTIMIZED</p>
              </div>
              <button onClick={() => setIsBoosting(false)} className="px-16 py-6 bg-white text-slate-950 font-black rounded-2xl shadow-2xl hover:bg-[#00d4ff] transition-all uppercase tracking-widest text-sm italic">Synchroniser</button>
           </div>
        </div>
      )}
    </div>
  );
};

const DashboardContent = ({ t, stats, myReferralLink, currentUser }: any) => (
    <div className="space-y-12 animate-in fade-in duration-1000">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <header>
            <h2 className="text-6xl font-black text-white tracking-tighter leading-none italic uppercase">{t.dashboard}</h2>
            <p className="text-slate-500 font-medium text-xl mt-4 italic">Global Command for Health Restoration.</p>
          </header>
          <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl group hover:border-[#00d4ff]/40 transition-all">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Hub Health</p>
                <p className="text-3xl font-black text-emerald-400 italic uppercase tracking-tighter">OPTIMIZED</p>
             </div>
             <div className="w-16 h-16 bg-[#00d4ff]/20 rounded-2xl flex items-center justify-center text-[#00d4ff] shadow-[0_0_20px_#00d4ff44] group-hover:scale-110 transition-transform"><ShieldCheck size={32} /></div>
          </div>
        </div>

        <section className="bg-slate-950/40 rounded-[4.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-3xl border border-white/5 backdrop-blur-3xl group">
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-20">
              <div className="space-y-10 flex-1">
                 <h3 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] italic uppercase">Bio-Digital Identity</h3>
                 <p className="text-slate-400 text-2xl font-medium max-w-3xl leading-relaxed italic">Chaque diagnostic généré par José est synchronisé avec votre lien de capture universel.</p>
                 <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full bg-slate-900/80 border border-white/10 px-10 py-6 rounded-[2rem] font-mono text-[#00d4ff] text-sm truncate shadow-inner">{myReferralLink}</div>
                    <button onClick={() => { navigator.clipboard.writeText(myReferralLink); alert("Lien Copié !"); }} className="p-6 bg-white/10 border border-white/10 rounded-3xl hover:bg-[#00d4ff] hover:text-slate-950 transition-all flex items-center gap-3 shadow-xl uppercase font-black text-[10px] italic tracking-widest"><Share2 size={24} /> <span>SYNC</span></button>
                 </div>
                 <button className="px-16 py-8 bg-[#00d4ff] text-slate-950 font-black rounded-[3rem] uppercase tracking-[0.5em] text-sm shadow-[0_30px_60px_rgba(0,212,255,0.3)] flex items-center justify-center gap-6 hover:scale-105 active:scale-95 transition-all italic"><Rocket size={32} /> {t.propulsion}</button>
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
                { label: "Capture Leads", value: stats.prospects, color: "text-[#00d4ff]", icon: Rocket },
                { label: "Volume MLM", value: `${stats.salesVolume} PV`, color: "text-emerald-400", icon: Layers },
                { label: "SaaS Rev", value: `$${stats.commissions}`, color: "text-amber-400", icon: Wallet },
                { label: "AI Conversions", value: stats.conversions, color: "text-rose-400", icon: Bot },
            ].map((stat, i) => (
                <div key={i} className="p-10 rounded-[3.5rem] border border-white/5 bg-slate-950/40 shadow-2xl relative group overflow-hidden">
                    <stat.icon size={40} className={`${stat.color} mb-6 relative z-10`} />
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic relative z-10">{stat.label}</p>
                    <h3 className={`text-5xl font-black ${stat.color} mt-4 italic tracking-tighter relative z-10 tabular-nums`}>{stat.value}</h3>
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LeadChart userId={currentUser?.id} />
          <section className="bg-slate-950/40 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 flex flex-col justify-center relative overflow-hidden shadow-2xl">
             <h4 className="text-3xl font-black text-white italic mb-6 uppercase tracking-tight relative z-10">AI Performance</h4>
             <p className="text-slate-400 text-lg leading-relaxed italic relative z-10">José convertit 24h/24. Taux de succès bio-sync : 98.4%. Votre empire est sécurisé.</p>
             <div className="mt-12 p-8 bg-slate-900/80 rounded-[2.5rem] border border-white/5 flex items-center justify-between relative z-10">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status Réseau</p>
                   <p className="text-xl font-black text-emerald-400 italic">42 HUBs ACTIFS</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg animate-pulse"><ShieldCheck size={32} /></div>
             </div>
          </section>
        </div>
    </div>
);

export default App;
