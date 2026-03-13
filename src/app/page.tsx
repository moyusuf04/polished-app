'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black px-6 selection:bg-zinc-800 selection:text-white relative overflow-hidden">
      <motion.div 
        className="text-center max-w-lg mx-auto w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-6xl md:text-8xl font-serif text-white mb-6 tracking-tight drop-shadow-sm shimmer-text"
        >
          Polished.
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-white/40 text-lg md:text-xl font-sans font-light tracking-wide mb-14"
        >
          Conversational breadth for the ambitious.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full px-2 mb-10">
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

        <motion.div variants={itemVariants}>
          <button 
            onClick={handleGuestSignIn}
            disabled={isGuestLoading}
            className="text-white/20 hover:text-white/40 font-medium text-[10px] tracking-[0.2em] uppercase transition-colors flex items-center justify-center mx-auto gap-2"
          >
            {isGuestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Try as Guest"}
          </button>
        </motion.div>
      </motion.div>
      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </main>
  );
}
