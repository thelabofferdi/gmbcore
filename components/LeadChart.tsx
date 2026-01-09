
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLeadChartData, LeadData } from '../services/statsService';

interface LeadChartProps {
  userId?: string;
}

export const LeadChart: React.FC<LeadChartProps> = ({ userId }) => {
  const [data, setData] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      const chartData = await getLeadChartData(userId);
      setData(chartData);
      setLoading(false);
    };

    fetchData();
  }, [userId]);
  return (
    <div className="h-80 w-full bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 flex flex-col min-w-0 shadow-2xl relative overflow-hidden group">
      {/* Glow décoratif Stark */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00d4ff]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#00d4ff]/20 transition-all duration-1000"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-[10px] font-black text-[#00d4ff] uppercase tracking-[0.3em] italic mb-1">Analyse Bio-Sync</h3>
          <p className="text-xl font-black text-white tracking-tight uppercase italic">Flux de Conversion</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clicks</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leads</span>
           </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400 text-sm">Chargement des données...</div>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0 relative">
          <div className="absolute inset-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fill: '#64748b', fontWeight: 800}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a',
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    padding: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#00d4ff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#00d4ff" 
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                  strokeWidth={2} 
                  animationDuration={1500}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#00d4ff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                  strokeWidth={3} 
                  animationDuration={2000}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
