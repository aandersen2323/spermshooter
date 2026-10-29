/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, Home, Skull, ShieldAlert } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  levelIndex: number;
  onRetry: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  levelIndex,
  onRetry,
  onReturnTitle,
}) => {
  const tips = [
    'Tip: Tail-whip rival sperm by pressing Space when close to knock them out and steal their ATP!',
    'Tip: Collect yellow ATP Gems to recharge your mitochondrial stamina meter!',
    'Tip: Grab cyan Shield Bubbles to deflect white blood cell phagocytes!',
    'Tip: Watch the constricted fallopian valves and wait for the aperture to dilate before rushing through.',
    'Tip: Guidance crystals illuminate the track and magnetically draw nutrients toward you.',
    'Tip: Ride forward fluid surges for massive velocity boosts, but conserve stamina during counter-currents!',
    'Tip: Ram into rival sperm while boosting to spin them out and climb in the race ranking!',
  ];

  const randomTip = tips[levelIndex % tips.length];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none text-white font-['Outfit',sans-serif] animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3">
          <ShieldAlert className="w-8 h-8 text-rose-400" />
        </div>

        <h2 className="text-3xl font-black text-rose-400">
          JOURNEY HALTED
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Cellular energy depleted or absorbed by anatomical hazards!
        </p>

        {/* Score display */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 my-4">
          <span className="text-xs text-slate-400 font-bold block">POINTS EARNED</span>
          <span className="font-mono text-2xl font-black text-amber-300">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Survival Tip */}
        <div className="w-full bg-rose-950/20 border border-rose-900/40 rounded-xl p-3 text-left mb-4">
          <div className="text-[11px] font-bold text-rose-300 uppercase">
            Survival Tip
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {randomTip}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onReturnTitle}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>Title</span>
          </button>

          <button
            onClick={onRetry}
            className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
