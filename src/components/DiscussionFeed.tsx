import { User } from 'lucide-react';

interface Reflection {
  id: string;
  response_text: string;
  created_at: string;
  is_current_user?: boolean;
}

interface Props {
  reflections: Reflection[];
  isLoading?: boolean;
}

export function DiscussionFeed({ reflections, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 mb-12 animate-pulse">
        <div className="h-8 w-48 bg-white/5 mx-auto mb-12 rounded-sm" />
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="p-8 border border-white/5 bg-[#0d0d10] h-40 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 mb-12 text-center py-20 border border-white/5 border-dashed rounded-sm">
        <p className="text-white/10 text-[10px] tracking-[0.3em] font-bold uppercase">The vault is currently empty. You are the architect of this room.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-serif text-white mb-2 tracking-tight">The Room</h3>
        <p className="text-white/20 text-[10px] tracking-[0.2em] font-bold uppercase">Collective Intelligence Feed</p>
      </div>
      
      <div className="space-y-6">
        {reflections.map((reflection) => (
          <div 
            key={reflection.id} 
            className={`p-8 border transition-all relative overflow-hidden rounded-sm ${
              reflection.is_current_user 
                ? 'bg-white/[0.03] border-white/20 shadow-2xl' 
                : 'bg-[#0d0d10] border-white/5 shadow-xl'
            }`}
          >
            {reflection.is_current_user && (
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${reflection.is_current_user ? 'bg-white border-white' : 'bg-white/5 border-white/10'}`}>
                <User className={`w-5 h-5 ${reflection.is_current_user ? 'text-black' : 'text-white/20'}`} />
              </div>
              <div>
                <span className={`text-[10px] font-bold tracking-[0.22em] uppercase ${reflection.is_current_user ? 'text-white' : 'text-white/40'}`}>
                  {reflection.is_current_user ? 'Your Perspective' : 'Anonymous Member'}
                </span>
                <p className="text-[9px] text-white/10 font-mono tracking-widest mt-1 uppercase">
                   COMMITTED · {new Date(reflection.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-white/70 text-base leading-relaxed font-sans font-light pl-14 border-l border-white/5">
              {reflection.response_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
