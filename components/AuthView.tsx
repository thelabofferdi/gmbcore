
import React, { useState } from 'react';
import { Fingerprint, Loader2, ShieldCheck, Zap, Layers, Volume2, Square } from 'lucide-react';
import { AuthUser } from '../types';
import { SYSTEM_CONFIG } from '../constants';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';
import { signIn, signUp } from '../services/supabaseService';

interface AuthViewProps {
  onLogin: (user: AuthUser) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const activeSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Identification requise.");
      return;
    }
    setIsScanning(true);
    setError('');

    try {
      const { data, error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Vérifiez votre email pour confirmer votre compte');
        } else {
          setError(error.message);
        }
        setIsScanning(false);
        return;
      }

      if (isSignUp) {
        setError('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
        setIsScanning(false);
        return;
      }

      if (data.user && data.user.email_confirmed_at) {
        const user: AuthUser = {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          neoLifeId: SYSTEM_CONFIG.founder.id,
          role: data.user.email?.includes('admin') ? 'ADMIN' : 'LEADER',
          joinedDate: new Date(data.user.created_at),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
        };
        onLogin(user);
      } else if (data.user && !data.user.email_confirmed_at) {
        setError('Veuillez confirmer votre email avant de vous connecter');
        setIsScanning(false);
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsScanning(false);
    }
  };

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }
    setIsReading(false);
  };

  const readGuide = async () => {
    if (isReading) { stopAudio(); return; }
    setIsReading(true);
    const text = "Bienvenue sur le Hub NDSA GMBC OS. Veuillez entrer votre identifiant digital dans le premier champ, et votre clé de cryptage dans le second. Cliquez ensuite sur le bouton synchroniser au centre de l'écran.";
    const base64 = await generateJoseAudio(text);
    if (base64) {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b1418] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.1),transparent_70%)] animate-pulse" aria-hidden="true"></div>
      
      <div className="w-full max-w-xl bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-12 md:p-16 shadow-3xl relative z-10 animate-in zoom-in-95 duration-700">
        <button 
          onClick={readGuide}
          aria-label="Écouter le guide vocal de connexion"
          className={`absolute top-10 right-10 p-4 rounded-2xl border transition-all ${isReading ? 'bg-[#00d4ff] text-slate-950 shadow-[0_0_15px_#00d4ff]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
        >
          {isReading ? <Square size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="text-center space-y-8 mb-12">
          <div className="w-24 h-24 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden" aria-hidden="true">
            <Layers size={44} className="text-[#00d4ff]" />
          </div>
          <header>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">{SYSTEM_CONFIG.brand}</h1>
            <p className="text-[10px] text-[#00d4ff] font-black uppercase tracking-[0.4em] mt-2 italic">Accès Protocol Omega-7</p>
          </header>
        </div>

        <form onSubmit={handleAuth} className="space-y-6" aria-label="Formulaire de connexion">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identifiant Digital</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full bg-slate-950 border border-white/10 px-8 py-6 rounded-3xl text-white font-bold outline-none focus:border-[#00d4ff] transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Clé de Cryptage</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-white/10 px-8 py-6 rounded-3xl text-white font-bold outline-none focus:border-[#00d4ff] transition-all"
              required
            />
          </div>

          {error && <p role="alert" className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</p>}

          <button 
            type="submit" 
            disabled={isScanning}
            className="w-full py-8 bg-[#00d4ff] text-slate-950 font-black rounded-[2.5rem] uppercase tracking-[0.5em] text-xs shadow-2xl flex items-center justify-center gap-4 hover:brightness-110 active:scale-95 transition-all"
            aria-busy={isScanning}
          >
            {isScanning ? <><Loader2 className="animate-spin" size={20} /> SYNC...</> : <><Fingerprint size={20} /> {isSignUp ? 'CRÉER COMPTE' : 'SYNCHRONISER'}</>}
          </button>

          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-[#00d4ff] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          </button>
        </form>
      </div>
    </div>
  );
};
