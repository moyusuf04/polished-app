'use client';

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-red-950 rounded-full flex items-center justify-center mb-6">
        <span className="text-2xl">⚠️</span>
      </div>
      <h2 className="text-2xl font-serif text-white mb-3">Something went wrong</h2>
      <p className="text-zinc-500 mb-8 max-w-md text-sm">{error.message || 'An unexpected error occurred in the admin panel.'}</p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors"
      >
        Reload
      </button>
    </div>
  );
}
