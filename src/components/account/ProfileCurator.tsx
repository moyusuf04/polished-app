import { useState, useRef, useOptimistic, useTransition, KeyboardEvent } from 'react';
import { TOKENS, MINERALS } from '@/lib/design-tokens';
import { createClient } from '@/lib/supabase/client';
import { updateUserProfile } from '@/lib/actions/user-actions';
import { Loader2, Camera } from 'lucide-react';

const supabase = createClient();

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_NAME_LENGTH = 40;
const MAX_BIO_LENGTH = 160;

interface ProfileData {
  display_name: string;
  bio: string;
  avatar_url: string;
}

interface ProfileCuratorProps {
  initialProfile: ProfileData;
  userId: string;
  onProfileUpdate?: (profile: ProfileData) => void;
  onError?: (message: string) => void;
}

export default function ProfileCurator({
  initialProfile,
  userId,
  onProfileUpdate,
  onError,
}: ProfileCuratorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic state for instant UI feedback
  const [optimisticProfile, setOptimisticProfile] = useOptimistic<ProfileData>(initialProfile);

  // Local editing state
  const [editName, setEditName] = useState(initialProfile.display_name);
  const [editBio, setEditBio] = useState(initialProfile.bio);

  // Character counter states for bio
  const bioLength = editBio.length;
  const charsRemaining = MAX_BIO_LENGTH - bioLength;
  const isBioWarning = bioLength >= 140;

  // Inline error messages
  const [nameError, setNameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);

  const validateName = (value: string): boolean => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setNameError('Display name cannot be empty.');
      return false;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setNameError(`Display name must be ${MAX_NAME_LENGTH} characters or fewer.`);
      return false;
    }
    setNameError(null);
    return true;
  };

  const validateBio = (value: string): boolean => {
    if (value.length > MAX_BIO_LENGTH) {
      setBioError(`Bio must be ${MAX_BIO_LENGTH} characters or fewer.`);
      return false;
    }
    setBioError(null);
    return true;
  };

  const handleSave = async () => {
    // Client-side validation
    const nameValid = validateName(editName);
    const bioValid = validateBio(editBio);
    if (!nameValid || !bioValid) return;

    const trimmedName = editName.trim();
    const updated: ProfileData = {
      ...optimisticProfile,
      display_name: trimmedName,
      bio: editBio,
    };

    // Optimistic update
    startTransition(() => setOptimisticProfile(updated));

    const result = await updateUserProfile(userId, trimmedName, editBio);

    if (!result.success) {
      // Rollback optimistic update
      startTransition(() => setOptimisticProfile(initialProfile));
      if (result.error) {
        setNameError(result.error);
      }
    } else {
      onProfileUpdate?.(updated);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && (e.currentTarget.nodeName === 'INPUT')) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && (e.currentTarget.nodeName === 'TEXTAREA')) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onError?.('Only JPEG, PNG, and WebP images are accepted.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
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
    const timestamp = Date.now();
    const newFilePath = `${session.user.id}/avatar-${timestamp}.${ext}`;

    if (optimisticProfile.avatar_url) {
      try {
        const urlParts = optimisticProfile.avatar_url.split('/avatars/');
        if (urlParts.length > 1) {
          const oldPath = urlParts[1].split('?')[0];
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      } catch {
        // Non-critical
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(newFilePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      onError?.(`Avatar upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(newFilePath);

    const freshUrl = `${publicUrl}?t=${timestamp}`;

    const updated: ProfileData = { ...optimisticProfile, avatar_url: freshUrl };
    startTransition(() => setOptimisticProfile(updated));

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: freshUrl })
      .eq('id', session.user.id);

    if (updateError) {
      startTransition(() => setOptimisticProfile(initialProfile));
      onError?.(`Avatar save failed: ${updateError.message}`);
    } else {
      onProfileUpdate?.(updated);
    }

    setIsUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const triggerFileSelect = () => fileRef.current?.click();

  if (!isEditing) {
    return (
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10 group">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-sm border flex items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer"
            style={{
              borderColor: TOKENS.subtle,
              backgroundColor: TOKENS.graphite,
            }}
            onClick={triggerFileSelect}
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
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <button
            onClick={() => setIsEditing(true)}
            className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-all"
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
          <p className="font-sans font-light text-base text-white/60 max-w-xl leading-relaxed whitespace-pre-wrap">
            {optimisticProfile.bio || 'No bio set yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 md:p-8 border rounded-sm relative z-10 animate-in fade-in duration-300 w-full max-w-xl"
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
            setNameError(null);
            setBioError(null);
            setIsEditing(false);
          }}
          className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-6">
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
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div>
            <p className="text-xs text-white/50">Avatar selection</p>
            <p className="text-[10px] text-white/30 mt-1">2MB Limit • Professional assets only</p>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Display Name</label>
          <input
            type="text"
            value={editName}
            onKeyDown={handleKeyPress}
            onChange={(e) => {
              setEditName(e.target.value);
              if (nameError) validateName(e.target.value);
            }}
            maxLength={MAX_NAME_LENGTH}
            className="w-full bg-transparent border-b p-2 font-serif text-2xl text-white outline-none focus:border-white transition-colors"
            style={{ borderColor: nameError ? '#ef4444' : TOKENS.subtle }}
          />
          {nameError && (
            <p className="text-[10px] text-red-400 mt-1">{nameError}</p>
          )}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Executive Bio</label>
          <textarea
            value={editBio}
            onKeyDown={handleKeyPress}
            onChange={(e) => {
              if (e.target.value.length <= MAX_BIO_LENGTH) {
                setEditBio(e.target.value);
                if (bioError) validateBio(e.target.value);
              }
            }}
            rows={3}
            className="w-full bg-transparent border p-3 font-sans font-light text-sm text-white/80 outline-none focus:border-white/50 rounded-sm transition-colors resize-none"
            style={{ borderColor: bioError ? '#ef4444' : TOKENS.hairline }}
          />
          <div className="flex justify-between items-center mt-2">
            <div>
              {bioError ? (
                <p className="text-[10px] text-red-400">{bioError}</p>
              ) : (
                <span className="text-[10px] text-white/20 tracking-wide uppercase font-medium">Cmd+Enter to save.</span>
              )}
            </div>
            <p className="text-xs font-mono font-bold tracking-tight" style={{ color: isBioWarning ? MINERALS.tigersEye.light : 'rgba(255,255,255,0.2)' }}>
              {charsRemaining}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-8 py-3 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-white/90 transition-all disabled:opacity-50 flex items-center gap-2 border-b-2 border-zinc-300 active:border-b-0 active:translate-y-[2px]"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update Identity'}
          </button>
        </div>
      </div>
    </div>
  );
}

