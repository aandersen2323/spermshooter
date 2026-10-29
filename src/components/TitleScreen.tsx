/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ANATOMICAL_ZONES, PlayerUpgrades } from '../types/game';
import {
  Volume2,
  VolumeX,
  Play,
  HelpCircle,
  Dna,
  Shield,
  Zap,
  Rocket,
  Crosshair,
  Lock,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStartGame: (zoneIndex: number) => void;
  unlockedZone: number;
  onOpenGuide: () => void;
  onOpenUpgrades: () => void;
  savedPoints: number;
  upgrades: PlayerUpgrades;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  unlockedZone,
  onOpenGuide,
  onOpenUpgrades,
  savedPoints,
  upgrades,
}) => {
  const [selectedZone, setSelectedZone] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleStart = () => {
    onStartGame(selectedZone);
  };

  const currentSelected = ANATOMICAL_ZONES[selectedZone] || ANATOMICAL_ZONES[0];
  const totalUpgradesCount = Object.values(upgrades).reduce((a, b) => a + b, 0);

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-6 pointer-events-none z-20 text-white select-none font-['Outfit',sans-serif]">
      {/* Top Header / Audio & Shop Access */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/95 border border-slate-800 px-3.5 py-1.5 rounded-full shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300">
            3D Anatomical Odyssey &middot; 11 Anatomical Zones
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Survival Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-amber-300 hover:text-amber-200 transition-all cursor-pointer shadow-lg text-xs font-bold"
            title="Survival Guide: What to Hit vs Avoid"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Survival Guide</span>
          </button>

          {/* Cell Evolution Shop Button */}
          <button
            onClick={onOpenUpgrades}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 transition-all cursor-pointer shadow-lg text-xs font-bold"
            title="Upgrade Pip's Cell Organelles"
          >
            <Dna className="w-4 h-4 text-amber-400" />
            <span>Upgrades</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-[10px] font-mono text-white">
              {totalUpgradesCount}
            </span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Hero Center Lockup */}
      <div className="my-auto max-w-2xl mx-auto text-center pointer-events-auto flex flex-col items-center">
        {/* Mascot + Sub-badge */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <svg className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] animate-bounce" viewBox="0 0 48 48" fill="none">
            <ellipse cx="20" cy="24" rx="14" ry="10" fill="currentColor" />
            <path d="M32 24 C38 20, 42 28, 46 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="16" cy="21" r="3.5" fill="#0f172a" />
            <circle cx="17.5" cy="19.5" r="1.2" fill="#ffffff" />
            <ellipse cx="14" cy="26" rx="2.5" ry="1.5" fill="#f43f5e" fillOpacity="0.7" />
          </svg>
          <span className="text-xs uppercase tracking-widest px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full font-extrabold text-cyan-300">
            One Morphing Tube &middot; 250M Swimmers &middot; 1 Golden Egg
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-cyan-100 to-rose-200 bg-clip-text text-transparent drop-shadow-sm font-['Outfit']">
          MICRO ODYSSEY
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Start where you are made in the testes, blast out the penis in a slow-motion leap, dodge condoms &amp; IUDs, and ram rival sperm to fertilize the golden egg!
        </p>

        {/* Anatomical Checkpoint Selector */}
        <div className="mt-4 w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>STARTING ANATOMICAL CHECKPOINT</span>
            </span>
            <span className="text-emerald-400 font-mono">
              {unlockedZone + 1} / {ANATOMICAL_ZONES.length} Unlocked
            </span>
          </div>

          {/* 11 Anatomical Zones Grid */}
          <div className="grid grid-cols-11 gap-1">
            {ANATOMICAL_ZONES.map((zone, idx) => {
              const isUnlocked = idx <= unlockedZone;
              const isSelected = selectedZone === idx;
              return (
                <button
                  key={zone.id}
                  disabled={!isUnlocked}
                  onClick={() => setSelectedZone(idx)}
                  className={`py-2 px-0.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer relative ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-105 border border-rose-300'
                      : isUnlocked
                      ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 border border-slate-700'
                      : 'bg-slate-950/40 text-slate-600 border border-slate-900 cursor-not-allowed opacity-40'
                  }`}
                  title={`${zone.id}. ${zone.name}`}
                >
                  <span className="text-[8px] text-slate-400 font-mono">Z{zone.id}</span>
                  <span className="text-xs">
                    {!isUnlocked ? (
                      <Lock className="w-2.5 h-2.5 text-slate-600" />
                    ) : idx === 4 ? (
                      '🚀'
                    ) : idx === 5 ? (
                      '🎯'
                    ) : idx === 10 ? (
                      '🥚'
                    ) : (
                      zone.id
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Zone Briefing */}
          <div className="mt-3 text-left bg-slate-950/70 rounded-2xl p-3 border border-slate-800/70">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-rose-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentSelected.themeColor }} />
                {currentSelected.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {currentSelected.tract === 'MALE'
                  ? '♂ Male Testis/Ducts'
                  : currentSelected.tract === 'TRANSITION'
                  ? '⚡ Penile Blast'
                  : '♀ Female Reproductive Tract'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 leading-normal">
              {currentSelected.description}
            </div>
            <div className="text-[10px] italic text-amber-300/90 mt-1.5 pt-1.5 border-t border-slate-800/60">
              {currentSelected.humorQuote}
            </div>
          </div>
        </div>

        {/* Start Game CTA Button */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleStart}
            className="group relative inline-flex items-center gap-3 px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-base shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>BEGIN ANATOMICAL VOYAGE</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">SPACE / ENTER</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-amber-300 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Survival Guide</span>
          </button>
        </div>

        {/* Control hint */}
        <p className="mt-3 text-[11px] text-slate-400 font-medium">
          WASD / Arrows to Steer &middot; Space to Boost &amp; Ram Rivals &middot; Esc to Pause
        </p>
      </div>

      {/* Footer bar */}
      <div className="w-full flex items-center justify-between text-[11px] text-slate-500 pointer-events-auto">
        <span className="font-mono">Micro Odyssey 3D Engine v2.0</span>
        <span className="font-mono text-amber-400/80">ATP Bank: {savedPoints.toLocaleString()} PTS</span>
      </div>
    </div>
  );
};
