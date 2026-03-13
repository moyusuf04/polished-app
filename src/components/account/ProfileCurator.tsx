'use client';

import { useState, useRef, useOptimistic, useTransition } from 'react';
import { TOKENS } from '@/lib/design-tokens';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Camera } from 'lucide-react';

const supabase = createClient();

interface ProfileData {
  display_name: string;
  bio: string;
  avatar_url: string;
}

interface ProfileCuratorProps {
  initialProfile: ProfileData;
  onProfileUpdate?: (profile: ProfileData) => void;
  onError?: (message: string) => void;
}

export default function ProfileCurator({
  initialProfile,
  onProfileUpdate,
  onError,
}: ProfileCuratorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic state for instant UI feedback
  const [optimisticProfile, setOptimisticProfile] = useOptimistic<ProfileData>(initialProfile);

  // Local editing state (only used while the edit panel is open)
  const [editName, setEditName] = useState(initialProfile.display_name);
  const [editBio, setEditBio] = useState(initialProfile.bio);

  const handleSave = async () => {
    setIsSaving(true);
    const updated: ProfileData = {
      ...optimisticProfile,
      display_name: editName,
      bio: editBio,
    };

    // Optimistic update
    startTransition(() => setOptimisticProfile(updated));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      onError?.('You must be signed in to update your profile.');
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editName,
        bio: editBio,
      })
      .eq('id', session.user.id);

    if (error) {
      onError?.(`Profile update failed: ${error.message}`);
      // Revert optimistic update
      startTransition(() => setOptimisticProfile(initialProfile));
    } else {
      onProfileUpdate?.(updated);
    }

    setIsSaving(false);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onError?.('Image must be under 2MB.');
      return;
    }

    setIsUploading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      onError?.('You must be signed in to upload an avatar.');
      setIsUploading(false);
      return;
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${session.user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      onError?.(`Avatar upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Append cache-buster to force re-render
    const freshUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: freshUrl })
      .eq('id', session.user.id);

    if (updateError) {
      onError?.(`Avatar save failed: ${updateError.message}`);
    } else {
      const updated: ProfileData = { ...optimisticProfile, avatar_url: freshUrl };
      startTransition(() => setOptimisticProfile(updated));
      onProfileUpdate?.(updated);
    }

    setIsUploading(false);
  };

  // Hidden file input
  const triggerFileSelect = () => fileRef.current?.click();

  // --- VIEW MODE ---
  if (!isEditing) {
    return (
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10 group">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-sm border flex items-center justify-center overflow-hidden transition-all duration-300"
            style={{
              borderColor: TOKENS.subtle,
              backgroundColor: TOKENS.graphite,
            }}
          >
            {optimisticProfile.avatar_url ? (
              <img
                src={optimisticProfile.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <span className="font-serif text-2xl text-white/50">
                {optimisticProfile.display_name?.charAt(0) || '?'}
              </span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
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
            {optimisticProfile.display_name || 'Anonymous'}
          </h1>
          <p className="font-sans font-light text-base text-white/60 max-w-xl leading-relaxed">
            {optimisticProfile.bio || 'No bio set yet.'}
          </p>
        </div>
      </div>
    );
  }

  // --- EDIT MODE ---
  return (
    <div
      className="p-6 md:p-8 border rounded-sm relative z-10 animate-in fade-in duration-300"
      style={{ borderColor: TOKENS.hairline, backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium">
          Identity Curation
        </span>
        <button
          onClick={() => {
            setEditName(optimisticProfile.display_name);
            setEditBio(optimisticProfile.bio);
            setIsEditing(false);
          }}
          className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-sm border flex items-center justify-center overflow-hidden relative cursor-pointer group/avatar"
            style={{ borderColor: TOKENS.subtle, backgroundColor: TOKENS.graphite }}
            onClick={triggerFileSelect}
          >
            {optimisticProfile.avatar_url ? (
              <img src={optimisticProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-xl text-white/50">
                {editName?.charAt(0) || '?'}
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div>
            <p className="text-xs text-white/50">Click to upload avatar</p>
            <p className="text-[10px] text-white/30 mt-1">Max 2MB • JPG, PNG, WebP</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Display Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            maxLength={50}
            className="w-full bg-transparent border-b p-2 font-serif text-2xl text-white outline-none focus:border-white transition-colors"
            style={{ borderColor: TOKENS.subtle }}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Executive Bio</label>
          <textarea
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            rows={3}
            maxLength={280}
            className="w-full bg-transparent border p-3 font-sans font-light text-sm text-white/80 outline-none focus:border-white/50 rounded-sm transition-colors resize-none"
            style={{ borderColor: TOKENS.hairline }}
          />
          <p className="text-[10px] text-white/20 text-right mt-1">{editBio.length}/280</p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving || isPending}
            className="px-6 py-2 bg-white text-black text-xs font-medium tracking-widest uppercase rounded-sm hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
