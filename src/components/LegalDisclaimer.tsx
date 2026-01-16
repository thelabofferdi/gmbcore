
import React, { useState, useRef } from 'react';
import { ShieldAlert, CheckCircle, FileText, ExternalLink, ShieldCheck, Volume2, Square } from 'lucide-react';
import { I18N, SYSTEM_CONFIG } from '../constants';
import { Language } from '../types/types';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';

interface LegalDisclaimerProps {
  language: Language;
  onAccept: () => void;
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ language, onAccept }) => {
  const t = I18N[language];
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
    const textToRead = `${t.legal_title}. ${t.legal_disclaimer}. Veuillez accepter les protocoles de sécurité pour continuer.`;
    const base64 = await generateJoseAudio(textToRead, language);
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

  const handleAccept = () => {
    stopAudio();
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.1),transparent_70%)]"></div>
      
      <div className="w-full max-w-2xl bg-slate-900/80 border border-white/10 rounded-[3rem] p-12 md:p-16 shadow-3xl relative animate-in zoom-in-95 duration-700">
        <button 
          onClick={handleRead}
          className={`absolute top-10 right-10 p-4 rounded-2xl border transition-all ${isReading ? 'bg-[#00d4ff] text-slate-950 shadow-[0_0_15px_#00d4ff]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
        >
          {isReading ? <Square size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center text-amber-500 shadow-2xl">
            <ShieldAlert size={44} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{t.legal_title}</h2>
            <p className="text-slate-400 text-lg font-medium italic leading-relaxed">
              {t.legal_disclaimer}
            </p>
          </div>

          <div className="w-full space-y-4 pt-6">
             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4 text-left">
                <div className="flex items-center gap-3 text-[10px] font-black text-[#00d4ff] uppercase tracking-widest">
                   <ShieldCheck size={16} /> Protocoles de Sécurité
                </div>
                <p className="text-xs text-slate-500 italic leading-relaxed">
                   En accédant à AXIOMA OS, vous reconnaissez que les analyses de Coach José sont basées sur des algorithmes d'intelligence artificielle. Les résultats ne constituent pas un diagnostic médical légal. Vous vous engagez à consulter votre médecin traitant avant toute modification de votre régime de santé.
                </p>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                  href={SYSTEM_CONFIG.legal.tos_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <FileText size={16} /> Terms of Service <ExternalLink size={12} />
                </a>
                <button 
                  onClick={handleAccept}
                  className="flex-[2] p-5 bg-[#00d4ff] text-slate-950 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-95 transition-all"
                >
                  {t.legal_accept} <CheckCircle size={18} />
                </button>
             </div>
          </div>

          <div className="pt-4 flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
             AXIOMA GLOBAL COMPLIANCE ENGINE • v{SYSTEM_CONFIG.version}
          </div>
        </div>
      </div>
    </div>
  );
};
