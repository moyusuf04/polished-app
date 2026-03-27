'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

// ── Bento Card wrapper with engraved gold-to-charcoal border ──
function BentoCard({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`engraved-border rounded-xl bg-white/[0.02] backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ── Liquid-fill Energy Card ──
function EnergyCard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative h-full flex flex-col p-6">
      <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">
        Focus Reserve
      </p>
      <p className="font-serif text-xl text-white/90 mb-1">
        Learning Battery
      </p>
      <p className="text-xs text-white/40 leading-relaxed mb-6">
        A daily energy system that makes every lesson count. When the battery runs dry, the knowledge locks – fueling intentional study.
      </p>

      {/* Battery visual */}
      <div className="mt-auto relative">
        <div className="liquid-fill-container h-28 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className={`liquid-fill ${isInView ? 'animate' : ''}`} />
          {/* Energy units */}
          <div className="absolute inset-0 flex items-end justify-center pb-3 z-10">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full border border-emerald-400/40"
                  style={{
                    background: i <= 2
                      ? 'radial-gradient(circle, rgba(82,183,136,0.6), rgba(82,183,136,0.2))'
                      : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-white/30 mt-2 tracking-widest uppercase">
          2 / 3 Units
        </p>
      </div>
    </div>
  );
}

// ── Mineral Tier Card with Glint Shader ──
function MineralTierCard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const tiers = [
    { label: 'Quartz', color: '#C4B5A0', xp: '0 XP' },
    { label: 'Emerald', color: '#52B788', xp: '1,000 XP' },
    { label: 'Diamond', color: '#B9D6F2', xp: '5,000 XP' },
  ];

  return (
    <div ref={ref} className={`glint-shader h-full flex flex-col p-6 ${isInView ? 'animate' : ''}`}>
      <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">
        Progression
      </p>
      <p className="font-serif text-xl text-white/90 mb-1">
        Mineral Tiers
      </p>
      <p className="text-xs text-white/40 leading-relaxed mb-8">
        Your rank evolves as you learn. From raw Quartz to the clarity of Diamond – each tier earned through consistent engagement.
      </p>

      {/* Tier visualization */}
      <div className="mt-auto flex flex-col gap-4">
        {tiers.map((tier, i) => (
          <div key={tier.label} className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-8 h-8 rounded-full flex-shrink-0"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${tier.color}, ${tier.color}44)`,
                boxShadow: `0 0 12px ${tier.color}33`,
              }}
            />
            <div className="flex-1">
              <p className="text-sm text-white/80 font-medium">{tier.label}</p>
              <p className="text-[10px] text-white/30 tracking-wider">{tier.xp}</p>
            </div>
            {/* Connecting line (except last) */}
            {i < tiers.length - 1 && (
              <div className="absolute left-[39px] mt-12 w-px h-4 bg-gradient-to-b from-white/10 to-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Interactive Reader Preview Card ──
function ReaderPreviewCard() {
  return (
    <div className="h-full flex flex-col p-6">
      <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">
        Experience
      </p>
      <p className="font-serif text-xl text-white/90 mb-1">
        Interactive Reader
      </p>
      <p className="text-xs text-white/40 leading-relaxed mb-6">
        Immersive lessons with curated content designed to build conversational fluency across culture, history, and modern thought.
      </p>

      {/* Reader preview mockup */}
      <div className="mt-auto relative rounded-lg bg-white/[0.03] border border-white/[0.06] p-5 overflow-hidden">
        {/* Dropped cap */}
        <div className="flex gap-3">
          <span className="font-serif text-4xl text-white/60 leading-none float-left select-none">
            T
          </span>
          <p className="text-xs text-white/35 leading-relaxed">
            he Renaissance was not merely an artistic movement – it was a complete reimagining of what it meant to be human…
          </p>
        </div>


      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Landing Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleGuestSignIn = async () => {
    setIsGuestLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      router.push('/hub');
    } catch (err) {
      console.error("Guest Sign In Failed:", err);
      setIsGuestLoading(false);
    }
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
  } as const;

  return (
    <main className="midnight-umber min-h-screen relative overflow-hidden">
      {/* Linen Canvas texture overlay */}
      <div className="linen-canvas" />

      {/* ═══════ HERO: The Celestial Foyer ═══════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          className="text-center max-w-lg mx-auto w-full"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.15 }}
        >
          {/* Main headline – Blur-In Reveal */}
          <h1
            className="blur-in-reveal text-6xl md:text-8xl font-serif text-white mb-6 tracking-tight drop-shadow-sm shimmer-text"
          >
            Polished.
          </h1>

          <motion.p
            variants={heroItemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
            className="text-white/40 text-lg md:text-xl font-sans font-light tracking-wide mb-14"
          >
            Conversational breadth for the ambitious.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={heroItemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full px-2 mb-10"
          >
            <Link
              href="/signup"
              className="w-full sm:w-1/2 flex items-center justify-center py-4 px-8 bg-white text-black text-xs font-bold tracking-widest uppercase rounded-sm shadow-xl shadow-white/5 border-b-4 border-zinc-300 active:translate-y-px active:border-b-0 hover:brightness-95 transition-all"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-1/2 flex items-center justify-center py-4 px-8 bg-transparent text-white/60 border border-white/10 text-xs font-bold tracking-widest uppercase rounded-sm hover:border-white/30 hover:text-white transition-all active:translate-y-px"
            >
              Log In
            </Link>
          </motion.div>

          {/* Try as Guest – Glassmorphic treatment */}
          <motion.div
            variants={heroItemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.15 }}
          >
            <button
              onClick={handleGuestSignIn}
              disabled={isGuestLoading}
              className="mx-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15 font-medium text-[10px] tracking-[0.2em] uppercase transition-all"
            >
              {isGuestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Try as Guest"}
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══════ BENTO: Renaissance Feature Gallery ═══════ */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center text-[10px] tracking-[0.3em] uppercase text-white/25 mb-12"
        >
          What Awaits Inside
        </motion.p>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">
          {/* Card 1: Learning Battery – Square */}
          <BentoCard className="md:col-span-1 min-h-[320px]" delay={0}>
            <EnergyCard />
          </BentoCard>

          {/* Card 2: Mineral Tier – Tall, spans 2 rows */}
          <BentoCard className="md:col-span-1 md:row-span-2 min-h-[320px]" delay={0.12}>
            <MineralTierCard />
          </BentoCard>

          {/* Card 3: Interactive Reader – Square */}
          <BentoCard className="md:col-span-1 min-h-[320px]" delay={0.24}>
            <ReaderPreviewCard />
          </BentoCard>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <Footer />
    </main>
  );
}
