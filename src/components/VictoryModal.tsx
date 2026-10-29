/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LevelResult } from '../types/game';
import { Award, RotateCcw, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';

interface VictoryModalProps {
  result: LevelResult;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ result, onPlayAgain }) => {
  useEffect(() => {
    // Spectacular multi-stage confetti burst
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fde047', '#38bdf8', '#f43f5e', '#a855f7'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fde047', '#38bdf8', '#f43f5e', '#a855f7'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none text-white font-['Outfit',sans-serif] animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center text-center">
        {/* Acrosome Reaction Trophy Icon */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/40">
            <Sparkles className="w-10 h-10 text-slate-950 animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full border-2 border-slate-900">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black tracking-widest uppercase mb-2">
          <span>THE GRAND CONCEPTION</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-rose-300 bg-clip-text text-transparent leading-none">
          1 IN 250,000,000!
        </h2>
        <p className="mt-2 text-sm text-slate-300 max-w-sm">
          You penetrated the Zona Pellucida and successfully fertilized the Golden Oocyte!
        </p>

        {/* Stats Display */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 my-5 grid grid-cols-2 gap-3 text-left">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-xs text-slate-400 font-bold block">FINAL SCORE</span>
            <span className="font-mono text-2xl font-black text-amber-300">
              {result.score.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-xs text-slate-400 font-bold block">CHAMPION RANK</span>
            <span className="font-mono text-2xl font-black text-emerald-400">
              {result.rank}-TIER
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-xs text-slate-400 font-bold block">VOYAGE DURATION</span>
            <span className="font-mono text-lg font-bold text-cyan-300">
              {result.timeElapsed}s
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-xs text-slate-400 font-bold block">ATP HARVESTED</span>
            <span className="font-mono text-lg font-bold text-yellow-300">
              {result.fructoseCollected} Gems
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 col-span-2">
            <span className="text-xs text-slate-400 font-bold block">RIVALS DEFEATED IN COMBAT</span>
            <span className="font-mono text-lg font-black text-rose-400">
              ⚔️ {result.rivalsKnockedOut} Competitor Sperm KO'd
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onPlayAgain}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-rose-400 text-white font-black text-base shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
        >
          <RotateCcw className="w-5 h-5" />
          <span>PLAY AGAIN FROM GENESIS</span>
        </button>
      </div>
    </div>
  );
};
