/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerUpgrades, UPGRADE_DEFINITIONS } from '../types/game';
import { X, Dna, Zap, Shield, ArrowUpCircle, Check } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface UpgradeShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgrades: PlayerUpgrades;
  points: number;
  onBuyUpgrade: (upgradeKey: keyof PlayerUpgrades, cost: number) => void;
}

export const UpgradeShopModal: React.FC<UpgradeShopModalProps> = ({
  isOpen,
  onClose,
  upgrades,
  points,
  onBuyUpgrade,
}) => {
  if (!isOpen) return null;

  const handlePurchase = (key: keyof PlayerUpgrades, cost: number) => {
    if (points >= cost) {
      soundManager.playPowerUp();
      onBuyUpgrade(key, cost);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none font-['Outfit',sans-serif]">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border-2 border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧬</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                <span>CELLULAR EVOLUTION LAB</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Upgrade Pip
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mutate your flagellum and mitochondria to out-swim 250 million rivals!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Wallet points pill */}
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center gap-2">
              <span className="text-sm">💎</span>
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase font-bold text-amber-300">ATP WALLET</span>
                <span className="text-sm font-mono font-black text-amber-200 tabular-nums">
                  {points.toLocaleString()} PTS
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Shop"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upgrade List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {UPGRADE_DEFINITIONS.map((item) => {
            const currentLvl = upgrades[item.id] || 0;
            const isMaxed = currentLvl >= item.maxLevel;
            const cost = item.baseCost * (currentLvl + 1);
            const canAfford = points >= cost && !isMaxed;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {item.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-sm sm:text-base">
                        {item.name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        LVL {currentLvl} / {item.maxLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 max-w-md">
                      {item.description}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-emerald-400">
                        {item.perk}
                      </span>
                    </div>

                    {/* Level Progress Pip Bars */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {Array.from({ length: item.maxLevel }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-1.5 rounded-full transition-all ${
                            i < currentLvl
                              ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <div className="w-full sm:w-auto shrink-0 flex justify-end">
                  {isMaxed ? (
                    <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>MAX LEVEL</span>
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => handlePurchase(item.id, cost)}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95'
                          : 'bg-slate-800/60 border border-slate-700/50 text-slate-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>UPGRADE: {cost.toLocaleString()} ATP</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400">
            Points are earned by collecting Gold ATP Gems and knocking out rival sperm.
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all cursor-pointer"
          >
            RETURN TO GAME
          </button>
        </div>

      </div>
    </div>
  );
};
