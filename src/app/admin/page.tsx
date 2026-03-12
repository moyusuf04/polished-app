import { createClient } from '@/lib/supabase/server';
import { Tag, BookOpen, CheckCircle, FileEdit, Zap, Activity } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [categoriesRes, lessonsRes, publishedRes, draftRes, recentLogsRes, weeklyRes] = await Promise.all([
    supabase.from('categories').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('lessons').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('status', 'published').is('deleted_at', null),
    supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('status', 'draft').is('deleted_at', null),
    supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('lessons').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .is('deleted_at', null),
  ]);

  const totalCategories = categoriesRes.count ?? 0;
  const totalLessons = lessonsRes.count ?? 0;
  const publishedLessons = publishedRes.count ?? 0;
  const draftLessons = draftRes.count ?? 0;
  const weeklyLessons = weeklyRes.count ?? 0;
  const recentLogs = recentLogsRes.data ?? [];

  const kpis = [
    { label: 'Categories', value: totalCategories, icon: Tag, color: '#52B788' },
    { label: 'Total Lessons', value: totalLessons, icon: BookOpen, color: '#4A90D9' },
    { label: 'Published', value: publishedLessons, icon: CheckCircle, color: '#9B72CF' },
    { label: 'Drafts', value: draftLessons, icon: FileEdit, color: '#6B6B7A' },
    { label: 'New This Week', value: weeklyLessons, icon: Zap, color: '#D4A017' },
  ];

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-serif text-white mb-2 tracking-tight">Console Overview</h1>
        <p className="text-white/30 text-xs tracking-widest uppercase font-medium font-outfit">System Health & Content Metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-16">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#0d0d10] border border-white/5 p-6 flex flex-col items-start relative overflow-hidden group hover:border-white/10 transition-colors shadow-2xl"
          >
             <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${kpi.color}44, transparent)` }} />
            
            <kpi.icon className="w-5 h-5 mb-6 text-white/10 group-hover:scale-110 transition-transform" style={{ color: `${kpi.color}44` }} />
            <p className="text-3xl font-serif text-white tracking-tight">{kpi.value}</p>
            <p className="text-[10px] text-white/20 tracking-[0.2em] font-bold uppercase mt-3">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <div className="max-w-4xl">
        <h2 className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
          <Activity className="w-4 h-4" />
          Recent Activity
        </h2>
        
        {recentLogs.length === 0 ? (
          <div className="p-12 border border-white/5 border-dashed flex items-center justify-center">
            <p className="text-white/10 text-xs tracking-widest uppercase font-bold">No activity logs recorded</p>
          </div>
        ) : (
          <div className="border border-white/5 divide-y divide-white/5">
            {recentLogs.map((log: Record<string, unknown>) => (
              <div key={log.id as string} className="flex items-center gap-6 px-6 py-5 bg-[#0d0d10] hover:bg-white/[0.02] transition-colors group">
                <div className="w-10 h-10 bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 group-hover:border-white/20 transition-colors">
                  {(log.action as string)?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 tracking-wide leading-relaxed">
                    <span className="font-bold text-white uppercase text-[10px] tracking-widest mr-2">{log.action as string}</span>
                    <span className="text-white/30">on</span>
                    <span className="mx-2 text-white/50">{log.entity_type as string}</span>
                    {log.entity_id ? <span className="text-white/20 font-mono text-[10px]">#{(log.entity_id as string).slice(0, 8)}</span> : ''}
                  </p>
                  <p className="text-[10px] text-white/20 tracking-widest uppercase mt-1">
                    {new Date(log.created_at as string).toLocaleTimeString()} · {new Date(log.created_at as string).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
