"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { format, startOfDay, startOfWeek, startOfMonth, parseISO, isSameDay } from "date-fns";
import { th } from "date-fns/locale";

export default function DashboardCharts({ 
  statusData, 
  programData,
  programComparisonData,
  trendDates = [], // array of ISO strings or Date objects
  currentProgramId,
  currentStatus,
  basePath = "/admin"
}: { 
  statusData: any[], 
  programData: any[],
  programComparisonData?: any[],
  trendDates?: any[],
  currentProgramId?: string,
  currentStatus?: string,
  basePath?: string
}) {
  const router = useRouter();
  const [timeScale, setTimeScale] = useState<'day' | 'week' | 'month'>('day');
  
  const COLORS = ["#eab308", "#f97316", "#22c55e", "#1e40af", "#ef4444"]; // Match status colors

  const onPieClick = (data: any) => {
    if (data && data.status) {
      router.push(`${basePath}?status=${data.status}${currentProgramId ? `&programId=${currentProgramId}` : ''}`);
    }
  };

  const onBarClick = (data: any) => {
    if (data && data.id) {
      router.push(`${basePath}?programId=${data.id}${currentStatus ? `&status=${currentStatus}` : ''}`);
    }
  };

  // Top 3 Recommended Programs (Most applicants)
  const topPrograms = useMemo(() => {
    return [...programData]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [programData]);

  // Aggregate Trend Data
  const aggregatedTrend = useMemo(() => {
    if (!trendDates || trendDates.length === 0) return [];
    
    const counts: Record<string, number> = {};
    
    trendDates.forEach(d => {
      const dateObj = typeof d === 'string' ? parseISO(d) : new Date(d);
      let key = "";
      
      if (timeScale === 'day') {
        key = format(startOfDay(dateObj), 'yyyy-MM-dd');
      } else if (timeScale === 'week') {
        key = format(startOfWeek(dateObj, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      } else if (timeScale === 'month') {
        key = format(startOfMonth(dateObj), 'yyyy-MM-dd');
      }
      
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.keys(counts).sort().map(key => {
      const dateObj = parseISO(key);
      let displayLabel = "";
      if (timeScale === 'day') displayLabel = format(dateObj, 'd MMM yy', { locale: th });
      else if (timeScale === 'week') displayLabel = `สัปดาห์ ${format(dateObj, 'd MMM yy', { locale: th })}`;
      else if (timeScale === 'month') displayLabel = format(dateObj, 'MMM yy', { locale: th });
      
      return {
        date: key,
        displayLabel,
        count: counts[key]
      };
    });
  }, [trendDates, timeScale]);

  return (
    <div className="space-y-6">
      
      {/* Top Section: Trends & Recommended Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">กราฟแนวโน้มการสมัคร</h3>
            <div className="flex gap-2">
              <button onClick={() => setTimeScale('day')} className={`px-3 py-1 text-xs rounded-full border transition-colors ${timeScale === 'day' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>รายวัน</button>
              <button onClick={() => setTimeScale('week')} className={`px-3 py-1 text-xs rounded-full border transition-colors ${timeScale === 'week' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>สัปดาห์</button>
              <button onClick={() => setTimeScale('month')} className={`px-3 py-1 text-xs rounded-full border transition-colors ${timeScale === 'month' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>เดือน</button>
            </div>
          </div>
          <div className="w-full h-[280px] mt-auto">
            {aggregatedTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aggregatedTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="displayLabel" tick={{fontSize: 11, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} คน`, "ผู้สมัครใหม่"]}
                    labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีข้อมูลในช่วงเวลานี้</div>
            )}
          </div>
        </div>

        {/* Top Recommended Programs */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-4">สาขาวิชายอดฮิต (แนะนำ)</h3>
          <div className="space-y-4 flex-1">
            {topPrograms.map((program, idx) => (
              <div key={program.id} className="relative p-4 rounded-lg border bg-gradient-to-r from-blue-50/50 to-transparent hover:border-blue-300 transition-colors cursor-pointer" onClick={() => onBarClick(program)}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                      {idx + 1}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{program.name}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div className="text-xs text-gray-500">จำนวนผู้สมัคร</div>
                  <div className="text-xl font-bold text-blue-600">{program.value} <span className="text-sm font-normal text-gray-500">คน</span></div>
                </div>
              </div>
            ))}
            {topPrograms.length === 0 && (
              <div className="text-gray-400 text-center py-8">ไม่มีข้อมูลผู้สมัคร</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4 w-full text-left">สัดส่วนสถานะการรับสมัคร</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60} // Donut style looks more modern
                  fill="#8884d8"
                  dataKey="value"
                  onClick={onPieClick}
                  className="cursor-pointer"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} คน`, "จำนวน"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Bar Chart (Comparison if available) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center xl:col-span-1">
          <h3 className="text-lg font-bold mb-4 w-full text-left">เปรียบเทียบจำนวนผู้สมัครและผู้ชำระเงินแล้ว</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {programComparisonData ? (
                <BarChart
                  data={programComparisonData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#f3f4f6'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar 
                    name="จำนวนผู้สมัครทั้งหมด"
                    dataKey="total" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    onClick={onBarClick}
                    className="cursor-pointer"
                  />
                  <Bar 
                    name="ชำระเงินแล้ว"
                    dataKey="paid" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]} 
                    onClick={onBarClick}
                    className="cursor-pointer"
                  />
                </BarChart>
              ) : (
                <BarChart
                  data={programData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#f3f4f6'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} คน`, "ผู้สมัคร"]} 
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    onClick={onBarClick}
                    className="cursor-pointer"
                    barSize={40}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
