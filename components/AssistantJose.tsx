
import React, { useState, useRef, useEffect } from 'react';
import { 
  generateJoseResponseStream, 
  generateBiologicalVisualization,
  analyzeClinicalData 
} from '../services/geminiService';
import { voiceService } from '../services/voiceService';
import { storageService } from '../services/storageService';
import { getCurrentSponsor } from '../services/referralService';
import { Message, Language, AIPersona, ReferralContext, DiagnosticReport, ClinicalData } from '../types'; 
import { SYSTEM_CONFIG, I18N as I18N_CONST } from '../constants';
import { 
  Send, Bot, Loader2, Play, Check, Settings2, Share2, Square, Download, UserCheck, CheckCheck, Copy, Zap, User, Camera, Image as ImageIcon, Sparkles, Activity, FileText, FlaskConical, AlertCircle, ShieldAlert,
  Microscope, Rocket, HelpCircle, ChevronRight, Headphones, Brain, ThermometerSnowflake, Droplets, 
  Terminal, Cpu, ShieldCheck, BarChart3, Fingerprint, Layers
} from 'lucide-react';

interface AssistantJoseProps {
  language?: Language;
  currentSubscriberId?: string;
  prospectMode?: boolean;
  onConversationEnd?: (messages: Message[]) => void;
}

export const AssistantJose: React.FC<AssistantJoseProps> = ({ 
  language = 'fr', 
  currentSubscriberId,
  prospectMode = false,
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
  
  const persona: AIPersona = {
    name: "JOSÉ IMPERIUM 2026",
    role: "Architecte en Chef de Restauration Biologique",
    philosophy: "Protocole NDSA. Restauration de l'autorité cellulaire.",
    tonality: "Souverain Stark, Expert Clinique, Bienveillance Protectrice.",
    coreValues: "Standard SAB, Précision Biomédicale, Succès NeoLife."
  };

  const suggestions = [
    { label: "Protocole de nutrition cellulaire", prompt: "Explique-moi le Protocole de Nutrition Cellulaire NDSA étape par étape pour restaurer ma vitalité.", icon: FlaskConical },
    { label: "Opportunité digitale", prompt: "Comment l'opportunité digitale NDSA peut-elle transformer mes revenus et mon futur ?", icon: Rocket },
    { label: "Loi 37 degrés", prompt: "Explique-moi l'importance vitale de la loi des 37 degrés et le danger des boissons glacées pour mes cellules.", icon: ThermometerSnowflake },
    { label: "MLM Digital", prompt: "Comment fonctionne le MLM Digital avec l'IA José et le partenariat NeoLife ?", icon: Zap },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = I18N_CONST[language as Language];

  useEffect(() => {
    const unsubVoice = voiceService.subscribe((isSpeaking, key) => {
      setActiveSpeechKey(isSpeaking ? key : null);
    });

    // Détection du parrainage améliorée
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
      setMessages([{ id: 'welcome', role: 'model', parts: [{ text: t.welcome + "\n\nEnvoyez-moi une photo de votre bilan sanguin ou d'une ordonnance, je vais décoder votre bio-statut." }], timestamp: new Date(), status: 'read' }]);
    }

    return () => {
      unsubVoice();
    };
  }, [language, currentSubscriberId]);

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
    const promptPrefix = medicalMode ? "[ACTION: BIO-SCAN MÉDICAL APPROFONDI] Veuillez analyser ce document clinique : " : "";
    
    const userMsg: Message = { 
      id: userMsgId, 
      role: 'user', 
      parts: [{ text: promptPrefix + (input || (selectedImage ? "[Analyse de document biologique]" : "")) }], 
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
        // Parallel structured analysis if in medical mode
        clinicalData = await analyzeClinicalData(currentImg);
      }

      const stream = await generateJoseResponseStream(
        userMsg.parts[0].text, 
        messages, 
        referralContext, 
        language as Language, 
        persona, 
        currentSubscriberId,
        currentImg
      );
      
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

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }
    setIsSpeaking(null);
  };

  const handleAudio = async (text: string, id: string) => {
    if (isSpeaking === id) { stopAudio(); return; }
    stopAudio();
    const base64 = await generateJoseAudio(text, language as Language);
    if (base64) {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      const decoded = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(decoded, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      activeSourceRef.current = source;
      setIsSpeaking(id);
      source.start();
      source.onended = () => setIsSpeaking(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl relative">
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

      <div className="bg-slate-900/80 p-8 flex items-center justify-between border-b border-white/5 z-50">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-[#00d4ff]/10 rounded-xl flex items-center justify-center border border-[#00d4ff]/20 relative">
            <Bot size={28} className="text-[#00d4ff]" />
            {isLoading && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4ff] opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[#00d4ff]"></span></span>}
          </div>
          <div>
            <h2 className="font-bold text-xl text-white tracking-tight italic uppercase">{persona.name}</h2>
            <p className="text-[10px] text-[#00d4ff] font-black uppercase tracking-widest opacity-60">STARK BIO-INTELLIGENCE</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Analyseur Actif</span>
          </div>
          <button onClick={handleVisualize} title="Générer une vision bio" className="p-3 bg-white/5 text-amber-400 border border-amber-400/20 rounded-xl hover:bg-amber-400/10 transition-all"><Sparkles size={20} /></button>
          <button onClick={() => setShowShareMenu(!showShareMenu)} className={`p-3 rounded-xl border transition-all ${showShareMenu ? 'bg-[#00d4ff] text-slate-950' : 'bg-white/5 text-slate-400 border-white/10'}`}><Share2 size={20} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-slate-800 border-white/10' : 'bg-[#00d4ff]/20 border-[#00d4ff]/30'}`}>
                 {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-[#00d4ff]" />}
              </div>
              <div className="flex flex-col">
                <div className={`p-6 rounded-[2rem] border backdrop-blur-md shadow-2xl ${msg.role === 'user' ? 'bg-[#00d4ff]/10 border-[#00d4ff]/20 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-slate-200 rounded-tl-none'}`}>
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
                       <p className="leading-relaxed text-[15px] font-medium whitespace-pre-line">{msg.parts[0].text}</p>
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
        
        {/* Suggestions guidées */}
        {messages.length === 1 && !isLoading && (
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
                    handleSend(suggestion.prompt);
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

      <div className="p-8 bg-slate-900/60 border-t border-white/10 space-y-4">
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
        <div className="flex gap-4 max-w-4xl mx-auto bg-slate-950/60 p-3 rounded-[2rem] border border-white/10 focus-within:border-[#00d4ff]/40 transition-all shadow-inner group">
          <button onClick={() => fileInputRef.current?.click()} title="Envoyer un bilan ou ordonnance" className="p-4 text-slate-400 hover:text-[#00d4ff] transition-colors"><ImageIcon size={24} /></button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Posez une question ou envoyez un document médical...`} 
            className="flex-1 bg-transparent border-none px-4 py-4 text-white placeholder-slate-700 outline-none font-medium text-lg"
          />
          <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !selectedImage)} className="w-14 h-14 rounded-2xl bg-[#00d4ff] text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"><Send size={24} /></button>
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
    </div>
  );
};
