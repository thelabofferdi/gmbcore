
import React, { useState, useRef } from 'react';
import { 
  Trophy, 
  Play, 
  Award, 
  ArrowRight, 
  Sparkles, 
  X,
  Smartphone,
  CheckCircle2,
  Rocket,
  Volume2,
  Square
} from 'lucide-react';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';

interface MilestoneModalProps {
  onClose: () => void;
  onUnlock: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({ onClose, onUnlock }) => {
  const [isReading, setIsReading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

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
    const textToRead = "Félicitations Leader ! Vous avez franchi la barre des 10 ventes. Votre empire est en marche. Je vous ouvre maintenant les portes du Level 2 pour des stratégies d'échelle avancées.";
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

  const handleClose = () => {
    stopAudio();
    onClose();
  };

  const handleUnlock = () => {
    stopAudio();
    onUnlock();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[400] flex items-center justify-center p-6 animate-in fade-in duration-500">
      {/* Floating Particles Simulation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#FFD700] rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-bounce opacity-20 [animation-delay:1s]"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-40"></div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.8)] w-full max-w-5xl overflow-hidden relative border-8 border-[#FFD700]/10 flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 z-50"
        >
          <X size={24} />
        </button>

        {/* Video / Visual Side */}
        <div className="md:w-1/2 bg-slate-950 p-12 relative flex flex-col justify-center items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-amber-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-12">
                 <Trophy size={48} className="text-slate-900" />
              </div>
              <button 
                onClick={handleRead}
                className={`absolute -bottom-4 -right-4 p-4 rounded-2xl shadow-xl transition-all ${isReading ? 'bg-blue-600 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isReading ? <Square size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                Élite <span className="text-[#FFD700]">Silver</span> <br /> Cell Restorer
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20 text-[10px] font-black text-[#FFD700] uppercase tracking-widest">
                Badge Officiel NDSA Débloqué
              </div>
            </div>

            {/* Video Placeholder */}
            <div className="aspect-video w-full bg-slate-900 rounded-3xl border border-white/10 flex items-center justify-center group cursor-pointer relative overflow-hidden">
               <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-1000"></div>
               <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-[#FFD700] group-hover:text-slate-900 transition-all z-10 shadow-2xl">
                  <Play size={32} fill="currentColor" className="ml-1" />
               </div>
               <p className="absolute bottom-4 left-0 w-full text-[10px] font-black uppercase text-white/40 tracking-widest">Message personnel : ABADA JOSÉ</p>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-[#FFD700] font-black uppercase tracking-[0.3em] text-[11px]">Milestone Accomplie</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                Félicitations Leader ! <br /> 10 Ventes Validées.
              </h3>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              "Bravo Leader ! Votre empire est en marche. Franchir les 10 ventes n'est pas qu'un chiffre, c'est la preuve que votre système de duplication fonctionne. Je vous ouvre maintenant les portes du Level 2."
              <br /><span className="text-slate-900 font-black italic block mt-4">— ABADA José (Fondateur)</span>
            </p>

            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                     <Rocket size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-wide">Récompense Exclusive</h4>
                    <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest">Expansion Multi-Hub Déverrouillée</p>
                  </div>
               </div>
               
               <ul className="space-y-3">
                  {[
                    "Accès au Module Level 2 : Stratégies d'Échelle",
                    "Priorité de Support IA Universelle",
                    "Certificat Silver Partner NDSA"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                       <CheckCircle2 size={16} className="text-emerald-500" /> {item}
                    </li>
                  ))}
               </ul>
            </div>

            <button 
              onClick={handleUnlock}
              className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-[0.3em] text-sm shadow-2xl hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              Réclamer mon accès Level 2 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <Smartphone size={14} /> WhatsApp Trigger : Message Envoyé par le Fondateur
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
