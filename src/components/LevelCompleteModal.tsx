/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LevelResult, ANATOMICAL_ZONES } from '../types/game';
import { Trophy, Star, ArrowRight, RotateCcw, Clock, Zap, Shield, BookOpen } from 'lucide-react';

interface LevelCompleteModalProps {
  result: LevelResult;
  onNextLevel: () => void;
  onReplayLevel: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  result,
  onNextLevel,
  onReplayLevel,
}) => {
  const currentZone = ANATOMICAL_ZONES[result.levelNumber - 1] || ANATOMICAL_ZONES[0];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none text-white font-['Outfit',sans-serif] animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Level Cleared Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-2">
          <span>Stage {result.levelNumber} Completed</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {result.levelName}
        </h2>

        {/* Star Rating & Rank */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 transition-all ${
                starIdx <= result.stars
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] scale-110'
                  : 'text-slate-700'
              }`}
            />
          ))}
          <div className="ml-3 px-3 py-1 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white font-black text-xl shadow-lg">
            {result.rank}-RANK
          </div>
        </div>

        {/* Performance Breakdown Grid */}
        <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 my-3 grid grid-cols-2 gap-3 text-left">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>TIME</span>
            </div>
            <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">
              {result.timeElapsed}s <span className="text-xs text-slate-500">/ {result.targetTime}s</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>ATP HARVESTED</span>
            </div>
            <div className="text-base font-bold font-mono text-yellow-300 mt-0.5">
              +{result.fructoseCollected}
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>POWER-UPS</span>
            </div>
            <div className="text-base font-bold font-mono text-sky-300 mt-0.5">
              {result.powerUpsGathered} Gathered
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>TOTAL SCORE</span>
            </div>
            <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
              {result.score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Anatomical Fun Fact */}
        <div className="w-full bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 text-left my-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300 uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Anatomy Fact</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {currentZone.humorQuote || currentZone.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full mt-4">
          <button
            onClick={onReplayLevel}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>

          <button
            onClick={onNextLevel}
            className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Voyage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
