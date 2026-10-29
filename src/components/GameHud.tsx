/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerStats, ANATOMICAL_ZONES } from '../types/game';
import {
  Volume2,
  VolumeX,
  Pause,
  Shield,
  Zap,
  Compass,
  ChevronDown,
  ChevronUp,
  Flame,
  Wind,
  Swords,
  Rocket,
  HelpCircle,
  Dna,
  Crosshair,
  AlertTriangle,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface FloatingMessage {
  id: number;
  text: string;
  type: 'GOOD' | 'BAD' | 'COMBAT' | 'LEAP';
}

interface GameHudProps {
  stats: PlayerStats;
  onPause: () => void;
  onOpenGuide: () => void;
  onOpenUpgrades: () => void;
  showPenileLaunchBanner: boolean;
  isLeaping: boolean;
  leapResult: { hitTarget: boolean | null; detourName: string };
  floatingMessages: FloatingMessage[];
}

export const GameHud: React.FC<GameHudProps> = ({
  stats,
  onPause,
  onOpenGuide,
  onOpenUpgrades,
  showPenileLaunchBanner,
  isLeaping,
  leapResult,
  floatingMessages,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const currentZone = ANATOMICAL_ZONES[stats.currentZoneIndex] || ANATOMICAL_ZONES[0];

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 sm:p-5 text-white font-['Outfit',sans-serif]">
      {/* Top Perimeter Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Anatomical Stage & Distance to Ovary */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl pointer-events-auto max-w-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                currentZone.tract === 'MALE'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : currentZone.tract === 'TRANSITION'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse'
                  : 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
              }`}
            >
              {currentZone.tract === 'MALE'
                ? '♂ Male Anatomy'
                : currentZone.tract === 'TRANSITION'
                ? '⚡ Ejaculatory Blast'
                : '♀ Female Reproductive Tract'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: currentZone.themeColor }}
            />
            <div className="font-extrabold text-sm sm:text-base leading-tight">
              {currentZone.name}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {currentZone.location}
          </div>

          {/* Progress to Ovary Bar */}
          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>DISTANCE TO OVARY</span>
              <span className="font-bold text-white tabular-nums">
                {stats.progress}% ({stats.totalDistanceTraveled}mm)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${stats.progress}%`,
                  backgroundColor: currentZone.themeColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Center: Open-Air Ejaculation Leap Aiming Crosshair / Alerts */}
        <div className="flex flex-col items-center gap-2 pointer-events-auto max-w-md w-full mx-2">
          {/* Penile Launch Milestone Alert */}
          {showPenileLaunchBanner && (
            <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500 text-slate-950 font-black text-sm shadow-2xl flex items-center gap-2 animate-bounce">
              <Rocket className="w-5 h-5 text-slate-950 animate-pulse" />
              <span>🚀 BLASTING OUT OF PENIS INTO OPEN AIR!</span>
            </div>
          )}

          {/* Open-Air Leap Aiming Sequence Crosshair */}
          {isLeaping && (
            <div className="w-full bg-slate-900/95 border-2 border-amber-400 rounded-3xl p-3 shadow-2xl flex flex-col items-center text-center animate-pulse">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm sm:text-base">
                <Crosshair className="w-5 h-5 text-amber-400 animate-spin" />
                <span>SLOW-MO LEAP: STEER TO ENTER THE VAGINA!</span>
              </div>
              <div className="flex items-center justify-between w-full mt-2 text-[10px] font-bold px-2">
                <span className="text-slate-400">🧦 LEFT: THE SOCK</span>
                <span className="text-emerald-400 text-xs font-black">🎯 CENTER: VAGINA</span>
                <span className="text-yellow-400">🎈 RIGHT: CONDOM</span>
              </div>
            </div>
          )}

          {/* Floating Event Notifications */}
          <div className="flex flex-col items-center gap-1 w-full pointer-events-none">
            {floatingMessages.slice(-2).map((msg) => (
              <div
                key={msg.id}
                className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-150 ${
                  msg.type === 'GOOD'
                    ? 'bg-emerald-500 text-slate-950 border border-emerald-300'
                    : msg.type === 'BAD'
                    ? 'bg-rose-600 text-white border border-rose-400'
                    : msg.type === 'COMBAT'
                    ? 'bg-amber-400 text-slate-950 border border-yellow-200'
                    : 'bg-sky-400 text-slate-950 border border-white'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Active Power-Up Timers Bar */}
          <div className="flex items-center gap-2 mt-1">
            {stats.activePowerUps.energy > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-950/90 border border-sky-500/50 text-sky-300 text-xs font-bold shadow-lg">
                <Zap className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                <span>TURBO</span>
                <span className="font-mono tabular-nums text-white bg-sky-900/80 px-1 rounded">
                  {stats.activePowerUps.energy}s
                </span>
              </div>
            )}

            {stats.activePowerUps.shield > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-bold shadow-lg">
                <Shield className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>SHIELD</span>
                <span className="font-mono tabular-nums text-white bg-cyan-900/80 px-1 rounded">
                  {stats.activePowerUps.shield}s
                </span>
              </div>
            )}

            {stats.activePowerUps.guidance > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/90 border border-purple-500/50 text-purple-300 text-xs font-bold shadow-lg">
                <Compass className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>RADAR</span>
                <span className="font-mono tabular-nums text-white bg-purple-900/80 px-1 rounded">
                  {stats.activePowerUps.guidance}s
                </span>
              </div>
            )}

            {Math.abs(stats.currentFluidSurge) > 0.2 && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shadow-lg ${
                  stats.currentFluidSurge > 0
                    ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
                    : 'bg-amber-950/90 border border-amber-500/50 text-amber-300'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>{stats.currentFluidSurge > 0 ? '+60% SURGE' : '-40% COUNTER-FLOW'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Top-Right: Quick Action Buttons & Race Ranking */}
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl pointer-events-auto text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[11px] uppercase text-slate-400 font-bold">RACE POSITION</span>
              <span
                className={`font-mono font-black text-xl tabular-nums ${
                  stats.racePosition === 1
                    ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-emerald-400'
                }`}
              >
                #{stats.racePosition} <span className="text-xs text-slate-500">/ {stats.totalRacers}</span>
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 mt-1">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] text-slate-400 font-bold">RIVALS KO'D:</span>
              <span className="font-mono font-bold text-xs sm:text-sm text-rose-300 tabular-nums">
                {stats.rivalsKnockedOut}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="text-[10px] text-yellow-400 font-bold">SCORE:</span>
              <span className="font-mono font-black text-xs sm:text-sm text-yellow-200 tabular-nums">
                {stats.score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            {/* Survival Guide Modal Button */}
            <button
              onClick={onOpenGuide}
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-amber-400 hover:text-amber-300 transition-all shadow-xl cursor-pointer"
              title="Survival Guide: What to Hit vs What to Avoid"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Upgrades Shop Button */}
            <button
              onClick={onOpenUpgrades}
              className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 transition-all shadow-xl cursor-pointer"
              title="Cell Organelle Upgrades"
            >
              <Dna className="w-5 h-5" />
            </button>

            {/* Pause Button */}
            <button
              onClick={onPause}
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-xl cursor-pointer"
              title="Pause Game (Esc)"
            >
              <Pause className="w-5 h-5" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-xl cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Unified Collapsible Control Dock */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center pointer-events-auto">
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="mb-1 px-3 py-1 rounded-t-xl bg-slate-900/80 border-t border-x border-slate-800 text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
        >
          {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isDockCollapsed ? 'SHOW HUD' : 'HIDE HUD'}</span>
        </button>

        {!isDockCollapsed && (
          <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2.5">
            {/* Health Bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1">
                <span className="text-rose-400 font-bold">CELL INTEGRITY</span>
                <span className="font-mono tabular-nums text-white font-bold">{stats.health}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${stats.health}%`,
                    backgroundColor: stats.health > 40 ? '#10b981' : '#f43f5e',
                  }}
                />
              </div>
            </div>

            {/* Stamina / ATP Boost / Tail Whip Bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>MITOCHONDRIA ATP (SPACE TO BOOST &amp; RAM RIVALS)</span>
                </span>
                <span className="font-mono tabular-nums text-white font-bold">{stats.stamina}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-100 bg-gradient-to-r from-amber-500 to-yellow-400"
                  style={{ width: `${stats.stamina}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
