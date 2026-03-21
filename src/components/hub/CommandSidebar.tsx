'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShieldHalf, LogOut } from 'lucide-react';
import { MINERALS } from '@/lib/design-tokens';
import type { CategoryData } from '@/components/PodHub';
import Link from 'next/link';

interface Props {
  categories: CategoryData[];
  visibleCategories: Record<string, boolean>;
  onToggleCategory: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onSignOut: () => void;
}

/** Map category name → mineral colour. */
function getCategoryColor(name: string): string {
  const map: Record<string, string> = {
    'Etiquette & Presence': MINERALS.malachite.light,
    'Strategic Communication': MINERALS.lapis.light,
    'Financial Acumen': MINERALS.tigersEye.light,
    'Leadership & Influence': MINERALS.amethyst.light,
    'Executive Presence': MINERALS.obsidian.light,
    'Emotional Intelligence': MINERALS.roseQuartz.light,
  };
  return map[name] ?? '#888';
}

export function CommandSidebar({
  categories,
  visibleCategories,
  onToggleCategory,
  isOpen,
  onClose,
  isAdmin,
  onSignOut,
}: Props) {
  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">
          Tracks
        </h2>
      </div>

      {/* Category toggles */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {categories.map((cat) => {
          const isVisible = visibleCategories[cat.id] ?? true;
          const color = getCategoryColor(cat.name);

          return (
            <button
              key={cat.id}
              onClick={() => onToggleCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-all group ${
                isVisible
                  ? 'bg-white/[0.04] text-white/80'
                  : 'text-white/20 hover:text-white/40 hover:bg-white/[0.02]'
              }`}
            >
              {/* Mineral colour dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0 transition-opacity"
                style={{
                  backgroundColor: color,
                  opacity: isVisible ? 1 : 0.25,
                }}
              />
              <span className="text-[11px] font-medium tracking-wide truncate">
                {cat.name}
              </span>
              {/* Toggle indicator */}
              <div className={`ml-auto w-6 h-3.5 rounded-full transition-colors ${
                isVisible ? 'bg-white/20' : 'bg-white/5'
              }`}>
                <motion.div
                  className="w-3 h-3 rounded-full bg-white/80 mt-[1px]"
                  animate={{ x: isVisible ? 11 : 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="border-t border-white/5 p-3 space-y-1">
        <Link
          href="/account"
          className="flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-white/70 hover:bg-white/[0.03] rounded-sm transition-all text-[11px] font-medium tracking-wide"
        >
          <User className="w-4 h-4" />
          Account
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-cyan-400/70 hover:bg-white/[0.03] rounded-sm transition-all text-[11px] font-medium tracking-wide"
          >
            <ShieldHalf className="w-4 h-4" />
            Admin Hub
          </Link>
        )}

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-rose-400/70 hover:bg-white/[0.03] rounded-sm transition-all text-[11px] font-medium tracking-wide"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: persistent sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#0a0a0c]/80 border-r border-white/5 backdrop-blur-xl h-full overflow-hidden shrink-0">
        {content}
      </aside>

      {/* Mobile: slide-in drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: -260, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x < -100) onClose();
              }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-[#0a0a0c]/95 border-r border-white/10 backdrop-blur-2xl z-50 md:hidden shadow-2xl"
            >
              {/* Close handle */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={onClose}
                  className="p-2 text-white/30 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Drag handle indicator */}
              <div className="absolute top-1/2 right-2 -translate-y-1/2 w-1 h-8 bg-white/10 rounded-full" />
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
