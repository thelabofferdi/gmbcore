
import React, { useState, useEffect, useRef } from 'react';
import { SYSTEM_CONFIG } from '../constants';
import { Lesson, AcademyModule, Message, Resource } from '../types';
import { voiceService } from '../services/voiceService';
import { generateJoseResponseStream } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { 
  BookOpen, ChevronRight, PlayCircle, Search, Lock, 
  Rocket, Sparkles, FileText, Info, Download, Volume2, Loader2, 
  Square, X, BrainCircuit, Target, Users, Globe, Trophy, ArrowRight,
  CheckCircle2, ArrowLeft, Book, HelpCircle, Lightbulb, Play,
  ChevronLeft, Bot, User, Send, GraduationCap, Award, Star, BookMarked
} from 'lucide-react';

export const AcademyView: React.FC<{ isLevel2Unlocked?: boolean }> = ({ isLevel2Unlocked = false }) => {
  const [activeView, setActiveView] = useState<'curriculum' | 'resources' | 'mentor'>('curriculum');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  // Interactive Professor State
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [professorMessages, setProfessorMessages] = useState<Message[]>([]);
  const [isProfessorLoading, setIsProfessorLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [activeSpeechKey, setActiveSpeechKey] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubVoice = voiceService.subscribe((isSpeaking, key) => {
      setActiveSpeechKey(isSpeaking ? key : null);
    });
    return () => unsubVoice();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [professorMessages]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isReading, setIsReading] = useState(false);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const activeSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  const allModules = useMemo(() => [
    ...SYSTEM_CONFIG.academy.modules.map(m => ({ ...m, isPremium: false })),
    ...SYSTEM_CONFIG.academy.premiumModules.map(m => ({ ...m, isPremium: true }))
  ], []);

  const currentModule = allModules[selectedModuleIdx];

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }
    setIsReading(false);
  };

  const handleReadLesson = async (text: string) => {
    if (isReading) { stopAudio(); return; }
    setIsReading(true);
    try {
      const base64 = await generateJoseAudio(`Formation Leadership Stark. ${text}`);
      if (base64) {
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const ctx = audioContextRef.current;
        const decoded = decodeBase64(base64);
        const audioBuffer = await decodeAudioData(decoded, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        activeSourceRef.current = source;
        source.start();
        source.onended = () => { if (activeSourceRef.current === source) { setIsReading(false); activeSourceRef.current = null; } };
      }
    } catch (e) { stopAudio(); }
  };

  const getModuleIcon = (id: string) => {
    switch(id) {
      case 'm1': return <BrainCircuit className="text-[#00d4ff]" />;
      case 'm2': return <Target className="text-emerald-400" />;
      case 'm3': return <Globe className="text-purple-400" />;
      case 'm4': return <Trophy className="text-amber-400" />;
      default: return <BookOpen />;
    }
  };

  if (selectedLesson) {
    return (
      <div className="animate-in slide-in-from-right duration-500 max-w-5xl mx-auto">
        <button 
          onClick={() => { setSelectedLesson(null); stopAudio(); }}
          className="mb-8 flex items-center gap-3 text-slate-400 hover:text-white transition-all uppercase text-[10px] font-black tracking-widest"
        >
          <ArrowLeft size={16} /> Retour au Curriculum
        </button>

        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl">
          <div className="p-12 border-b border-white/5 bg-gradient-to-r from-[#00d4ff]/10 to-transparent flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full inline-block">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{currentModule.title}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedLesson.title}</h2>
            </div>
            <button 
              onClick={() => handleReadLesson(selectedLesson.content)}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${isReading ? 'bg-[#00d4ff] text-slate-950 animate-pulse' : 'bg-white text-slate-950 hover:scale-110'}`}
            >
              {isReading ? <Square size={32} /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="lg:col-span-2 p-12 space-y-10 border-r border-white/5">
               <div className="prose prose-invert max-w-none">
                  <p className="text-xl text-slate-300 leading-relaxed font-medium whitespace-pre-line italic">
                    {selectedLesson.content}
                  </p>
               </div>
               
               <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6">
                  <h4 className="flex items-center gap-3 text-emerald-400 font-black uppercase text-xs tracking-widest">
                    <Target size={18} /> Exercice Pratique Stark
                  </h4>
                  <p className="text-slate-200 italic font-medium">{selectedLesson.practicalExercise}</p>
               </div>
            </div>

            <div className="p-12 bg-slate-950/40 space-y-10">
               <div className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[#00d4ff] font-black uppercase text-xs tracking-widest">
                    <Sparkles size={18} /> Stark Insight
                  </h4>
                  <div className="p-6 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-2xl relative overflow-hidden group">
                    <QuoteIcon className="absolute -top-4 -right-4 w-16 h-16 opacity-10 text-[#00d4ff]" />
                    <p className="text-xs font-bold text-slate-200 italic leading-relaxed relative z-10">
                      "{selectedLesson.starkInsight}"
                    </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="flex items-center gap-3 text-amber-400 font-black uppercase text-xs tracking-widest">
                    <HelpCircle size={18} /> Validation
                  </h4>
                  <button className="w-full py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all italic">
                    Lancer le Quiz
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-between">
           <button className="flex items-center gap-3 text-slate-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest opacity-30 cursor-not-allowed">
              <ChevronLeft size={16} /> Leçon Précédente
           </button>
           <button className="flex items-center gap-3 text-white hover:text-[#00d4ff] transition-all font-black text-[10px] uppercase tracking-widest">
              Leçon Suivante <ChevronRight size={16} />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Stark Academy</h2>
          <p className="text-slate-500 font-medium text-xl mt-4 max-w-xl italic">
            Transformez-vous en Architecte de Réseau. Forgez votre leadership avec les protocoles de Coach José.
          </p>
        </div>
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/10 flex items-center gap-4 w-full md:w-80">
          <Search size={18} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher une leçon..." 
            className="bg-transparent border-none text-[10px] outline-none w-full font-black text-white uppercase tracking-widest placeholder:text-slate-700" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Modules de Maîtrise</p>
          {allModules.map((mod, idx) => {
            const isLocked = mod.isPremium && !isLevel2Unlocked;
            const isSelected = selectedModuleIdx === idx;
            return (
              <button 
                key={mod.id} 
                onClick={() => { setSelectedModuleIdx(idx); setSelectedLesson(null); }}
                disabled={isLocked}
                className={`w-full text-left p-6 rounded-[2.5rem] border transition-all relative group overflow-hidden ${isSelected ? 'bg-white text-slate-950 border-white shadow-2xl' : isLocked ? 'bg-slate-950/20 border-white/5 opacity-40' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${isSelected ? 'bg-slate-950 text-white' : 'bg-white/5 text-white'}`}>
                    {getModuleIcon(mod.id)}
                  </div>
                  {isLocked && <Lock size={16} className="text-slate-600" />}
                </div>
                <h3 className="font-black text-xs uppercase tracking-tighter leading-tight">{mod.title}</h3>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3 space-y-8">
           <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-12 md:p-16 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00d4ff]/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
              
              <div className="mb-12">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#00d4ff]/10 rounded-full border border-[#00d4ff]/20 text-[10px] font-black text-[#00d4ff] uppercase tracking-widest mb-6">
                    <Book size={14} /> Curriculum du Module
                 </div>
                 <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">{currentModule.title}</h3>
                 <p className="text-slate-500 mt-4 italic font-medium">{currentModule.description}</p>
              </div>

              <div className="space-y-4">
                {currentModule.lessons.map((lesson, i) => (
                  <div 
                    key={lesson.id} 
                    onClick={() => setSelectedLesson(lesson)}
                    className="flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[2.5rem] group/item hover:bg-white hover:border-white transition-all cursor-pointer shadow-xl"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-950 text-[#00d4ff] flex items-center justify-center text-sm font-black group-hover/item:bg-[#00d4ff] group-hover/item:text-slate-950 transition-all border border-white/10 shadow-inner italic">
                        {i + 1 < 10 ? `0${i + 1}` : i + 1}
                      </div>
                      <span className="text-xl font-bold text-slate-300 group-hover/item:text-slate-950 transition-colors italic">{lesson.title}</span>
                    </div>
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 group-hover/item:bg-slate-950 group-hover/item:text-[#00d4ff] transition-all">
                       <ChevronRight size={24} />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L21.017 3V15C21.017 18.3137 18.3307 21 15.017 21H14.017ZM3.01697 21L3.01697 18C3.01697 16.8954 3.9124 16 5.01697 16H8.01697C8.56925 16 9.01697 15.5523 9.01697 15V9C9.01697 8.44772 8.56925 8 8.01697 8H5.01697C3.9124 8 3.01697 7.10457 3.01697 6V3L10.017 3V15C10.017 18.3137 7.33067 21 4.01697 21H3.01697Z" />
  </svg>
);
