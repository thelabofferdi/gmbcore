import React from 'react';
import {
    LayoutDashboard, Bot, GraduationCap, Share2, Wallet,
    Settings, Layers, ClipboardList, ShieldCheck, User
} from 'lucide-react';
import { SYSTEM_CONFIG, I18N } from '../constants';
import { TabType, Language, AuthUser } from '../types/types';

interface SidebarProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    isSidebarOpen: boolean;
    closeSidebar: () => void;
    currentUser: AuthUser | null;
    language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    isSidebarOpen,
    closeSidebar,
    currentUser,
    language
}) => {
    const t = I18N[language];

    const menuItems = [
        { id: 'stats', label: t.dashboard, icon: LayoutDashboard },
        { id: 'jose', label: t.jose, icon: Bot },
        { id: 'history', label: "Bio-Archives", icon: ClipboardList },
        { id: 'academy', label: t.academy, icon: GraduationCap },
        { id: 'social', label: t.social, icon: Share2 },
        { id: 'finance', label: t.finance, icon: Wallet },
        { id: 'profile', label: "Mon Profil", icon: User },
        { id: 'links', label: "Générateur de Liens", icon: Layers },
        ...(currentUser?.role === 'ADMIN' ? [{ id: 'admin', label: t.admin, icon: Settings }] : []),
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar Content */}
            <aside className={`fixed inset-y-0 left-0 w-80 bg-slate-950/90 backdrop-blur-3xl z-50 transition-transform duration-300 lg:translate-x-0 lg:static border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-900 border border-[#00d4ff]/40 shadow-[0_0_30px_rgba(0,212,255,0.4)]">
                            <Layers size={28} className="text-[#00d4ff]" />
                        </div>
                        <div>
                            <h1 className="font-black text-lg tracking-tighter italic uppercase">{SYSTEM_CONFIG.brand}</h1>
                            <p className="text-[10px] text-[#00d4ff] font-black tracking-[0.3em] uppercase mt-1 italic">V{SYSTEM_CONFIG.version}</p>
                        </div>
                    </div>

                    <nav className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id as TabType);
                                    closeSidebar();
                                }}
                                className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-[14px] font-black transition-all italic uppercase tracking-tight ${activeTab === item.id ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 shadow-2xl' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
                            >
                                <item.icon size={20} /> {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-4">Network Compliance</p>
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase">SAB & Clinical Ready</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
