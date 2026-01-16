
import React, { useState, useRef } from 'react';
import { User, Mail, Fingerprint, MapPin, Calendar, ShieldCheck, LogOut, Save, Camera, Sparkles, Award, Globe, Edit3, Trash2, Volume2, Square } from 'lucide-react';
import { AuthUser } from '../types/types';
import { SYSTEM_CONFIG } from '../constants';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';

interface ProfileViewProps {
  user: AuthUser;
  onUpdate: (user: AuthUser) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState<AuthUser>(user);
  const [isSaved, setIsSaved] = useState(false);
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
    const textToRead = `Bienvenue sur votre Profil Leader. Vous pouvez ici modifier votre identité, votre identifiant NeoLife et votre biographie de leadership. Votre progression vers le niveau de Maîtrise Diamond Architect est également visible ici.`;
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

  const handleSave = () => {
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Profile Card */}
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 p-10 overflow-hidden relative shadow-3xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00d4ff]/10 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-950 border-4 border-[#00d4ff]/20 overflow-hidden flex items-center justify-center">
              <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-[#00d4ff] text-slate-950 rounded-2xl shadow-xl hover:scale-110 transition-transform">
              <Camera size={18} />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{formData.name}</h2>
                <span className="px-3 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[9px] font-black text-[#00d4ff] rounded-full uppercase tracking-widest">{formData.role}</span>
                <button 
                  onClick={handleRead}
                  className={`p-2 rounded-xl border transition-all ${isReading ? 'bg-[#00d4ff] text-slate-950 shadow-lg animate-pulse' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                >
                  {isReading ? <Square size={16} /> : <Volume2 size={16} />}
                </button>
              </div>
              <p className="text-slate-400 font-medium text-lg italic mt-1">{formData.email}</p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                  <Calendar size={14} className="text-[#00d4ff]" /> Membre depuis : {formData.joinedDate.toLocaleDateString()}
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                  <Fingerprint size={14} className="text-emerald-400" /> ID : {formData.neoLifeId}
               </div>
            </div>
          </div>

          <button onClick={onLogout} className="px-6 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <Edit3 size={24} className="text-[#00d4ff]" />
              <h3 className="text-xl font-black text-white uppercase italic">Configuration de l'Identité</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nom Complet</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 px-6 py-4 rounded-2xl text-white font-bold outline-none focus:border-[#00d4ff] transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">ID NeoLife (Referral)</label>
                <input 
                  type="text" 
                  value={formData.neoLifeId} 
                  onChange={(e) => setFormData({...formData, neoLifeId: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 px-6 py-4 rounded-2xl text-[#00d4ff] font-black outline-none focus:border-[#00d4ff] transition-all"
                />
              </div>
            </div>

            {/* Champ Web Alias NeoLife */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                Lien Boutique NeoLife (Web Alias)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm font-mono">shopneolife.com/</span>
                <input 
                  type="text" 
                  value={formData.neoLifeWebAlias || ''} 
                  onChange={(e) => setFormData({...formData, neoLifeWebAlias: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                  placeholder="votre-alias"
                  className="flex-1 bg-slate-950 border border-white/10 px-6 py-4 rounded-2xl text-emerald-400 font-black outline-none focus:border-emerald-400 transition-all"
                />
              </div>
              {!formData.neoLifeWebAlias && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mt-2">
                  <Globe size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-500 text-xs font-bold">⚠️ Lien boutique non configuré</p>
                    <p className="text-amber-500/70 text-[10px] mt-1">
                      Sans votre Web Alias personnel, les ventes générées par José seront créditées à l'équipe Humble Team. 
                      Trouvez votre alias dans votre Back Office NeoLife.
                    </p>
                  </div>
                </div>
              )}
              {formData.neoLifeWebAlias && (
                <p className="text-emerald-400/70 text-[10px] ml-2">
                  ✓ Votre boutique : <a href={`https://shopneolife.com/${formData.neoLifeWebAlias}/shop/products`} target="_blank" rel="noopener noreferrer" className="underline">shopneolife.com/{formData.neoLifeWebAlias}</a>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Biographie Leadership</label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Votre vision du leadership Stark..."
                className="w-full bg-slate-950 border border-white/10 px-6 py-4 rounded-2xl text-white font-medium outline-none focus:border-[#00d4ff] transition-all resize-none italic"
              />
            </div>

            <button 
              onClick={handleSave}
              className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 transition-all ${isSaved ? 'bg-emerald-500 text-slate-950' : 'bg-[#00d4ff] text-slate-950 shadow-2xl hover:brightness-110'}`}
            >
              {isSaved ? <ShieldCheck size={20} /> : <Save size={20} />}
              {isSaved ? 'Identité Synchronisée' : 'Sauvegarder les modifications'}
            </button>
          </div>
        </div>

        {/* Badges / Status Column */}
        <div className="space-y-8">
           <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] p-10 space-y-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Award size={140} /></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Niveau de Maîtrise</p>
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl mx-auto flex items-center justify-center shadow-3xl rotate-12 group-hover:rotate-0 transition-all duration-700">
                <Sparkles size={48} className="text-slate-900" />
              </div>
              <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Diamond Architect</h4>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]"></div>
              </div>
              <p className="text-[10px] font-bold text-[#00d4ff] uppercase tracking-widest">75% vers le Niveau Impérial</p>
           </div>

           <div className="bg-slate-950/40 border border-white/5 rounded-[3rem] p-8 space-y-6">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Zone de Sécurité</h5>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                 <span>Authentification 2FA</span>
                 <span className="text-emerald-500">Actif</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                 <span>Visibilité Hub</span>
                 <span className="text-[#00d4ff]">Global</span>
              </div>
              <button className="w-full py-4 border border-rose-500/20 text-rose-500/50 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-rose-500 transition-all">
                Supprimer mon compte
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
