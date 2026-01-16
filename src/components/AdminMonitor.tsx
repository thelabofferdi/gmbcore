
import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  Cpu, 
  Globe, 
  Factory,
  X,
  Plus,
  Palette,
  Eye,
  Trash2,
  Server,
  Database,
  Unlink,
  Settings,
  Bot,
  RotateCw,
  Box,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Rocket,
  Layers,
  Sparkles,
  Terminal,
  Activity,
  PlusCircle,
  Fingerprint,
  Zap,
  Lock,
  Volume2,
  Square
} from 'lucide-react';
import { SYSTEM_CONFIG } from '../constants';
import { AdminMonitorStats, WhiteLabelInstance } from '../types/types';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';

interface AdminMonitorProps {
  stats: AdminMonitorStats;
}

export const AdminMonitor: React.FC<AdminMonitorStats> = ({ stats }) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'factory'>('monitor');
  const [showFactory, setShowFactory] = useState(false);
  const [factoryStep, setFactoryStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [sourceHub, setSourceHub] = useState('GMBC-OS-MASTER-V5');
  const [instances, setInstances] = useState<WhiteLabelInstance[]>([]);
  const [isReading, setIsReading] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // White Label Form State
  const [newClient, setNewClient] = useState<Partial<WhiteLabelInstance>>({
    clientName: '',
    industry: 'Santé & Bien-être',
    aiName: 'José',
    currency: 'USD',
    primaryColor: '#00d4ff',
    catalogType: 'neolife',
    logoUrl: '',
    setupFee: 1500,
    royaltyRate: 40,
    isLocked: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('ndsa_white_label_instances');
    if (saved) {
      try {
        setInstances(JSON.parse(saved).map((i: any) => ({ ...i, deploymentDate: new Date(i.deploymentDate) })));
      } catch (e) { console.error("WL Instances load failed"); }
    }
  }, []);

  const saveInstances = (newInstances: WhiteLabelInstance[]) => {
    setInstances(newInstances);
    localStorage.setItem('ndsa_white_label_instances', JSON.stringify(newInstances));
  };

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
    let brief = activeTab === 'monitor' 
      ? `Console Master activée. Vos revenus SaaS s'élèvent à ${stats.totalNetSaaS} dollars. L'efficacité de l'IA est de ${stats.aiEffectiveness}%.`
      : "Usine de déploiement de hubs. Ici vous pouvez cloner des instances isolées pour vos clients premium.";
    
    const base64 = await generateJoseAudio(brief);
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

  const handleDeploy = () => {
    if (!newClient.clientName) return;
    setIsDeploying(true);
    setTimeout(() => {
      const instance: WhiteLabelInstance = {
        ...(newClient as WhiteLabelInstance),
        id: `WL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        deploymentDate: new Date(),
        status: 'ACTIVE'
      };
      saveInstances([instance, ...instances]);
      setIsDeploying(false);
      setFactoryStep(5);
    }, 4500);
  };

  const toggleLock = (id: string) => {
    saveInstances(instances.map(i => i.id === id ? { ...i, isLocked: !i.isLocked, status: !i.isLocked ? 'LOCKED' : 'ACTIVE' } : i));
  };

  const deleteInstance = (id: string) => {
    saveInstances(instances.filter(i => i.id !== id));
  };

  const FactoryModal = () => (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-[500] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
      <div className="bg-slate-900 rounded-[4rem] shadow-3xl w-full max-w-4xl overflow-hidden relative border border-[#00d4ff]/20 my-auto">
        <div className="absolute top-0 left-0 w-full h-2 bg-white/5 flex">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`flex-1 h-full transition-all duration-700 ${factoryStep >= s ? 'bg-[#00d4ff]' : 'bg-transparent'}`} />
          ))}
        </div>
        
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#00d4ff]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <button onClick={() => { stopAudio(); setShowFactory(false); setFactoryStep(1); }} className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white z-50 border border-white/5"><X size={24} /></button>
        
        <div className="p-16 relative z-10">
          {factoryStep === 1 && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 bg-[#00d4ff]/10 border border-[#00d4ff]/40 rounded-[2.5rem] flex items-center justify-center text-[#00d4ff] shadow-3xl shadow-[#00d4ff]/20 animate-pulse"><RotateCw size={44} /></div>
                <div>
                  <div className="px-3 py-1 bg-[#00d4ff]/10 rounded-full border border-[#00d4ff]/20 inline-block mb-3">
                    <span className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest">Protocol Omega-7</span>
                  </div>
                  <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase">Clone Hub Workflow</h3>
                  <p className="text-slate-400 text-lg font-medium mt-1 italic">Initialisation du clonage d'instance isolée.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                    <Box size={14} /> Sélection du Hub Source (Master Engine)
                  </label>
                  <select 
                    className="w-full px-8 py-6 rounded-[2rem] bg-slate-950 border border-white/10 text-white focus:border-[#00d4ff] outline-none transition-all font-black italic uppercase tracking-tight cursor-pointer appearance-none shadow-inner"
                    value={sourceHub}
                    onChange={(e) => setSourceHub(e.target.value)}
                  >
                    <option value="GMBC-OS-MASTER-V5">GMBC OS MASTER v5.0 (Global)</option>
                    <option value="AFRICA-BIO-SYNC-V2">Africa Bio-Sync v2.1</option>
                    <option value="EURO-EXCELLENCE-V1">Euro Excellence v1.0</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <PlusCircle size={14} /> Nom du Client / Hub
                    </label>
                    <input type="text" placeholder="Ex: BioTech Elite Hub" className="w-full px-8 py-6 rounded-[2rem] bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#00d4ff] outline-none transition-all font-bold placeholder:text-slate-600" value={newClient.clientName} onChange={e => setNewClient({...newClient, clientName: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <Globe size={14} /> Secteur d'Activité
                    </label>
                    <select className="w-full px-8 py-6 rounded-[2rem] bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#00d4ff] outline-none transition-all font-bold appearance-none cursor-pointer" value={newClient.industry} onChange={e => setNewClient({...newClient, industry: e.target.value})}>
                      <option className="bg-slate-900">Santé & Bien-être</option>
                      <option className="bg-slate-900">Cosmétique Bio</option>
                      <option className="bg-slate-900">Nutrition Sportive</option>
                    </select>
                  </div>
                </div>
              </div>

              <button onClick={() => setFactoryStep(2)} className="w-full py-8 bg-[#00d4ff] text-slate-900 font-black rounded-[2.5rem] uppercase tracking-[0.4em] text-sm shadow-3xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                Personnaliser l'ADN du Hub <ChevronRight size={24} />
              </button>
            </div>
          )}

          {factoryStep === 2 && (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 bg-purple-500/10 border border-purple-500/40 rounded-[2.5rem] flex items-center justify-center text-purple-500 shadow-3xl shadow-purple-500/20"><Palette size={44} /></div>
                <div>
                  <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase">AI & Visual Identity</h3>
                  <p className="text-slate-400 text-lg font-medium italic mt-1">Configuration de l'agent intelligent et du design.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <Bot size={14} /> Nom de l'IA (Custom Persona)
                    </label>
                    <input type="text" value={newClient.aiName} onChange={e => setNewClient({...newClient, aiName: e.target.value})} className="w-full px-8 py-6 rounded-[2rem] bg-slate-950 border border-white/10 text-white focus:border-[#00d4ff] outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <Palette size={14} /> Theme Color (Hex)
                    </label>
                    <div className="flex gap-4">
                      <input type="color" value={newClient.primaryColor} onChange={e => setNewClient({...newClient, primaryColor: e.target.value})} className="w-20 h-20 bg-transparent border-none cursor-pointer rounded-xl overflow-hidden" />
                      <input type="text" value={newClient.primaryColor} onChange={e => setNewClient({...newClient, primaryColor: e.target.value})} className="flex-1 px-8 py-6 rounded-[2rem] bg-slate-950 border border-white/10 text-white focus:border-[#00d4ff] outline-none transition-all font-mono font-bold" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                    <Database size={14} /> Catalog Synchronization
                  </label>
                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      onClick={() => setNewClient({...newClient, catalogType: 'neolife'})} 
                      className={`p-6 rounded-3xl border flex items-center gap-4 transition-all ${newClient.catalogType === 'neolife' ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-white shadow-lg shadow-[#00d4ff]/10' : 'bg-white/5 border-white/10 text-slate-500'}`}
                    >
                      <Layers size={20} /> <span className="font-black uppercase tracking-widest text-xs">NeoLife Native</span>
                    </button>
                    <button 
                      onClick={() => setNewClient({...newClient, catalogType: 'custom'})} 
                      className={`p-6 rounded-3xl border flex items-center gap-4 transition-all ${newClient.catalogType === 'custom' ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
                    >
                      <PlusCircle size={20} /> <span className="font-black uppercase tracking-widest text-xs">Custom Engine</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6">
                <button onClick={() => setFactoryStep(1)} className="flex-1 py-8 border border-white/10 text-white font-black rounded-[2.5rem] uppercase tracking-widest text-sm hover:bg-white/5 transition-all">Retour</button>
                <button onClick={() => setFactoryStep(3)} className="flex-[2] py-8 bg-[#00d4ff] text-slate-900 font-black rounded-[2.5rem] uppercase tracking-[0.4em] text-sm shadow-3xl hover:brightness-110 active:scale-[0.98] transition-all">Setup Financier <ChevronRight size={20} /></button>
              </div>
            </div>
          )}

          {factoryStep === 3 && (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/40 rounded-[2.5rem] flex items-center justify-center text-amber-500 shadow-3xl shadow-amber-500/20"><DollarSign size={44} /></div>
                <div>
                  <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase">Finance Engine</h3>
                  <p className="text-slate-400 text-lg font-medium italic mt-1">Modélisation des revenus et royalties.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">Setup Fee ($)</label>
                  <input type="number" className="w-full px-8 py-7 rounded-[2.5rem] bg-slate-950 border border-white/10 text-white focus:bg-white/10 focus:border-[#00d4ff] outline-none transition-all font-black text-xl shadow-inner" value={newClient.setupFee} onChange={e => setNewClient({...newClient, setupFee: Number(e.target.value)})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">Royalties NDSA (%)</label>
                  <input type="number" className="w-full px-8 py-7 rounded-[2.5rem] bg-slate-950 border border-white/10 text-white focus:bg-white/10 focus:border-[#00d4ff] outline-none transition-all font-black text-xl shadow-inner" value={newClient.royaltyRate} onChange={e => setNewClient({...newClient, royaltyRate: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-6 pt-6">
                <button onClick={() => setFactoryStep(2)} className="flex-1 py-8 border border-white/10 text-white font-black rounded-[2.5rem] uppercase tracking-widest text-sm hover:bg-white/5 transition-all">Retour</button>
                <button onClick={() => setFactoryStep(4)} className="flex-[2] py-8 bg-[#00d4ff] text-slate-900 font-black rounded-[2.5rem] uppercase tracking-[0.4em] text-sm shadow-3xl hover:brightness-110 active:scale-[0.98] transition-all">Compiler & Déployer</button>
              </div>
            </div>
          )}

          {factoryStep === 4 && (
            <div className="text-center space-y-16 animate-in slide-in-from-right-12 duration-500">
               <div className="relative inline-block">
                  <div className="w-40 h-40 bg-[#00d4ff]/10 border-4 border-[#00d4ff] rounded-[3.5rem] flex items-center justify-center mx-auto text-[#00d4ff] shadow-3xl relative z-10">
                    {isDeploying ? <RotateCw size={80} className="animate-spin" /> : <ShieldCheck size={80} />}
                  </div>
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center animate-pulse shadow-3xl border-8 border-slate-900"><Zap size={32} /></div>
               </div>
               <div className="space-y-6">
                  <h3 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">{isDeploying ? "Compilation..." : "Hub Prêt"}</h3>
                  <p className="text-slate-400 text-2xl font-medium max-w-3xl mx-auto leading-relaxed italic">
                    Clonage des protocoles de <strong>{sourceHub}</strong> vers l'instance <strong>{newClient.clientName}</strong>.
                  </p>
               </div>
               {!isDeploying && (
                 <button onClick={handleDeploy} className="w-full py-10 bg-emerald-500 text-slate-950 font-black rounded-[3rem] uppercase tracking-[0.5em] text-sm shadow-3xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-6">
                   DÉPLOIEMENT FINAL <Rocket size={32} />
                 </button>
               )}
            </div>
          )}

          {factoryStep === 5 && (
            <div className="text-center space-y-12 animate-in zoom-in-95 duration-1000 py-10">
               <div className="relative inline-block">
                 <div className="w-40 h-40 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto text-slate-950 shadow-3xl relative z-10"><CheckCircle2 size={80} /></div>
                 <div className="absolute -top-6 -right-6 w-16 h-16 bg-slate-900 text-[#00d4ff] rounded-full flex items-center justify-center animate-bounce shadow-3xl border-4 border-white/20"><Sparkles size={32} /></div>
               </div>
               <div className="space-y-4">
                 <h3 className="text-6xl font-black text-white tracking-tighter mb-4 italic uppercase leading-none">HUB ACTIVÉ</h3>
                 <p className="text-slate-500 text-2xl font-medium max-w-2xl mx-auto leading-relaxed italic">
                   Instance <strong>{newClient.clientName}</strong> déployée avec succès. 
                   Protocoles Bio-Sync opérationnels.
                 </p>
               </div>
               <button onClick={() => { stopAudio(); setShowFactory(false); setFactoryStep(1); setActiveTab('factory'); }} className="w-full py-10 bg-white text-slate-950 font-black rounded-[3rem] uppercase tracking-[0.5em] text-sm shadow-3xl hover:bg-[#00d4ff] hover:text-slate-950 transition-all flex items-center justify-center gap-4">
                 VOIR LA PRODUCTION <Layers size={24} />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {showFactory && <FactoryModal />}
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-950/40 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00d4ff]/5 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
              <ShieldAlert size={14} className="text-[#00d4ff]" /> Master Control v{SYSTEM_CONFIG.version}
            </div>
            <button 
              onClick={handleRead}
              className={`p-3 rounded-xl transition-all ${isReading ? 'bg-[#00d4ff] text-slate-950 animate-pulse' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'}`}
            >
              {isReading ? <Square size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">Console Master</h2>
          <div className="flex gap-4">
            <button onClick={() => { stopAudio(); setActiveTab('monitor'); }} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'monitor' ? 'bg-[#00d4ff] text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'}`}>Monitoring</button>
            <button onClick={() => { stopAudio(); setActiveTab('factory'); }} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'factory' ? 'bg-[#00d4ff] text-slate-950 shadow-lg shadow-[#00d4ff]/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}>White Label Factory</button>
          </div>
        </div>
        <button onClick={() => { stopAudio(); setFactoryStep(1); setShowFactory(true); }} className="px-12 py-6 bg-[#00d4ff] text-slate-950 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-3xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 relative z-10 group">
          <RotateCw size={22} className="group-hover:rotate-180 transition-transform duration-700" /> Clone Hub Workflow
        </button>
      </div>

      {activeTab === 'monitor' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: "SaaS Net Revenue", value: `$${stats.totalNetSaaS.toLocaleString()}`, icon: DollarSign, color: "text-[#00d4ff]", trend: "+12.4%" },
              { label: "AI Close Rate", value: `${stats.aiEffectiveness}%`, icon: Cpu, color: "text-emerald-400", trend: "+1.8%" },
              { label: "Orphan Leads", value: stats.orphanLeadsCount.toLocaleString(), icon: Activity, color: "text-amber-500", trend: "+24 today" },
              { label: "Active Omega Hubs", value: instances.length.toString(), icon: Server, color: "text-purple-400", trend: instances.length > 0 ? "+1" : "0" }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-950/40 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/5 shadow-xl relative group overflow-hidden">
                <div className="absolute -right-8 -bottom-8 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><stat.icon size={120} /></div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className={`p-5 rounded-2xl bg-white/5 ${stat.color} border border-white/10`}><stat.icon size={32} /></div>
                   <div className="bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black text-emerald-400 border border-emerald-500/20">{stat.trend}</div>
                </div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                <h3 className="text-4xl font-black text-white italic tracking-tighter tabular-nums">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Activity size={120} /></div>
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-[#00d4ff]/10 rounded-2xl text-[#00d4ff]"><Terminal size={32} /></div>
                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Commandes Fondateur</h3>
               </div>
               <div className="grid grid-cols-2 gap-6 relative z-10">
                  <button className="p-8 rounded-3xl bg-slate-950 border border-white/5 hover:border-[#00d4ff]/30 transition-all text-left space-y-4">
                     <Fingerprint size={24} className="text-[#00d4ff]" />
                     <p className="text-xs font-black uppercase text-white">Generate Master Link</p>
                  </button>
                  <button className="p-8 rounded-3xl bg-slate-950 border border-white/5 hover:border-emerald-500/30 transition-all text-left space-y-4">
                     <Database size={24} className="text-emerald-500" />
                     <p className="text-xs font-black uppercase text-white">Leads Routing</p>
                  </button>
               </div>
            </div>
            
            <div className="bg-slate-950/60 p-12 rounded-[4rem] border border-white/10 flex flex-col justify-center text-center space-y-6">
               <div className="w-20 h-20 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full flex items-center justify-center mx-auto shadow-2xl"><Zap size={40} className="text-[#00d4ff] animate-pulse" /></div>
               <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">Stark Bio-Sync Network</h4>
               <p className="text-slate-500 text-lg leading-relaxed italic max-w-md mx-auto">
                 L'infrastructure est optimisée pour un déploiement de 10,000 Hubs. Chaque cellule du réseau est isolée et sécurisée.
               </p>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-700">
           {/* Factory Dashboard */}
           <div className="bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden">
             <div className="p-12 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-500 shadow-2xl"><Factory size={40} /></div>
                 <div>
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Ligne de Production Hubs</h3>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 italic">Gestion des instances White Label (Protocol Omega-7).</p>
                 </div>
               </div>
               <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instance Health</p>
                    <p className="text-xl font-black text-emerald-400 italic">OPTIMAL</p>
                  </div>
                  {/* Fixed syntax error on line 501 below */}
                  <button onClick={() => { stopAudio(); setFactoryStep(1); setShowFactory(true); }} className="px-10 py-5 bg-[#00d4ff] text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-3xl hover:scale-105 active:scale-95 transition-all">Lancer Nouveau Clone</button>
               </div>
             </div>

             <div className="p-12">
               {instances.length === 0 ? (
                 <div className="py-24 text-center space-y-10">
                    <div className="w-32 h-32 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center mx-auto text-slate-700 shadow-inner"><Unlink size={60} /></div>
                    <div className="space-y-4">
                      <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase">Production Vide</h4>
                      <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto italic">Commencez l'expansion en clonant le Hub Master v5.0.</p>
                    </div>
                    <button onClick={() => { stopAudio(); setFactoryStep(1); setShowFactory(true); }} className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all italic">Initialiser Clone</button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {instances.map(instance => (
                      <div key={instance.id} className="p-10 bg-slate-900 border border-white/10 rounded-[3.5rem] hover:bg-white/5 transition-all group relative overflow-hidden shadow-2xl">
                         <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-all duration-1000"><Layers size={180} /></div>
                         <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className="w-16 h-16 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-2xl flex items-center justify-center font-black text-2xl uppercase italic text-[#00d4ff]" style={{ borderColor: instance.primaryColor, color: instance.primaryColor }}>
                              {instance.clientName.charAt(0)}
                            </div>
                            <div className="flex gap-3">
                               <button onClick={() => toggleLock(instance.id)} className={`p-4 rounded-xl transition-all shadow-lg ${instance.isLocked ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                  {instance.isLocked ? <Lock size={20} /> : <ShieldCheck size={20} />}
                               </button>
                               <button onClick={() => deleteInstance(instance.id)} className="p-4 bg-white/5 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                                  <Trash2 size={20} />
                               </button>
                            </div>
                         </div>
                         <div className="space-y-2 relative z-10 mb-8">
                            <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight truncate">{instance.clientName}</h4>
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{instance.industry}</span>
                               <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">{instance.status}</span>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5 relative z-10">
                            <div className="space-y-1">
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">AI Persona</p>
                               <p className="text-xs font-black text-white italic">{instance.aiName}</p>
                            </div>
                            <div className="text-right space-y-1">
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Catalog</p>
                               <p className="text-xs font-black text-[#00d4ff] uppercase italic">{instance.catalogType}</p>
                            </div>
                         </div>
                         <div className="mt-8 pt-8 border-t border-white/5 relative z-10 flex items-center justify-between">
                            <div className="text-xs font-bold text-slate-500 tabular-nums uppercase tracking-widest">
                               Setup: <span className="text-white">${instance.setupFee}</span>
                            </div>
                            <button className="px-6 py-3 bg-white/5 hover:bg-[#00d4ff] hover:text-slate-950 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Hub Dashboard</button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
