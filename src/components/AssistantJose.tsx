
import React, { useState, useRef, useEffect } from 'react';
import {
  generateJoseResponseStream,
  generateBiologicalVisualization,
  analyzeClinicalData,
  generateJoseAudio,
  decodeBase64,
  decodeAudioData
} from '../services/geminiService';
import { voiceService } from '../services/voiceService';
import { storageService } from '../services/storageService';
import { getCurrentSponsor } from '../services/referralService';
import { getPromptForMode } from '../services/promptService';
import { getDistributorID } from '../services/trackingService';
import { Message, Language, AIPersona, ReferralContext, DiagnosticReport, ClinicalData } from '../types/types';
import { SYSTEM_CONFIG, I18N as I18N_CONST } from '../constants';
import { supabase } from '../services/supabaseService';
import { jsPDF } from 'jspdf';
import {
  Send, Bot, Loader2, Play, Check, Settings2, Share2, Square, Download, UserCheck, CheckCheck, Copy, Zap, User, Camera, Image as ImageIcon, Sparkles, Activity, FileText, FlaskConical, AlertCircle, ShieldAlert,
  Microscope, Rocket, HelpCircle, ChevronRight, Headphones, Brain, ThermometerSnowflake, Droplets,
  Terminal, Cpu, ShieldCheck, BarChart3, Fingerprint, Layers, HeartPulse, ShoppingCart, MessageCircle, Volume2, X, ExternalLink
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AssistantJoseProps {
  language?: Language;
  currentSubscriberId?: string;
  currentUserWebAlias?: string;
  prospectMode?: boolean;
  recruitmentMode?: boolean;
  salesMode?: boolean;
  linkId?: string;
  referrerId?: string;
  customerId?: string;
  healthData?: any;
  onConversationEnd?: (messages: Message[]) => void;
}

export const AssistantJose: React.FC<AssistantJoseProps> = ({
  language = 'fr',
  currentSubscriberId,
  currentUserWebAlias,
  prospectMode = false,
  recruitmentMode = false,
  salesMode = false,
  linkId,
  referrerId,
  customerId,
  healthData,
  onConversationEnd
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpeechKey, setActiveSpeechKey] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [referralContext, setReferralContext] = useState<ReferralContext | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [globalAudioContext, setGlobalAudioContext] = useState<AudioContext | null>(null);
  const [globalAudioSource, setGlobalAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [effectiveWebAlias, setEffectiveWebAlias] = useState<string>(currentUserWebAlias || '');
  const [showSettings, setShowSettings] = useState(false);
  const [manualAlias, setManualAlias] = useState('');

  // CRM States
  const [crmSessionId, setCrmSessionId] = useState<string | null>(null);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [productsViewed, setProductsViewed] = useState<string[]>([]);
  const [linksClicked, setLinksClicked] = useState(0);
  const [conversationStartTime, setConversationStartTime] = useState<number>(Date.now());

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = I18N_CONST[language as Language];

  const persona: AIPersona = {
    name: SYSTEM_CONFIG.ai.name,
    role: SYSTEM_CONFIG.ai.role,
    philosophy: "Restauration du terrain biologique via la Loi des 37°C et la Psychiatrie Cellulaire.",
    tonality: "Souveraine, scientifique, autoritaire et empathique.",
    coreValues: "SAB Standard, Bio-Sync Protocol."
  };

  const suggestions = [
    { label: "Protocole de nutrition cellulaire", prompt: "Explique-moi le Protocole de Nutrition Cellulaire NDSA étape par étape pour restaurer ma vitalité.", icon: FlaskConical },
    { label: "Opportunité digitale", prompt: "Comment l'opportunité digitale NDSA peut-elle transformer mes revenus et mon futur ?", icon: Rocket },
    { label: "Loi 37 degrés", prompt: "Explique-moi l'importance vitale de la loi des 37 degrés et le danger des boissons glacées pour mes cellules.", icon: ThermometerSnowflake },
    { label: "MLM Digital", prompt: "Comment fonctionne le MLM Digital avec l'IA José et le partenariat NeoLife ?", icon: Zap },
  ];

  // Fetch Web Alias
  // Fetch Web Alias
  useEffect(() => {
    const fetchWebAlias = async () => {
      // 1. Prop explicite
      if (currentUserWebAlias) {
        setEffectiveWebAlias(currentUserWebAlias);
        return;
      }

      // 2. Local Storage
      const savedAlias = localStorage.getItem('gmb_web_alias');
      if (savedAlias) {
        setEffectiveWebAlias(savedAlias);
        setManualAlias(savedAlias);
        return;
      }

      // 3. Supabase Profile (si connecté)
      const targetId = currentSubscriberId || referrerId;
      if (targetId && targetId !== SYSTEM_CONFIG.founder.id) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('web_alias')
            .eq('id', targetId)
            .single();

          if (data?.web_alias) {
            setEffectiveWebAlias(data.web_alias);
            return; // Trouvé !
          }
        } catch (err) { }
      }

      // 4. Fallback ultime : Founder (StartupForWorld)
      setEffectiveWebAlias(SYSTEM_CONFIG.founder.webAlias || 'startupforworld');
    };

    fetchWebAlias();
  }, [currentUserWebAlias, currentSubscriberId, referrerId]);

  // Audio functions
  const stopAllAudio = () => {
    if (globalAudioSource) {
      try {
        globalAudioSource.stop();
      } catch (e) { }
      setGlobalAudioSource(null);
    }
    setIsSpeaking(null);
  };

  const handleAudio = async (text: string, messageId: string) => {
    stopAllAudio();
    if (isSpeaking === messageId) return;

    const truncatedText = text.length > 500 ? text.substring(0, 500) + "..." : text;
    setIsSpeaking(messageId);

    try {
      const base64 = await generateJoseAudio(truncatedText, language as Language);
      if (!base64) {
        setIsSpeaking(null);
        return;
      }

      if (!globalAudioContext) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        setGlobalAudioContext(context);
      }

      if (globalAudioContext && globalAudioContext.state === 'suspended') {
        await globalAudioContext.resume();
      }

      const decoded = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(decoded, globalAudioContext!, 24000, 1);
      const source = globalAudioContext!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(globalAudioContext!.destination);

      setGlobalAudioSource(source);
      source.start();

      source.onended = () => {
        setIsSpeaking(null);
        setGlobalAudioSource(null);
      };

    } catch (error) {
      console.error('Erreur TTS:', error);
      setIsSpeaking(null);
    }
  };

  const handleSaveAlias = () => {
    let cleanAlias = manualAlias.trim();

    // Extraction intelligente si l'utilisateur colle une URL complète
    // Ex: https://shopneolife.com/monalias/shop -> monalias
    if (cleanAlias.includes('shopneolife.com')) {
      const match = cleanAlias.match(/shopneolife\.com\/([^\/]+)/);
      if (match) cleanAlias = match[1];
    } else if (cleanAlias.includes('/')) {
      // Si collé juste "shopneolife.com/alias"
      const parts = cleanAlias.split('/');
      // Trouver la partie après shopneolife.com ou prendre le dernier segment
      cleanAlias = parts[parts.length - 1];
    }

    if (cleanAlias) {
      localStorage.setItem('gmb_web_alias', cleanAlias);
      setEffectiveWebAlias(cleanAlias);
      setManualAlias(cleanAlias); // Affiche la version nettoyée à l'utilisateur
      setShowSettings(false);
    }
  };

  // Helper pour rendre les URLs cliquables dans le texte
  const formatMessage = (text: string) => {
    if (!text) return null;

    // Regex amélioré pour détecter les URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00d4ff] underline font-bold hover:text-white transition-colors break-all relative z-20"
            onClick={(e) => e.stopPropagation()} // Important pour ne pas trigger le conteneur
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Initialize messages
  useEffect(() => {
    const unsubVoice = voiceService.subscribe((isSpeaking, key) => {
      setActiveSpeechKey(isSpeaking ? key : null);
    });

    const sponsor = getCurrentSponsor();
    if (sponsor.isReferral && sponsor.id !== (currentSubscriberId || SYSTEM_CONFIG.founder.id)) {
      setReferralContext({
        referrerId: sponsor.id,
        referrerName: sponsor.name,
        language: language as Language
      });
      sessionStorage.setItem('ndsa_active_ref', sponsor.id);
    }

    if (messages.length === 0) {
      let welcomeMessage = prospectMode
        ? "Bienvenue 🌍\n\nJe suis José, ton coach business IA.\n\nLa plupart des gens travaillent dur, mais n'ont aucun levier pour sortir de la pression financière. J'aide les personnes ambitieuses à utiliser l'Intelligence Artificielle pour bâtir une activité digitale basée sur un besoin vital : la santé cellulaire.\n\nMon système travaille 24h/24 pour toi.\n\nClique sur DÉMARRER pour découvrir comment."
        : t.welcome + "\n\nEnvoyez-moi une photo de votre bilan sanguin ou d'une ordonnance, je vais décoder votre bio-statut.";

      setMessages([{ id: 'welcome', role: 'model', parts: [{ text: welcomeMessage }], timestamp: new Date(), status: 'read' }]);
    }

    return () => {
      unsubVoice();
    };
  }, [language, currentSubscriberId, prospectMode]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const saveToBioLog = async (text: string, imageData?: string, clinicalData?: ClinicalData | null) => {
    if (!text.includes('[BIO-STATUS]') && !text.includes('Rapport') && !clinicalData) return;

    try {
      let compressedImage = undefined;
      if (imageData) {
        compressedImage = await storageService.compressImage(imageData);
      }

      const newReport: DiagnosticReport = {
        id: 'rep_' + Date.now(),
        date: new Date(),
        title: text.split('\n')[0].substring(0, 50) || "Analyse Biologique",
        type: text.toLowerCase().includes('ordonnance') ? 'PRESCRIPTION' : 'BLOOD_WORK',
        summary: clinicalData?.analysis?.substring(0, 200) || text.substring(0, 200) + "...",
        fullContent: text,
        status: text.toLowerCase().includes('alerte') || (clinicalData?.risk_flags && clinicalData.risk_flags.length > 0) ? 'ALERT' : 'STABLE',
        image: compressedImage ? `data:image/jpeg;base64,${compressedImage}` : undefined,
        clinicalData: clinicalData || undefined
      };

      await storageService.saveReport(newReport);
    } catch (e) {
      console.error("Error saving to bio-log:", e);
    }
  };

  const exportConversationToPDF = async (messageId: string) => {
    setIsExporting(messageId);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      pdf.setFontSize(16);
      pdf.text('Consultation Coach José - NDSA', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
      yPosition += 20;

      messages.forEach((msg) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(12);
        pdf.text(msg.role === 'user' ? 'Vous:' : 'Coach José:', margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(msg.parts[0].text, pageWidth - 2 * margin);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * 5 + 10;
      });

      pdf.save(`consultation-jose-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erreur export PDF:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({ data: (reader.result as string).split(',')[1], mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (medicalMode = false) => {
    if (!input.trim() && !selectedImage || isLoading) return;

    setIsScanning(medicalMode && !!selectedImage);
    const userMsgId = 'msg_' + Date.now();
    const visibleMessage = input || (selectedImage ? "[Analyse de document biologique]" : "");

    // Réponse START dynamique
    if (input.trim().toUpperCase() === 'START' && prospectMode) {
      const userMsg: Message = {
        id: userMsgId,
        role: 'user',
        parts: [{ text: visibleMessage }],
        timestamp: new Date(),
        status: 'sent'
      };

      const startScripts = [
        `🔥 **FÉLICITATIONS, TU AS FAIT LE PREMIER PAS.**
        
La plupart des gens attendent que leur vie change par magie. Toi, tu as décidé d'agir.
L'écosystème GMB CORE OS est une arme à double tranchant :
1. Une Santé Cellulaire Invincible (Science NeoLife).
2. Une Machine à Cash Digitale (Intelligence Artificielle).

Dis-moi, quelle est ton urgence aujourd'hui ?
1️⃣ "Ma Santé" (Je veux retrouver mon énergie ou régler un problème)
2️⃣ "Mon Business" (Je veux générer des revenus maintenant)
3️⃣ "Les Deux" (Je veux la totale : Santé + Richesse)`,

        `🚀 **BIENVENUE DANS L'ÉLITE.**

Tu viens d'activer José, ton assistant personnel.
Je suis programmé pour deux missions critiques :
- Réparer ton corps (Fatigue, maladies, poids...)
- Remplir ton compte en banque (Système automatisé)

On attaque par quel front ?
1️⃣ "J'ai un problème de santé" (Dis-moi ce qui ne va pas)
2️⃣ "Je veux lancer mon business" (Donne-moi mon lien)
3️⃣ "Explique-moi tout" (Vision globale)`,

        `✨ **LE FUTUR commence ICI.**

Fini le stress financier et la fatigue chronique.
Avec GMB et NeoLife, tu as la solution complète.
Je ne vends pas du rêve, je vends des résultats prouvés scientifiquement.

Quelle est ta priorité absolue à cette seconde ?
1️⃣ "Ma Vitalité" (J'ai besoin d'une solution santé)
2️⃣ "Mes Finances" (Je veux devenir distributeur)
3️⃣ "Simple Curiosité" (Montre-moi comment ça marche)`
      ];

      const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % startScripts.length;
      const randomStart = startScripts[randomIndex];

      setMessages(prev => [...prev, userMsg, {
        id: 'start_response',
        role: 'model',
        parts: [{ text: randomStart }],
        timestamp: new Date(),
        status: 'read'
      }]);

      setInput('');
      return;
    }

    let fullPrompt = "";
    if (medicalMode) {
      fullPrompt = "[ACTION: BIO-SCAN MÉDICAL APPROFONDI] Veuillez analyser ce document clinique : " + visibleMessage;
    } else if (prospectMode) {
      fullPrompt = getPromptForMode() + "\n\nDistributeur ID: " + getDistributorID() + "\n\nLien boutique: https://shopneolife.com/" + (effectiveWebAlias || getDistributorID()) + "/shop/atoz\n\n" + visibleMessage;
    } else {
      fullPrompt = visibleMessage;
    }

    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      parts: [{ text: visibleMessage }],
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    const currentImg = selectedImage;
    setSelectedImage(null);

    try {
      let clinicalData: ClinicalData | null = null;
      if (medicalMode && currentImg) {
        clinicalData = await analyzeClinicalData(currentImg);
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: José prend une petite pause')), 15000)
      );

      const responsePromise = generateJoseResponseStream(
        fullPrompt,
        messages,
        referralContext,
        language as Language,
        persona,
        currentSubscriberId,
        currentImg,
        effectiveWebAlias,
        prospectMode
      );

      const stream = await Promise.race([responsePromise, timeoutPromise]) as AsyncIterable<{ text?: string }>;

      setIsScanning(false);
      let aiMsgId = 'ai_' + Date.now();
      let fullText = "";

      setMessages(prev => [...prev, { id: aiMsgId, role: 'model', parts: [{ text: "" }], timestamp: new Date(), status: 'sending' }]);

      for await (const chunk of stream) {
        fullText += chunk.text || "";
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, parts: [{ text: fullText }] } : m));
      }

      if (medicalMode) {
        await saveToBioLog(fullText, currentImg?.data, clinicalData);
      }

      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, status: 'read' } : m));
      setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, status: 'read' } : m));

    } catch (error) {
      console.error(error);
      setIsScanning(false);

      const errorMessage = error instanceof Error && error.message.includes('Timeout')
        ? 'Nous rencontrons un petit souci technique de notre côté. Revenez dans quelques minutes, José sera de retour ! 😊'
        : 'Nous avons un petit problème de connexion. Nous nous occupons de tout, réessayez dans un moment ! 🔧';

      const webAlias = effectiveWebAlias || SYSTEM_CONFIG.founder.webAlias || 'startupforworld';

      setMessages(prev => [...prev, {
        id: 'error_' + Date.now(),
        role: 'model',
        parts: [{ text: `💙 ${errorMessage}\n\n🛒 En attendant, découvrez nos produits : https://shopneolife.com/${webAlias}/shop` }],
        timestamp: new Date(),
        status: 'read'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisualize = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const url = await generateBiologicalVisualization(input || "Analyse moléculaire de la nutrition cellulaire");
    if (url) {
      setMessages(prev => [...prev, {
        id: 'viz_' + Date.now(),
        role: 'model',
        parts: [{ text: `![Bio-Viz](${url})\nSimulation Stark Intelligence du processus de restauration cellulaire.` }],
        timestamp: new Date(),
        status: 'read'
      }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-140px)] min-h-[600px] bg-slate-950/60 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl relative">
      {isScanning && (
        <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center space-y-6">
            <div className="relative">
              <Activity size={80} className="text-[#00d4ff] mx-auto animate-pulse" />
              <div className="absolute inset-0 border-y-2 border-[#00d4ff] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
            <p className="text-[#00d4ff] font-black uppercase tracking-[0.5em] text-xs animate-pulse">Bio-Data Extraction In Progress...</p>
          </div>
        </div>
      )}

      {referralContext && (
        <div className="bg-[#00d4ff]/10 border-b border-[#00d4ff]/20 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck size={16} className="text-[#00d4ff]" />
            <p className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest italic">Hub Synchronisé : <span className="text-white">{referralContext.referrerName}</span></p>
          </div>
        </div>
      )}

      <div className="bg-slate-900/80 p-4 md:p-8 flex items-center justify-between border-b border-white/5 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-[#00d4ff]/10 rounded-lg md:rounded-xl flex items-center justify-center border border-[#00d4ff]/20 relative">
            <Bot size={18} className="text-[#00d4ff] md:hidden" />
            <Bot size={28} className="text-[#00d4ff] hidden md:block" />
            {isLoading && <span className="absolute -top-1 -right-1 flex h-2 w-2 md:h-3 md:w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4ff] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-[#00d4ff]"></span></span>}
          </div>
          <div className="hidden md:block">
            <h2 className="font-bold text-lg md:text-xl text-white tracking-tight italic uppercase">{persona.name}</h2>
            <p className="text-[9px] md:text-[10px] text-[#00d4ff] font-black uppercase tracking-widest opacity-60">STARK BIO-INTELLIGENCE</p>
          </div>
          <div className="md:hidden">
            <h2 className="font-bold text-sm text-white tracking-tight italic uppercase">{persona.name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 md:p-3 bg-white/5 text-slate-400 border border-white/10 rounded-lg md:rounded-xl hover:bg-white/10 transition-all"
            title="Configurer Alias NeoLife"
          >
            <Settings2 size={16} className="md:hidden" />
            <Settings2 size={20} className="hidden md:block" />
          </button>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Analyseur Actif</span>
          </div>
          <button onClick={handleVisualize} title="Générer une vision bio" className="p-2 md:p-3 bg-white/5 text-amber-400 border border-amber-400/20 rounded-lg md:rounded-xl hover:bg-amber-400/10 transition-all"><Sparkles size={16} className="md:hidden" /><Sparkles size={20} className="hidden md:block" /></button>
          <button onClick={() => setShowShareMenu(!showShareMenu)} className={`p-2 md:p-3 rounded-lg md:rounded-xl border transition-all ${showShareMenu ? 'bg-[#00d4ff] text-slate-950' : 'bg-white/5 text-slate-400 border-white/10'}`}><Share2 size={16} className="md:hidden" /><Share2 size={20} className="hidden md:block" /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-10 space-y-4 md:space-y-8 no-scrollbar scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
            <div className={`flex gap-2 md:gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-slate-800 border-white/10' : 'bg-[#00d4ff]/20 border-[#00d4ff]/30'}`}>
                {msg.role === 'user' ? <User size={12} className="text-white md:hidden" /> : <Bot size={12} className="text-[#00d4ff] md:hidden" />}
                {msg.role === 'user' ? <User size={16} className="text-white hidden md:block" /> : <Bot size={16} className="text-[#00d4ff] hidden md:block" />}
              </div>
              <div className="flex flex-col">
                <div className={`p-3 md:p-6 rounded-xl md:rounded-[2rem] border backdrop-blur-md shadow-2xl ${msg.role === 'user' ? 'bg-[#00d4ff]/10 border-[#00d4ff]/20 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-slate-200 rounded-tl-none'}`}>
                  {msg.parts[0].text.startsWith('![Bio-Viz]') ? (
                    <div className="space-y-4">
                      <img src={msg.parts[0].text.match(/\((.*?)\)/)?.[1]} alt="Bio Visualization" className="rounded-2xl border border-white/10 w-full" />
                      <p className="text-xs italic text-slate-400">Représentation visuelle des bio-données via Stark Engine.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {msg.parts[0].text.includes('[BIO-STATUS]') && (
                        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                          <ShieldAlert size={20} className="text-amber-500 shrink-0" />
                          <p className="text-[10px] font-black text-amber-500 uppercase leading-relaxed tracking-widest">
                            {SYSTEM_CONFIG.legal.medical_disclaimer}
                          </p>
                        </div>
                      )}
                      <MarkdownRenderer
                        content={msg.parts[0].text}
                        className="leading-relaxed text-sm md:text-[15px] font-medium"
                      />
                      {msg.role === 'model' && msg.parts[0].text.length > 100 && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                          <button
                            onClick={() => exportConversationToPDF(msg.id)}
                            disabled={isExporting === msg.id}
                            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {isExporting === msg.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Download size={14} />
                            )}
                            Export PDF
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.role === 'model' && !msg.parts[0].text.startsWith('![Bio-Viz]') && (
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                      <button onClick={() => handleAudio(msg.parts[0].text, msg.id)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isSpeaking === msg.id ? 'text-[#00d4ff]' : 'text-slate-500 hover:text-white'}`}>
                        {isSpeaking === msg.id ? <Square size={14} className="fill-current" /> : <Play size={14} />} {isSpeaking === msg.id ? 'Stop' : 'Synthèse Vocale'}
                      </button>
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-3 mt-2 px-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[9px] font-black text-slate-600 tracking-widest uppercase tabular-nums">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.role === 'user' && msg.status === 'read' && <CheckCheck size={12} className="text-[#00d4ff]" />}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Bouton Démarrer pour les prospects */}
        {messages.length === 1 && !isLoading && prospectMode && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setInput("START");
                  setTimeout(() => handleSend(), 100);
                }}
                className="group relative px-6 py-3 md:px-8 md:py-4 text-slate-950 font-black text-sm md:text-lg uppercase tracking-wider rounded-xl md:rounded-2xl transition-all duration-300 border-2 transform hover:scale-105 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] border-[#00d4ff]/50 hover:border-[#00d4ff]"
              >
                <div className="absolute inset-0 rounded-2xl blur-sm group-hover:blur-none transition-all bg-gradient-to-r from-[#00d4ff]/20 to-cyan-400/20"></div>
                <span className="relative flex items-center gap-2 md:gap-3">
                  <Rocket size={18} className="md:hidden" />
                  <Rocket size={24} className="hidden md:block" />
                  <span className="hidden sm:inline">DÉMARRER C'EST PARTI 🚀</span>
                  <span className="sm:hidden">DÉMARRER 🚀</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Suggestions pour utilisateurs connectés */}
        {messages.length === 1 && !isLoading && !prospectMode && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-slate-400 text-sm font-medium mb-4">Suggestions pour commencer :</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(suggestion.prompt);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00d4ff]/30 rounded-2xl transition-all group text-left"
                >
                  <div className="w-10 h-10 bg-[#00d4ff]/10 rounded-xl flex items-center justify-center group-hover:bg-[#00d4ff]/20 transition-colors">
                    <suggestion.icon size={20} className="text-[#00d4ff]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{suggestion.label}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-[#00d4ff] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-4 px-10 py-5 bg-white/5 border border-white/10 rounded-3xl w-fit animate-pulse">
            <Loader2 className="animate-spin text-[#00d4ff]" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] italic">José décode votre architecture biologique...</span>
          </div>
        )}
      </div>

      <div className="p-3 md:p-8 bg-slate-900/60 border-t border-white/10 space-y-3 md:space-y-4">
        {selectedImage && (
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl w-fit animate-in slide-in-from-bottom-2 border border-white/10">
            <div className="relative group">
              <img src={`data:image/jpeg;base64,${selectedImage.data}`} className="h-16 w-16 rounded-xl object-cover border border-white/20" alt="Document" />
              <div className="absolute inset-0 border-2 border-[#00d4ff] rounded-xl animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSend(true)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <FlaskConical size={14} /> Analyser le document
              </button>
              <button onClick={() => setSelectedImage(null)} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline">Annuler</button>
            </div>
          </div>
        )}
        <div className="flex gap-2 md:gap-4 max-w-4xl mx-auto bg-slate-950/60 p-2 md:p-3 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 focus-within:border-[#00d4ff]/40 transition-all shadow-inner group">
          <button onClick={() => fileInputRef.current?.click()} title="Envoyer un bilan ou ordonnance" className="p-2 md:p-4 text-slate-400 hover:text-[#00d4ff] transition-colors"><ImageIcon size={18} className="md:hidden" /><ImageIcon size={20} className="hidden md:block" /></button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Posez une question ou envoyez un document médical...`}
            className="flex-1 bg-transparent border-none px-2 md:px-4 py-2 md:py-4 text-white placeholder-slate-700 outline-none font-medium text-sm md:text-lg"
          />
          <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !selectedImage)} className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-[#00d4ff] text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"><Send size={16} className="md:hidden" /><Send size={20} className="hidden md:block" /></button>
        </div>
        <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
          <AlertCircle size={10} /> José analyse mais ne remplace pas votre médecin.
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

      {showSettings && (
        <div className="absolute inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-[#00d4ff]/30 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Settings2 size={20} className="text-[#00d4ff]" /> Configuration Distributeur
            </h3>

            <div className="space-y-2">
              <label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Votre Alias Web NeoLife</label>
              <input
                type="text"
                value={manualAlias}
                onChange={(e) => setManualAlias(e.target.value)}
                placeholder="Ex: startupforworld"
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00d4ff] outline-none transition-colors"
              />
              <p className="text-xs text-slate-500 italic">
                C'est le nom qui apparaît dans votre lien : shopneolife.com/<b>votre-alias</b>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-3 bg-white/5 text-slate-300 rounded-xl font-medium hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAlias}
                className="flex-1 px-4 py-3 bg-[#00d4ff] text-slate-950 rounded-xl font-bold hover:bg-[#00d4ff]/90"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
