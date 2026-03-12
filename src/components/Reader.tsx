import { ArrowLeft, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface LessonProps {
  title: string;
  category: string;
  difficulty: string;
  content: string;
  hooks: string[];
}

export function Reader({ title, category, difficulty, content, hooks }: LessonProps) {
  return (
    <div className="w-full max-w-2xl mx-auto pt-8 pb-12 px-6">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-10 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Hub
      </Link>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-5 text-xs font-semibold tracking-widest uppercase">
          <span className="text-zinc-400">{category}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="text-zinc-500">{difficulty}</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif text-white leading-tight mb-8">
          {title}
        </h1>
        
        <div className="text-zinc-300 leading-relaxed space-y-6 text-lg tracking-wide font-light">
          {content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl shadow-black/20">
        <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-orange-400" />
          Conversational Hooks
        </h3>
        <ul className="space-y-4">
          {hooks.map((hook, i) => (
            <li key={i} className="text-zinc-400 text-sm leading-relaxed pl-4 border-l-2 border-zinc-800 relative">
              {hook}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
