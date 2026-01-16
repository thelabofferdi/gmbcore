import React from 'react';
import { Menu, Zap, Square, Volume2 } from 'lucide-react';
import { Language, AuthUser, TabType } from '../types/types';

interface HeaderProps {
    syncStatus: number;
    lang: Language;
    setLang: (lang: Language) => void;
    isReadingBrief: boolean;
    readPageBrief: () => void;
    stopBriefing: () => void;
    onBoost: () => void;
    currentUser: AuthUser | null;
    setActiveTab: (tab: TabType) => void;
    onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    syncStatus,
    lang,
    setLang,
    isReadingBrief,
    readPageBrief,
    stopBriefing,
    onBoost,
    currentUser,
    setActiveTab,
    onOpenSidebar
}) => {
    return (
        <header className="h-20 lg:h-28 bg-slate-950/40 backdrop-blur-3xl border-b border-white/5 px-4 md:px-10 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4 md:gap-8">
                <button
                    className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl"
                    onClick={onOpenSidebar}
                >
                    <Menu size={20} className="text-white" />
                </button>

                <div className="hidden xl:flex items-center gap-6">
                    <div className="flex flex-col">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bio-Sync Intelligence</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff] transition-all duration-1000"
                                    style={{ width: `${syncStatus}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-mono text-[#00d4ff] font-bold">{syncStatus}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
                    {(['fr', 'en', 'it', 'es'] as Language[]).map(l => (
                        <button
                            key={l}
                            onClick={() => { setLang(l); stopBriefing(); }}
                            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${lang === l ? 'bg-[#00d4ff] text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                {/* Mobile Language Toggle (Simple) */}
                <button
                    className="md:hidden p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black uppercase"
                    onClick={() => {
                        const langs: Language[] = ['fr', 'en', 'it', 'es'];
                        const currentIndex = langs.indexOf(lang);
                        const nextLang = langs[(currentIndex + 1) % langs.length];
                        setLang(nextLang);
                        stopBriefing();
                    }}
                >
                    {lang}
                </button>

                <button
                    onClick={readPageBrief}
                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${isReadingBrief ? 'bg-[#00d4ff] text-slate-950 shadow-[0_0_20px_#00d4ff]' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}
                >
                    {isReadingBrief ? <Square size={18} /> : <Volume2 size={18} />}
                </button>

                <button
                    onClick={onBoost}
                    className="p-3 md:p-4 bg-white/5 border border-white/10 text-white rounded-xl md:rounded-2xl hover:bg-[#00d4ff] hover:text-slate-950 transition-all group"
                >
                    <Zap size={18} />
                </button>

                <div
                    onClick={() => setActiveTab('profile')}
                    className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border-2 border-white/20 hover:scale-105 transition-transform"
                >
                    <img
                        src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
};
