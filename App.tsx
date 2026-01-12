import React, { useState, useEffect, useRef } from 'react';
import { SYSTEM_CONFIG, I18N } from './constants';
import { AssistantJose } from './components/AssistantJose';
import { AcademyView } from './components/AcademyView';
import { SocialSync } from './components/SocialSync';
import { FinanceView } from './components/FinanceView';
import { AdminMonitor } from './components/AdminMonitor';
// LeadChart is now used in DashboardView
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ConversionNotification } from './components/ConversionNotification';
import { MilestoneModal } from './components/MilestoneModal';
import { DiagnosticHistory } from './components/DiagnosticHistory';
import { LegalDisclaimer } from './components/LegalDisclaimer';
import { ProspectMode } from './components/ProspectMode';
import { PasswordResetModal } from './components/PasswordResetModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LinkGenerator } from './components/LinkGenerator';

import { Language, AuthUser, TabType } from './types';
import { generateJoseAudio, decodeBase64, decodeAudioData } from './services/geminiService';
import { supabase, getCurrentUser, signOut } from './services/supabaseService';
import { getCurrentSponsor } from './services/referralService';
import { getDashboardStats, getAdminStats, DashboardStats, AdminStats } from './services/statsService';
import { testNeoLifeIntegration, quickRecommendationTest } from './tests/neolifeTest';
import {
  Cpu
} from 'lucide-react';

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
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [isLevel2Unlocked, setIsLevel2Unlocked] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const t = I18N[lang];

  // Synchroniser window.currentUser pour storageService
  useEffect(() => {
    // @ts-ignore
    window.currentUser = currentUser ? { id: currentUser.id } : undefined;
  }, [currentUser]);

  // Gérer les tokens d'authentification Magic Link dans l'URL
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Vérifier les paramètres dans l'URL (hash et query)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      const error = hashParams.get('error') || queryParams.get('error');
      const errorCode = hashParams.get('error_code') || queryParams.get('error_code');
      const type = hashParams.get('type') || queryParams.get('type');

      if (error) {
        console.error('Erreur auth:', error, errorCode);

        // Si c'est un lien expiré, afficher un message informatif
        if (errorCode === 'otp_expired') {
          alert('Le lien a expiré. Veuillez demander un nouveau lien de connexion.');
        }

        // Nettoyer l'URL et afficher un message d'erreur
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Gérer les liens de recovery (reset password)
      if (type === 'recovery') {
        // Afficher le modal de reset password
        setShowPasswordReset(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (accessToken && refreshToken) {
        try {
          // Définir la session manuellement
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Erreur session:', sessionError);
            return;
          }

          if (data.session) {
            const user = data.session.user;
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
            setIsAuthLoading(false);
          }
        } catch (err) {
          console.error('Erreur traitement token:', err);
        }

        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Vérifier s'il y a des paramètres d'auth dans l'URL
    if (window.location.hash.includes('access_token') || window.location.search.includes('access_token') ||
      window.location.hash.includes('error=') || window.location.search.includes('error=') ||
      window.location.pathname.includes('/reset-password')) {
      handleAuthCallback();
    }
  }, []);

  // Vérifier si on est en mode prospect
  const urlParams = new URLSearchParams(window.location.search);
  const prospectLinkId = urlParams.get('prospect');
  const referrerId = urlParams.get('ref');

  // Si mode prospect, afficher ProspectMode (TEMPORAIREMENT DÉSACTIVÉ DANS LE CODE ORIGINAL MAIS JE LE LAISSE COMMENT?)
  // if (prospectLinkId && referrerId) {
  //   return <ProspectMode linkId={prospectLinkId} referrerId={referrerId} />;
  // }

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

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;
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
        setIsAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    const legalAccepted = localStorage.getItem('ndsa_legal_accepted');
    if (legalAccepted === 'true') setHasAcceptedLegal(true);
    else setShowLegal(true);

    return () => {
      clearInterval(clockTimer);
      clearInterval(syncTimer);
      subscription.unsubscribe();
    };
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
      try { activeSourceRef.current.stop(); } catch (e) { }
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
    switch (activeTab) {
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
  const myReferralLink = currentUser
    ? `${window.location.origin}${window.location.pathname}#ref=${currentUser.neoLifeId}`
    : `${window.location.origin}${window.location.pathname}#ref=${SYSTEM_CONFIG.founder.id}`;

  return (
    <div className="min-h-screen flex font-sans antialiased text-white selection:bg-[#00d4ff] selection:text-slate-950" style={{ background: SYSTEM_CONFIG.ui.backgroundGradient }}>
      {showOnboarding && <OnboardingWizard onClose={() => setShowOnboarding(false)} />}
      {showNotification && <ConversionNotification prospectCountry="Côte d'Ivoire" healthFocus="Restauration Cellulaire" onClose={() => setShowNotification(false)} onSocialSync={() => setActiveTab('social')} />}
      {showMilestone && <MilestoneModal onClose={() => setShowMilestone(false)} onUnlock={() => setIsLevel2Unlocked(true)} />}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        language={lang}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-0">
        <Header
          syncStatus={syncStatus}
          lang={lang}
          setLang={setLang}
          isReadingBrief={isReadingBrief}
          readPageBrief={readPageBrief}
          stopBriefing={stopBriefing}
          onBoost={() => setIsBoosting(true)}
          currentUser={currentUser}
          setActiveTab={setActiveTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <div className="p-3 md:p-6 lg:p-10 flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-32">
          {activeTab === 'stats' && dashboardStats && <DashboardView t={t} stats={dashboardStats} myReferralLink={myReferralLink} currentUser={currentUser} />}
          {activeTab === 'jose' && <AssistantJose language={lang} currentSubscriberId={currentUser?.neoLifeId} currentUserWebAlias={currentUser?.neoLifeWebAlias} />}
          {activeTab === 'history' && <DiagnosticHistory />}
          {activeTab === 'academy' && <AcademyView isLevel2Unlocked={isLevel2Unlocked} />}
          {activeTab === 'social' && <SocialSync />}
          {activeTab === 'finance' && <FinanceView currentUser={currentUser} />}
          {activeTab === 'profile' && currentUser && <ProfileView user={currentUser} onUpdate={(u) => setCurrentUser(u)} onLogout={() => { localStorage.removeItem('ndsa_session'); setCurrentUser(null); }} />}
          {activeTab === 'links' && currentUser && <LinkGenerator userId={currentUser.id} />}
          {activeTab === 'admin' && currentUser?.role === 'ADMIN' && adminStats && <AdminMonitor stats={adminStats} />}
        </div>
      </main>

      {isBoosting && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[250] flex items-center justify-center text-white animate-in zoom-in duration-500">
          <div className="text-center space-y-10 p-16 bg-white/5 border border-white/10 rounded-[4rem] shadow-3xl max-w-2xl mx-4">
            <Cpu size={80} className="text-[#00d4ff] mx-auto animate-spin-slow" />
            <div className="space-y-4">
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-[0.3em] italic text-white line-clamp-2">UNIVERSAL SYNC</h3>
              <p className="text-[#00d4ff] font-bold uppercase text-xs tracking-[0.5em] animate-pulse">PROTOCOLS OPTIMIZED</p>
            </div>
            <button onClick={() => setIsBoosting(false)} className="px-16 py-6 bg-white text-slate-950 font-black rounded-2xl shadow-2xl hover:bg-[#00d4ff] transition-all uppercase tracking-widest text-sm italic">Synchroniser</button>
          </div>
        </div>
      )}

      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        onSuccess={() => setShowPasswordReset(false)}
      />
    </div>
  );
}

export default App;
