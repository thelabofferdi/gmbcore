
import React, { useEffect, useState, useRef } from 'react';
import { 
  Flame, 
  Trophy, 
  PartyPopper, 
  MapPin, 
  HeartPulse, 
  Share2, 
  X, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  DollarSign,
  Volume2,
  Square
} from 'lucide-react';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';

interface ConversionNotificationProps {
  prospectCountry: string;
  healthFocus: string;
  onClose: () => void;
  onSocialSync: () => void;
}

export const ConversionNotification: React.FC<ConversionNotificationProps> = ({ 
  prospectCountry, 
  healthFocus, 
  onClose,
  onSocialSync 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    setIsVisible(true);
    // Auto-close after 30 seconds if reading or no interaction
    const timer = setTimeout(() => {
      if (!isReading) {
        setIsVisible(false);
        setTimeout(onClose, 500);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [onClose, isReading]);

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }
    setIsReading(false);
  };

  const handleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReading) { stopAudio(); return; }
    setIsReading(true);
    const textToRead = `Félicitations Leader ! Coach José vient de réussir un closing. Nouveau prospect détecté en ${prospectCountry} avec un focus sur ${healthFocus}. Le lien boutique a été envoyé.`;
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
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  return (
    <div className={`fixed top-10 right-10 z-[300] w-full max-w-md transition-all duration-700 transform ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-20 opacity-0 scale-90'}`}>
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-[#FFD700] overflow-hidden relative">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent animate-pulse"></div>
        
        <div className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-4">
             <button 
                onClick={handleRead}
                className={`p-3 rounded-xl transition-all ${isReading ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:text-slate-900'}`}
             >
                {isReading ? <Square size={16} /> : <Volume2 size={16} />}
             </button>
             <button 
               onClick={handleClose}
               className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
             >
               <X size={20} />
             </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-[#FFD700] shadow-xl shadow-[#FFD700]/20 animate-bounce">
              <Flame size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">🔥 BOOM ! José vient de frapper !</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Closing Réussi</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              Félicitations ! Votre Assistant José a terminé un diagnostic de Restauration Biologique complet avec un nouveau prospect.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <MapPin size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Localisation</span>
                </div>
                <p className="text-xs font-bold text-slate-800">{prospectCountry}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <HeartPulse size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Focus Santé</span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{healthFocus}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
              <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                <Sparkles size={12} className="inline mr-1 mb-0.5" />
                José a déjà envoyé votre lien boutique NeoLife personnalisé et a guidé le client pour le choix du drapeau.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">+1 Conversion ajoutée</span>
              </div>
              <div className="flex items-center gap-1 text-[#FFD700] bg-slate-900 px-2 py-0.5 rounded text-[10px] font-black">
                <DollarSign size={10} />
                CASH REGISTER
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic font-medium">
              "Pendant que vous bâtissez votre empire, José sécurise vos frontières. Continuez ainsi, Leader !"
            </p>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-900 uppercase text-center tracking-widest">Social Viral Trigger</p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { stopAudio(); onSocialSync(); setIsVisible(false); setTimeout(onClose, 500); }}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl uppercase tracking-widest text-[10px]"
                >
                  <Share2 size={16} className="text-[#FFD700]" /> OUI, PUBLIE CE SUCCÈS !
                </button>
                <button 
                  onClick={handleClose}
                  className="w-full py-3 bg-white text-slate-400 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
                >
                  Pas pour le moment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
