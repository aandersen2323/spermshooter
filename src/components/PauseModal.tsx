/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestartLevel: () => void;
  onReturnTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestartLevel,
  onReturnTitle,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundManager.getMuted());

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm select-none text-white font-['Outfit',sans-serif] animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-black text-white mb-1">VOYAGE PAUSED</h2>
        <p className="text-xs text-slate-400 mb-6">Take a breath, cellular champion!</p>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Journey</span>
          </button>

          <button
            onClick={onRestartLevel}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Stage</span>
          </button>

          <button
            onClick={toggleSound}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-900"
          >
            <Home className="w-4 h-4" />
            <span>Return to Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
