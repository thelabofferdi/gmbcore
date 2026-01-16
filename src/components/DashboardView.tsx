import React from 'react';
import {
    Rocket, Layers, Wallet, Bot, ShieldCheck, Share2
} from 'lucide-react';
import { LeadChart } from './LeadChart';
import { DashboardStats, AdminStats } from '../services/statsService'; // Check if AdminStats is needed or not. The original code only used DashboardStats in props but let's be safe.
import { AuthUser } from '../types/types';

interface DashboardViewProps {
    t: any;
    stats: DashboardStats;
    myReferralLink: string;
    currentUser: AuthUser | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ t, stats, myReferralLink, currentUser }) => {
    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-1000 pb-16 md:pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 lg:gap-8">
                <header>
                    <h2 className="text-2xl md:text-4xl lg:text-6xl font-black text-white tracking-tighter leading-none italic uppercase">{t.dashboard}</h2>
                    <p className="text-slate-500 font-medium text-xs md:text-sm lg:text-xl mt-1 md:mt-2 lg:mt-4 italic">Global Command for Health Restoration.</p>
                </header>

                <div className="flex items-center gap-3 md:gap-4 lg:gap-6 bg-white/5 p-3 md:p-4 lg:p-6 rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] border border-white/10 backdrop-blur-xl group hover:border-[#00d4ff]/40 transition-all w-full lg:w-auto">
                    <div className="text-right flex-1 lg:flex-none">
                        <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Hub Health</p>
                        <p className="text-lg md:text-2xl lg:text-3xl font-black text-emerald-400 italic uppercase tracking-tighter">OPTIMIZED</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-[#00d4ff]/20 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center text-[#00d4ff] shadow-[0_0_20px_#00d4ff44] group-hover:scale-110 transition-transform">
                        <ShieldCheck size={20} className="md:w-6 md:h-6 lg:w-8 lg:h-8" />
                    </div>
                </div>
            </div>

            <section className="bg-slate-950/40 rounded-2xl md:rounded-3xl lg:rounded-[4.5rem] p-4 md:p-6 lg:p-12 xl:p-20 text-white relative overflow-hidden shadow-3xl border border-white/5 backdrop-blur-3xl group">
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 lg:gap-20">
                    <div className="space-y-4 md:space-y-6 lg:space-y-10 flex-1 w-full">
                        <h3 className="text-xl md:text-3xl lg:text-5xl xl:text-8xl font-black tracking-tighter leading-[0.9] italic uppercase text-center lg:text-left">Bio-Digital Identity</h3>
                        <p className="text-slate-400 text-sm md:text-lg lg:text-2xl font-medium max-w-3xl leading-relaxed italic text-center lg:text-left">Chaque diagnostic généré par José est synchronisé avec votre lien de capture universel.</p>

                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
                            <div className="flex-1 w-full bg-slate-900/80 border border-white/10 px-4 md:px-6 lg:px-10 py-3 md:py-4 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-[2rem] font-mono text-[#00d4ff] text-[10px] md:text-xs lg:text-sm truncate shadow-inner">
                                {myReferralLink}
                            </div>
                            <button
                                onClick={() => { navigator.clipboard.writeText(myReferralLink); alert("Lien Copié !"); }}
                                className="w-full md:w-auto p-3 md:p-4 lg:p-6 bg-white/10 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl hover:bg-[#00d4ff] hover:text-slate-950 transition-all flex items-center justify-center gap-2 md:gap-3 shadow-xl uppercase font-black text-[9px] md:text-[10px] italic tracking-widest">
                                <Share2 size={16} className="md:w-5 md:h-5 lg:w-6 lg:h-6" /> <span>SYNC</span>
                            </button>
                        </div>

                        <button className="w-full md:w-auto px-10 md:px-16 py-6 md:py-8 bg-[#00d4ff] text-slate-950 font-black rounded-2xl md:rounded-[3rem] uppercase tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm shadow-[0_30px_60px_rgba(0,212,255,0.3)] flex items-center justify-center gap-4 md:gap-6 hover:scale-105 active:scale-95 transition-all italic">
                            <Rocket size={24} className="md:w-8 md:h-8" /> {t.propulsion}
                        </button>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {[
                    { label: "Capture Leads", value: stats.prospects, color: "text-[#00d4ff]", icon: Rocket },
                    { label: "Volume MLM", value: `${stats.salesVolume} PV`, color: "text-emerald-400", icon: Layers },
                    { label: "SaaS Rev", value: `$${stats.commissions}`, color: "text-amber-400", icon: Wallet },
                    { label: "AI Conversions", value: stats.conversions, color: "text-rose-400", icon: Bot },
                ].map((stat, i) => (
                    <div key={i} className="p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/5 bg-slate-950/40 shadow-2xl relative group overflow-hidden">
                        <stat.icon size={32} className={`${stat.color} mb-4 md:mb-6 relative z-10 md:w-10 md:h-10`} />
                        <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic relative z-10">{stat.label}</p>
                        <h3 className={`text-4xl md:text-5xl font-black ${stat.color} mt-2 md:mt-4 italic tracking-tighter relative z-10 tabular-nums`}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-950/40">
                    <LeadChart userId={currentUser?.id} />
                </div>

                <section className="bg-slate-950/40 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-white/5 flex flex-col justify-center relative overflow-hidden shadow-2xl">
                    <h4 className="text-2xl md:text-3xl font-black text-white italic mb-4 md:mb-6 uppercase tracking-tight relative z-10">AI Performance</h4>
                    <p className="text-slate-400 text-base md:text-lg leading-relaxed italic relative z-10">José convertit 24h/24. Taux de succès bio-sync : 98.4%. Votre empire est sécurisé.</p>
                    <div className="mt-8 md:mt-12 p-6 md:p-8 bg-slate-900/80 rounded-2xl md:rounded-[2.5rem] border border-white/5 flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status Réseau</p>
                            <p className="text-lg md:text-xl font-black text-emerald-400 italic">42 HUBs ACTIFS</p>
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg animate-pulse">
                            <ShieldCheck size={24} className="md:w-8 md:h-8" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
