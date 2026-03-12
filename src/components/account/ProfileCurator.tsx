'use client';

import { useState } from 'react';
import { TOKENS } from '@/lib/design-tokens';

interface ProfileCuratorProps {
  initialName?: string;
  initialBio?: string;
  initialAvatar?: string;
}

export default function ProfileCurator({
  initialName = "A. Professional",
  initialBio = "Navigating the intersection of strategic communication and executive presence.",
  initialAvatar = "",
}: ProfileCuratorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatar, setAvatar] = useState(initialAvatar);

  if (!isEditing) {
    return (
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10 group">
        <div className="relative">
          <div 
            className="w-24 h-24 rounded-sm border flex items-center justify-center overflow-hidden transition-all duration-300"
            style={{ 
              borderColor: TOKENS.subtle,
              backgroundColor: TOKENS.graphite
            }}
          >
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-full h-full object-cover grayscale" />
            ) : (
              <span className="font-serif text-2xl text-white/50">{name.charAt(0)}</span>
            )}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            aria-label="Edit Profile"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-3 tracking-tight">
            {name}
          </h1>
          <p className="font-sans font-light text-base text-white/60 max-w-xl leading-relaxed">
            {bio}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 border rounded-sm relative z-10 animate-in fade-in duration-300" style={{ borderColor: TOKENS.hairline, backgroundColor: 'rgba(255,255,255,0.02)' }}>
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium">Identity Curation</span>
        <button 
          onClick={() => setIsEditing(false)}
          className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Display Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b p-2 font-serif text-2xl text-white outline-none focus:border-white transition-colors"
            style={{ borderColor: TOKENS.subtle }}
          />
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Executive Bio</label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-transparent border p-3 font-sans font-light text-sm text-white/80 outline-none focus:border-white/50 rounded-sm transition-colors resize-none"
            style={{ borderColor: TOKENS.hairline }}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 bg-white text-black text-xs font-medium tracking-widest uppercase rounded-sm hover:bg-white/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
