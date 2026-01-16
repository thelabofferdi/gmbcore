
import React, { useState, useEffect } from 'react';
import { DiagnosticReport } from '../types/types';
import { 
  FileText, Calendar, ChevronRight, Search, FlaskConical, 
  Activity, AlertTriangle, CheckCircle, Trash2, Volume2, 
  Square, Clock, Filter, Eye, X, Download, Loader2, HeartPulse
} from 'lucide-react';
import { generateJoseAudio, decodeBase64, decodeAudioData } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { jsPDF } from 'jspdf';
import { SYSTEM_CONFIG } from '../constants';

export const DiagnosticHistory: React.FC = () => {
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const activeSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  const loadReports = async () => {
    setIsLoadingReports(true);
    try {
      const data = await storageService.getAllReports();
      setReports(data);
    } catch (e) {
      console.error("Failed to load bio-log", e);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const deleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette archive définitivement ?")) return;
    try {
      await storageService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
    } catch (e) {
      console.error("Delete error", e);
    }
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.fullContent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const playReport = async (text: string) => {
    if (isSpeaking) { stopAudio(); return; }
    setIsSpeaking(true);
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
      source.onended = () => setIsSpeaking(false);
    } else {
      setIsSpeaking(false);
    }
  };

  const handleExportPDF = async (report: DiagnosticReport) => {
    if (isExporting) return;
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = 30;

      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(0, 212, 255); 
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text(SYSTEM_CONFIG.brand, margin, 25);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("BIO-SYNC DIAGNOSTIC TERMINAL v5.5", margin, 32);

      y = 60;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.text(report.title.toUpperCase(), margin, y);
      
      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Date d'analyse : ${report.date.toLocaleDateString()} ${report.date.toLocaleTimeString()}`, margin, y);
      doc.text(`Statut : ${report.status}`, margin + 100, y);
      
      y += 5;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, 190, y);
      
      y += 15;
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); 
      
      const splitText = doc.splitTextToSize(report.fullContent, 170);
      doc.text(splitText, margin, y);
      
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Document généré par Coach JOSÉ AI - ${SYSTEM_CONFIG.brand} Leadership Hub`, margin, 285);
        doc.text(`Page ${i} sur ${pageCount}`, 170, 285);
      }

      doc.save(`${report.title.replace(/\s+/g, '_')}_${report.date.getTime()}.pdf`);
    } catch (error) {
      console.error("Erreur export PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Bio-Log Archive</h2>
          <p className="text-slate-500 font-medium text-xl mt-4 max-w-xl italic">
            Chronologie de votre restauration cellulaire via IndexedDB. Chaque donnée est un pas vers l'empire Diamond.
          </p>
        </div>
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/10 flex items-center gap-4 w-full md:w-80 shadow-2xl">
          <Search size={18} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher un diagnostic..." 
            className="bg-transparent border-none text-[10px] outline-none w-full font-black text-white uppercase tracking-widest placeholder:text-slate-700" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      {isLoadingReports ? (
        <div className="py-32 text-center">
          <Loader2 className="animate-spin text-[#00d4ff] mx-auto mb-4" size={48} />
          <p className="text-[#00d4ff] font-black uppercase tracking-widest text-xs">Accès à la base de données biologique...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-slate-950/40 backdrop-blur-3xl rounded-[4rem] border border-white/5 p-24 text-center space-y-8">
           <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-700 border border-white/5">
              <Clock size={48} />
           </div>
           <div className="space-y-4">
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Archive Vierge</h3>
              <p className="text-slate-500 max-w-md mx-auto italic font-medium">Vos diagnostics médicaux générés par Coach José apparaîtront ici automatiquement.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Historique Chronologique</p>
            {filteredReports.map((report) => (
              <button 
                key={report.id}
                onClick={() => { setSelectedReport(report); stopAudio(); }}
                className={`w-full text-left p-6 rounded-[2.5rem] border transition-all group relative overflow-hidden ${selectedReport?.id === report.id ? 'bg-[#00d4ff] text-slate-950 border-[#00d4ff] shadow-3xl' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${selectedReport?.id === report.id ? 'bg-slate-950/20' : 'bg-white/5'}`}>
                    {report.type === 'BLOOD_WORK' ? <FlaskConical size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${report.status === 'ALERT' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'}`}>
                      {report.status}
                    </span>
                    <button onClick={(e) => deleteReport(report.id, e)} className={`p-2 rounded-lg hover:bg-rose-500 hover:text-white transition-all ${selectedReport?.id === report.id ? 'text-slate-900' : 'text-slate-600'}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="font-black text-xs uppercase tracking-tight leading-tight mb-2 truncate">{report.title}</h4>
                <div className="flex items-center gap-2 text-[9px] font-black opacity-60 uppercase tracking-widest">
                  <Calendar size={12} /> {report.date.toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-12 md:p-16 relative overflow-hidden group shadow-3xl animate-in slide-in-from-right duration-500">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00d4ff]/10 rounded-full blur-[80px]"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${selectedReport.status === 'ALERT' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           {selectedReport.type === 'BLOOD_WORK' ? <FlaskConical size={32} /> : <FileText size={32} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Rapport de Diagnostic</p>
                          <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{selectedReport.title}</h3>
                        </div>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-4">
                     <button 
                      onClick={() => playReport(selectedReport.fullContent)}
                      className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${isSpeaking ? 'bg-[#00d4ff] text-slate-950 animate-pulse shadow-3xl' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                     >
                       {isSpeaking ? <Square size={16} /> : <Volume2 size={16} />} 
                       {isSpeaking ? "Arrêter la lecture" : "Synthèse Vocale José"}
                     </button>
                     
                     <button 
                      onClick={() => handleExportPDF(selectedReport)}
                      disabled={isExporting}
                      className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                     >
                       {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                       Exporter en PDF
                     </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="md:col-span-2 space-y-8">
                      {selectedReport.clinicalData && (
                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-[#00d4ff]/20 grid grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest flex items-center gap-2"><HeartPulse size={14}/> Biométrie</h5>
                              <div className="grid grid-cols-1 gap-2">
                                 <div className="flex justify-between text-xs"><span className="text-slate-500">Glycémie:</span> <span className="text-white font-bold">{selectedReport.clinicalData.biomarkers.glycemia_mmol_l ?? '--'} mmol/L</span></div>
                                 <div className="flex justify-between text-xs"><span className="text-slate-500">Cholestérol:</span> <span className="text-white font-bold">{selectedReport.clinicalData.biomarkers.cholesterol_total_mmol_l ?? '--'} mmol/L</span></div>
                                 <div className="flex justify-between text-xs"><span className="text-slate-500">IMC:</span> <span className="text-white font-bold">{selectedReport.clinicalData.biomarkers.bmi ?? '--'}</span></div>
                              </div>
                           </div>
                           <div className="space-y-4 border-l border-white/5 pl-6">
                              <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Protocoles</h5>
                              <div className="space-y-2">
                                 {selectedReport.clinicalData.protocol.map((p, i) => (
                                    <div key={i} className="text-[10px] bg-slate-800 p-2 rounded-lg">
                                       <span className="text-white font-bold">{p.product}</span> <br/>
                                       <span className="text-slate-400">{p.dosage} - {p.duration_days}j</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      )}

                      <div className="p-10 bg-slate-950/60 border border-white/5 rounded-[3rem] prose prose-invert max-w-none shadow-inner">
                         <p className="text-slate-300 text-lg leading-relaxed font-medium whitespace-pre-line italic">
                            {selectedReport.fullContent}
                         </p>
                      </div>
                   </div>
                   <div className="space-y-8">
                      {selectedReport.image && (
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document Source</p>
                           <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative group cursor-zoom-in">
                              <img src={selectedReport.image} alt="Source" className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                 <Eye size={32} className="text-white" />
                              </div>
                           </div>
                        </div>
                      )}
                      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4 shadow-xl">
                         <h5 className="flex items-center gap-3 text-amber-400 font-black uppercase text-[10px] tracking-widest">
                           <AlertTriangle size={14} /> Rappel Bio-Sync
                         </h5>
                         <p className="text-[11px] text-slate-400 italic leading-relaxed">
                           Ce rapport est une archive de l'IA José. Utilisez ces données pour suivre vos progrès avec votre médecin traitant.
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white/5 border border-dashed border-white/10 rounded-[4rem] flex flex-col items-center justify-center p-20 text-center opacity-40">
                 <FileText size={80} className="mb-6 text-slate-700" />
                 <p className="text-xl font-black text-slate-700 uppercase italic tracking-widest">Sélectionnez une archive pour l'analyser</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
