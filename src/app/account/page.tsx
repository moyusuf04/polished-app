'use client';

import AccountHeader from '@/components/account/AccountHeader';
import MineralTrackStatus from '@/components/account/MineralTrackStatus';
import AlumniCredentials from '@/components/account/AlumniCredentials';
import SpotlightArchive from '@/components/account/SpotlightArchive';
import IntelDropCustomiser from '@/components/account/IntelDropCustomiser';

// We reuse the CSS from the design identity page to maintain the lithic aesthetic.
const css = `
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes noiseShift {
    0%   { transform: translate(0,0); }
    25%  { transform: translate(-1px, 1px); }
    50%  { transform: translate(1px, -1px); }
    75%  { transform: translate(-1px, -1px); }
    100% { transform: translate(0,0); }
  }
  .polished-root {
    font-family: var(--font-sans), sans-serif;
    background: #000000;
    color: #e8e8e8;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }
  .noise-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    animation: noiseShift 0.15s steps(1) infinite;
  }
`;

export default function AccountPage() {
  return (
    <main className="polished-root selection:bg-zinc-800">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="noise-overlay" />
      
      {/* 
        The flow of the Account Page as per requirements:
        1. Core Identity & 'Saved' Metric
        2. Current Growth (Progress Rings)
        3. Intellectual Assets (Alumni & Spotlight)
        4. Identity/Sharing Engine (Intel Drop)
      */}
      
      <AccountHeader insightsProvided={14} />
      <MineralTrackStatus />
      <AlumniCredentials />
      <SpotlightArchive />
      <IntelDropCustomiser />
      
      <div className="pb-32" />
    </main>
  );
}
