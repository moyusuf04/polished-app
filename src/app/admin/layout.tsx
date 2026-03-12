import { requireAdmin } from '@/lib/utils/admin-guard';
import Link from 'next/link';
import { LayoutDashboard, Tag, BookOpen, GitBranch, ArrowLeft } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Lessons', href: '/admin/lessons', icon: BookOpen },
  { label: 'Skill Tree', href: '/admin/skill-tree', icon: GitBranch },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-black font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black/40 backdrop-blur-md border-r border-white/5 flex flex-col shrink-0 relative">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="p-8 pb-12">
          <Link href="/admin" className="block">
            <h1 className="text-xl font-outfit text-white tracking-widest uppercase">
              Polished<span className="text-white/20">.</span>
            </h1>
            <p className="text-[9px] tracking-[0.3em] font-bold text-white/20 uppercase mt-2 font-outfit">Internal Console</p>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="px-4 text-[9px] tracking-[0.2em] font-bold text-white/10 uppercase mb-4 font-outfit">Management</p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-widest uppercase text-white/40 hover:text-white hover:bg-white/[0.03] transition-all rounded-sm group font-outfit"
            >
              <item.icon className="w-4 h-4 text-white/10 group-hover:text-[#52B788] transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Link
            href="/hub"
            className="flex items-center gap-3 px-4 py-4 text-[10px] font-bold tracking-widest uppercase text-white/20 hover:text-white transition-all group font-outfit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#52B788]/40" />
            Exit to Hub
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black">
        <div className="max-w-6xl mx-auto p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
