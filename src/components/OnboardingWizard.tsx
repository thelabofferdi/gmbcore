
import React, { useState, useRef } from 'react';
import { 
  Bot, 
  Zap, 
  GraduationCap, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Gift, 
  Sparkles, 
  X,
  ArrowRight,
  Download,
  PartyPopper,
  CheckCircle2,
  Volume2,
  Square
} from 'lucide-react';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';

interface OnboardingWizardProps {
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const steps = [
    {
      title: "1. Rencontrez José (Expert Universel)",
      content: "José est l'IA Universelle de la NDSA. Il ne remplace pas votre médecin, il amplifie son expertise. José gère les diagnostics complexes de nutrition cellulaire 24h/24 pour transformer vos prospects en clients convaincus.",
      actionLabel: "Initialiser la connexion",
      icon: <Bot size={48} className="text-[#FFD700]" />
    },
    {
      title: "2. Activez Social Sync (Automatisation)",
      content: "La technologie Social Sync permet de diffuser automatiquement vos diagnostics sur Facebook, Instagram et WhatsApp. Chaque diagnostic généré par José devient un post viral rattaché à votre lien personnel.",
      actionLabel: "Lancer la synchronisation",
      icon: <Zap size={48} className="text-[#FFD700]" />
    },
    {
      title: "3. Academy NDSA (Leadership)",
      content: "Accédez aux secrets du Fondateur ABADA José. Apprenez comment bâtir une infrastructure digitale qui travaille pour vous. Transformez-vous de simple distributeur en Architecte de Réseau Diamond.",
      actionLabel: "Ouvrir l'Academy",
      icon: <GraduationCap size={48} className="text-[#FFD700]" />
    },
    {
      title: "4. Règle Bio-Sync (Protection)",
      content: "Sécurité maximale : Si un visiteur arrive sans lien de parrainage, le système synchronise automatiquement le lead avec le Fondateur (ABADA José) pour garantir un accompagnement officiel sans perte de donnée.",
      actionLabel: "Prêt pour le déploiement",
      icon: <ShieldCheck size={48} className="text-[#FFD700]" />
    }
  ];

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }
    setIsReading(false);
  };

  const handleReadStep = async () => {
    if (isReading) { stopAudio(); return; }
    setIsReading(true);
    const step = steps[currentStep];
    const textToRead = `${step.title}. ${step.content}`;
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

  const handleNext = () => {
    stopAudio();
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    stopAudio();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    stopAudio();
    onClose();
  }

  const isFinal = currentStep === steps.length;

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-full max-w-4xl overflow-hidden relative border-8 border-white/5">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 flex">
          {[0, 1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`flex-1 h-full transition-all duration-700 ${currentStep >= s ? 'bg-blue-600' : 'bg-transparent'}`}
            />
          ))}
        </div>
        <button onClick={handleClose} className="absolute top-10 right-10 p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
          <X size={24} />
        </button>
        <div className="p-16">
          {!isFinal ? (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-slate-900 flex items-center justify-center shadow-2xl border border-white/10 transform hover:rotate-6 transition-transform">
                    {steps[currentStep].icon}
                  </div>
                  <button 
                    onClick={handleReadStep}
                    className={`absolute -bottom-4 -right-4 p-4 rounded-2xl shadow-xl transition-all ${isReading ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {isReading ? <Square size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                    {steps[currentStep].title}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <CheckCircle2 size={12} className="text-blue-500" /> Guide de Bienvenue
                  </div>
                </div>
                <p className="text-slate-600 text-xl leading-relaxed font-medium max-w-2xl">
                  {steps[currentStep].content}
                </p>
              </div>
              <div className="flex items-center justify-between pt-10">
                <button 
                  disabled={currentStep === 0}
                  onClick={handleBack}
                  className={`flex items-center gap-2 px-8 py-5 font-black text-xs uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  <ChevronLeft size={20} /> Précédent
                </button>
                <button 
                  onClick={handleNext}
                  className="px-12 py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm"
                >
                  {steps[currentStep].actionLabel} <ChevronRight size={24} className="text-blue-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in zoom-in-95 duration-500 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-white shadow-2xl relative z-10">
                   <PartyPopper size={64} />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-slate-900 text-[#FFD700] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles size={24} />
                </div>
              </div>
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Bienvenue dans l'ère GMBC OS</h2>
                <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto italic leading-relaxed">
                  "Vous avez les clés de l'empire digital. José est synchronisé. Le monde attend votre diagnostic."
                  <br /><span className="text-slate-900 font-black italic block mt-6 not-italic uppercase tracking-widest text-xs">— ABADA José</span>
                </p>
              </div>
              <button 
                onClick={handleClose}
                className="w-full py-8 bg-slate-900 text-white font-black rounded-[2.5rem] uppercase tracking-[0.4em] text-sm shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:brightness-125 active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                ENTRER DANS MON EMPIRE <ArrowRight size={24} className="text-blue-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
