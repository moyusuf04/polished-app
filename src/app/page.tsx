'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView, Variants } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import Image from "next/image";

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
        A daily energy system that makes every lesson count. These psychological limiters fuel intentional study.
      </p>

      {/* Battery visual */}
      <div className="mt-auto relative">
        <div className="liquid-fill-container h-28 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className={`liquid-fill ${isInView ? 'animate' : ''}`} />
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
        Your rank evolves from raw Quartz to the clarity of Diamond through consistent engagement.
      </p>

      <div className="mt-auto flex flex-col gap-4">
        {tiers.map((tier, i) => (
          <div key={tier.label} className="flex items-center gap-3 relative">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-8 h-8 rounded-full flex-shrink-0 z-10"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${tier.color}, ${tier.color}44)`,
                boxShadow: `0 0 12px ${tier.color}33`,
              }}
            />
            <div className="flex-1">
              <p className="text-sm text-white/80 font-medium">{tier.label}</p>
              <p className="text-[10px] text-white/30 tracking-wider">{tier.xp}</p>
            </div>
            {i < tiers.length - 1 && (
              <div className="absolute left-[15.5px] top-[32px] w-[1px] h-[32px] bg-gradient-to-b from-white/10 to-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Interactive Reader Card ──
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
        Immersive lessons with curated content across culture, history, and modern thought.
      </p>

      <div className="mt-auto relative rounded-lg bg-white/[0.03] border border-white/[0.06] p-5 overflow-hidden">
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

  const heroItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <main className="midnight-umber min-h-screen relative overflow-hidden bg-black selection:bg-zinc-800 selection:text-white">
      {/* Linen Canvas texture overlay */}
      <div className="linen-canvas" />

      {/* ═══════ HERO: The Asymmetrical Temple Entrance ═══════ */}
      <section className="relative z-10 w-full min-h-screen flex flex-col pt-24 md:pt-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-12 items-start relative pb-20">
          
          {/* Headline - Shifted Left */}
          <div className="w-full md:w-5/12 z-20">
            <motion.h1
              className="text-7xl md:text-9xl font-serif text-white tracking-tight blur-in-reveal mb-8"
              style={{ lineHeight: 0.9 }}
            >
              Polished.
            </motion.h1>
            
            <div className="h-px w-24 bg-gradient-to-r from-white/40 to-transparent mb-12 hidden md:block" />
          </div>

          {/* Centerpiece Image - Large and Layered */}
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-7/12 relative aspect-[4/5] md:aspect-[4/3] max-h-[70vh] framed-image overflow-hidden"
          >
            <Image 
              src="/temple-centerpiece.png"
              alt="Temple of Knowledge"
              fill
              className="object-cover brightness-90 contrast-110"
              priority
            />
            {/* Subtle overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-radial-vignette opacity-50" />
          </motion.div>

          {/* High-Contrast "Note" Block (Tagline & CTA) - Overlapping */}
          <motion.div
            variants={heroItemVariants}
            initial="hidden"
            animate="visible"
            className="antique-creme w-full md:max-w-md p-10 md:absolute md:bottom-[-40px] md:right-0 z-30 shadow-2xl rounded-sm"
          >
            <p className="font-serif text-[10px] tracking-[0.3em] uppercase opacity-40 mb-6">
              The Essence
            </p>
            <h2 className="text-3xl font-serif leading-tight mb-8">
              Conversational breadth for the ambitious.
            </h2>
            
            <div className="flex flex-col gap-5">
              <Link
                href="/signup"
                className="w-full flex items-center justify-center py-4 bg-[#1a120b] text-white text-[10px] font-bold tracking-widest uppercase hover:brightness-110 transition-all rounded-sm"
              >
                Enter the Void
              </Link>
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="flex-1 flex items-center justify-center py-4 border border-[#1a120b]/20 text-[#1a120b] text-[10px] font-bold tracking-widest uppercase hover:bg-black/5 transition-all rounded-sm"
                >
                  Log In
                </Link>
                <button
                  onClick={handleGuestSignIn}
                  disabled={isGuestLoading}
                  className="flex-1 flex items-center justify-center py-4 bg-[#1a120b]/5 text-[#1a120b] text-[10px] font-bold tracking-widest uppercase hover:bg-[#1a120b]/10 transition-all rounded-sm backdrop-blur-sm"
                >
                  {isGuestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Try as Guest"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator - Architectural rule */}
        <div className="mt-auto pb-12 w-full flex justify-center">
          <motion.div 
            animate={{ height: [0, 60, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] bg-white rounded-full"
          />
        </div>
      </section>

      {/* ═══════ BENTO: Renaissance Feature Gallery ═══════ */}
      <section className="relative z-10 px-6 py-32 max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center text-[10px] tracking-[0.4em] uppercase text-white/30 mb-20"
        >
          Curated Features
        </motion.p>

        {/* Bento Grid layout matching the editorial feel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[320px]">
          {/* Learning Battery - Small square */}
          <BentoCard className="md:col-span-1" delay={0}>
            <EnergyCard />
          </BentoCard>

          {/* Mineral Tier - Tall centerpiece of bento */}
          <BentoCard className="md:col-span-2 md:row-span-2" delay={0.1}>
            <MineralTierCard />
          </BentoCard>

          {/* Interactive Reader - Square */}
          <BentoCard className="md:col-span-1" delay={0.2}>
            <ReaderPreviewCard />
          </BentoCard>

          {/* Reserved for future or just empty spacing to maintain asymmetry */}
          <div className="hidden md:block md:col-span-1" />
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <Footer />
    </main>
  );
}
