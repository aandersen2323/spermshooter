/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  Rocket,
  Dna,
  Zap,
  Shield,
  Compass,
  Swords,
  Crosshair,
  Skull,
  X,
  Play,
  Heart,
  Info
} from 'lucide-react';

interface SurvivalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartJourney?: () => void;
  isInitialTutorial?: boolean;
}

export const SurvivalGuideModal: React.FC<SurvivalGuideModalProps> = ({
  isOpen,
  onClose,
  onStartJourney,
  isInitialTutorial = false,
}) => {
  const [activeTab, setActiveTab] = useState<'GOOD' | 'TRAPS' | 'LEAP' | 'UPGRADES'>('GOOD');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none font-['Outfit',sans-serif]">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border-2 border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧬</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                <span>FERTILIZATION SURVIVAL GUIDE</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Pip's Biological Briefing
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                What to hit for points/speed vs what deadly traps to avoid at all costs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('GOOD')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'GOOD'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-950" />
            <span>🟢 WHAT TO HIT (GOOD)</span>
          </button>

          <button
            onClick={() => setActiveTab('TRAPS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'TRAPS'
                ? 'bg-rose-500 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>🔴 TRAPS &amp; HAZARDS (BAD)</span>
          </button>

          <button
            onClick={() => setActiveTab('LEAP')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'LEAP'
                ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Rocket className="w-4 h-4 text-sky-950" />
            <span>🚀 PENILE LEAP &amp; DETOURS</span>
          </button>

          <button
            onClick={() => setActiveTab('UPGRADES')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'UPGRADES'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Dna className="w-4 h-4 text-amber-950" />
            <span>⚡ CELL UPGRADES</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: WHAT TO HIT */}
          {activeTab === 'GOOD' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200">
                <strong>Rule of Thumb:</strong> Look for glowing golden starbursts, cyan electric orbs, emerald bubbles, and rival sperm you can ram! All of these give points, speed, or tactical advantages.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Gold ATP Gems */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/40 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl shrink-0">
                    💎
                  </div>
                  <div>
                    <h4 className="font-extrabold text-amber-300 text-sm">Gold ATP Fructose Gems</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Restores +25 Mitochondrial Stamina, gives +100 Score, and fills your wallet to buy cell upgrades.
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Primary Collectible
                    </span>
                  </div>
                </div>

                {/* Cyan Turbo Spheres */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-sky-500/40 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-xl shrink-0">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sky-300 text-sm">Cyan Turbo Spheres</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Triggers 7 seconds of hyper-speed flagellum oscillation. Slices through fluid currents and overtakes rivals effortlessly!
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      +65% Velocity Surge
                    </span>
                  </div>
                </div>

                {/* Emerald Shield Bubbles */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl shrink-0">
                    🛡️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-emerald-300 text-sm">Emerald Shield Bubbles</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Surrounds Pip in an alkaline lipid shield for 8s. Completely deflects White Blood Cells, acidic secretions, and obstacle knocks!
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      100% Invulnerability
                    </span>
                  </div>
                </div>

                {/* Amethyst Chemotaxis Radar */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/40 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-xl shrink-0">
                    🧭
                  </div>
                  <div>
                    <h4 className="font-extrabold text-purple-300 text-sm">Amethyst Guidance Radar</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Progesterone chemotaxis sensor. Magnetically vacuums nearby ATP gems directly toward your cell head!
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      Magnetic Attraction
                    </span>
                  </div>
                </div>

                {/* Rival Sperm Ramming Combat */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/40 flex gap-3 sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-xl shrink-0">
                    ⚔️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-rose-300 text-sm">Rival Sperm Cells (Ram &amp; Tail-Whip!)</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        SPACE / BOOST TO ATTACK
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      You are in a race against 100 other swimmers! Press <strong>Spacebar</strong> to boost directly into them or tail-whip them. Knocking them out sends them spinning (+250 pts), steals their ATP, and climbs your leaderboard rank toward #1!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRAPS & HAZARDS */}
          {activeTab === 'TRAPS' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-xs text-rose-200">
                <strong>Danger Alert:</strong> Obstacles glow with warning red colors or recognizable contraceptive silhouettes. Hitting them drains Cell Health or pushes you back!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Male Condom Blocker */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-xl shrink-0">
                    🎈
                  </div>
                  <div>
                    <h4 className="font-extrabold text-yellow-300 text-sm">Male Condom Blocker</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      A giant ribbed latex dome with a reservoir tip. Steer away from the solid latex or bounce violently backward!
                    </p>
                    <span className="text-[10px] text-yellow-400 font-mono mt-1 block">Bounces back &amp; steals momentum</span>
                  </div>
                </div>

                {/* NuvaRing */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl shrink-0">
                    ⭕
                  </div>
                  <div>
                    <h4 className="font-extrabold text-pink-300 text-sm">NuvaRing Hormonal Field</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      A glowing 54mm elastomeric ring emitting a suppressive hormonal fog. Passing through slashes swim speed by 50%!
                    </p>
                    <span className="text-[10px] text-pink-400 font-mono mt-1 block">Severe -50% Motility Drop</span>
                  </div>
                </div>

                {/* Copper IUD */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-xl shrink-0">
                    ✝️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-orange-300 text-sm">The Copper-T IUD</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Metallic T-frame in the uterine cavern radiating toxic copper ions. Zaps flagellum enzymes on contact!
                    </p>
                    <span className="text-[10px] text-rose-400 font-mono mt-1 block">-30 Health &amp; Severe Knockback</span>
                  </div>
                </div>

                {/* Spermicide Foam */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-xl shrink-0">
                    🫧
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lime-300 text-sm">Nonoxynol-9 Spermicide</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Toxic yellow chemical foam clouds that dissolve cell membrane lipids. Grab an Emerald Shield to pass safely.
                    </p>
                    <span className="text-[10px] text-rose-400 font-mono mt-1 block">-25 Health Corrosion</span>
                  </div>
                </div>

                {/* White Blood Cell Macrophages */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-xl shrink-0">
                    🦠
                  </div>
                  <div>
                    <h4 className="font-extrabold text-rose-300 text-sm">White Blood Cells (Macrophages)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Aggressive immune security guards with glowing red eyes that lock on and chase you through the cervix!
                    </p>
                    <span className="text-[10px] text-rose-400 font-mono mt-1 block">-25 Health &amp; Sticky Trapping</span>
                  </div>
                </div>

                {/* Cervical Plan B Mucus */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-xl shrink-0">
                    🍯
                  </div>
                  <div>
                    <h4 className="font-extrabold text-teal-300 text-sm">Plan B Mucus Barrier</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Hyper-dense progestin mucus mesh at the cervical os. Traps 99% of swimmers in biological quicksand.
                    </p>
                    <span className="text-[10px] text-amber-400 font-mono mt-1 block">Muscular Peristalsis Quicksand</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PENILE LEAP */}
          {activeTab === 'LEAP' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-500/40">
                <div className="flex items-center gap-2 text-sky-300 font-black text-sm">
                  <Crosshair className="w-5 h-5 animate-spin" />
                  <span>THE SLOW-MOTION OPEN-AIR EJACULATION LEAP</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  When you reach Zone 5 (Urethra &amp; Glans), peristaltic pressure builds up! As you blast out of the penis into the open air, time slows down into <strong>Bullet-Time Slow Motion (0.35x speed)</strong> so you have full control to steer your flight trajectory.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-700 text-center">
                  <span className="text-3xl block mb-1">🧦</span>
                  <strong className="text-rose-400 text-xs block font-bold">STEER HARD LEFT:</strong>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Comical Miss: Lands in the <strong>College Dorm Sock Void</strong>! Instant detour bounce.
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-400 text-center shadow-lg shadow-emerald-500/20">
                  <span className="text-3xl block mb-1">🎯</span>
                  <strong className="text-emerald-300 text-xs block font-black">CENTER TARGET (GOAL!):</strong>
                  <span className="text-[11px] text-emerald-200 block mt-1">
                    Direct hit into the <strong>Vaginal Canal</strong>! +2,000 Precision Bonus &amp; advance to the cervix!
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-700 text-center">
                  <span className="text-3xl block mb-1">🎈</span>
                  <strong className="text-amber-400 text-xs block font-bold">STEER HARD RIGHT:</strong>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Trap Hit: Lands on the <strong>Trojan Latex Barrier</strong>! Bounces into comedic spin.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UPGRADES */}
          {activeTab === 'UPGRADES' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-200">
                <strong>Cell Evolution Lab:</strong> Every Gold ATP Gem collected and Rival KO earns points you can spend on permanent biological upgrades between runs!
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <strong className="text-sm font-bold text-white block">Flagellum Turbo Whip</strong>
                      <span className="text-xs text-slate-400">Boosts base swim speed and tightens steering response.</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+15% Speed / Lvl</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔋</span>
                    <div>
                      <strong className="text-sm font-bold text-white block">Mitochondrial Reactor</strong>
                      <span className="text-xs text-slate-400">Expands ATP stamina tank so you can boost and ram longer.</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+20% Stamina / Lvl</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <strong className="text-sm font-bold text-white block">Hardened Acrosome Helmet</strong>
                      <span className="text-xs text-slate-400">Toughens cell enzyme cap for devastating rival knockout rams.</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+35% Ram Force / Lvl</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧪</span>
                    <div>
                      <strong className="text-sm font-bold text-white block">Alkaline Bio-Membrane</strong>
                      <span className="text-xs text-slate-400">Reduces incoming damage from vaginal acid and spermicides.</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">-20% Acid Dmg / Lvl</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧭</span>
                    <div>
                      <strong className="text-sm font-bold text-white block">Chemotaxis Radar Magnet</strong>
                      <span className="text-xs text-slate-400">Expands magnetic attraction radius to vacuum gems effortlessly.</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+30% Magnet / Lvl</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400">
            Controls: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">WASD / Arrows</kbd> to steer &middot; <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Space</kbd> to Boost &amp; Ram
          </div>

          <div className="flex items-center gap-3">
            {onStartJourney ? (
              <button
                onClick={() => {
                  onClose();
                  onStartJourney();
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>LET'S SWIM!</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all cursor-pointer"
              >
                GOT IT, CLOSE GUIDE
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
