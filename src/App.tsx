/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import {
  GameStatus,
  LevelResult,
  PlayerStats,
  ANATOMICAL_ZONES,
  AnatomicalZone,
  PlayerUpgrades,
} from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { GameHud } from './components/GameHud';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { TouchControls } from './components/TouchControls';
import { SurvivalGuideModal } from './components/SurvivalGuideModal';
import { UpgradeShopModal } from './components/UpgradeShopModal';

interface FloatingMessage {
  id: number;
  text: string;
  type: 'GOOD' | 'BAD' | 'COMBAT' | 'LEAP';
}

const DEFAULT_UPGRADES: PlayerUpgrades = {
  tailPower: 0,
  atpTank: 0,
  acrosomeArmor: 0,
  alkalineShield: 0,
  chemotaxisMagnet: 0,
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE');
  const [unlockedZone, setUnlockedZone] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('micro_odyssey_unlocked_zone');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [savedPoints, setSavedPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('micro_odyssey_atp_points');
      return saved ? parseInt(saved, 10) : 500; // 500 initial ATP points so player can try an upgrade right away!
    } catch {
      return 500;
    }
  });

  const [playerUpgrades, setPlayerUpgrades] = useState<PlayerUpgrades>(() => {
    try {
      const saved = localStorage.getItem('micro_odyssey_upgrades');
      return saved ? JSON.parse(saved) : DEFAULT_UPGRADES;
    } catch {
      return DEFAULT_UPGRADES;
    }
  });

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isUpgradesOpen, setIsUpgradesOpen] = useState<boolean>(false);

  const [currentZoneIdx, setCurrentZoneIdx] = useState<number>(0);
  const [levelResult, setLevelResult] = useState<LevelResult | null>(null);
  const [gameOverScore, setGameOverScore] = useState<number>(0);
  const [showPenileLaunchBanner, setShowPenileLaunchBanner] = useState<boolean>(false);
  const [isLeaping, setIsLeaping] = useState<boolean>(false);
  const [leapResult, setLeapResult] = useState<{ hitTarget: boolean | null; detourName: string }>({
    hitTarget: null,
    detourName: '',
  });

  const [floatingMessages, setFloatingMessages] = useState<FloatingMessage[]>([]);

  const addFloatingMessage = useCallback((text: string, type: 'GOOD' | 'BAD' | 'COMBAT' | 'LEAP') => {
    const id = Date.now() + Math.random();
    setFloatingMessages((prev) => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setFloatingMessages((prev) => prev.filter((m) => m.id !== id));
    }, 2800);
  }, []);

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    stamina: 100,
    speed: 38,
    progress: 0,
    totalDistanceTraveled: 0,
    fructoseCollected: 0,
    energySpheresCollected: 0,
    shieldsCollected: 0,
    crystalsCollected: 0,
    obstaclesAvoided: 0,
    rivalsKnockedOut: 0,
    trapsAvoided: 0,
    racePosition: 100,
    totalRacers: 100,
    currentZoneIndex: 0,
    isBoosting: false,
    score: 0,
    combo: 0,
    activePowerUps: { energy: 0, shield: 0, guidance: 0 },
    invulnerableTimer: 0,
    currentFluidSurge: 0,
    inSlowMotion: false,
    activeUpgrades: playerUpgrades,
  });

  // Save points to localStorage
  const updatePoints = useCallback((delta: number) => {
    setSavedPoints((prev) => {
      const next = Math.max(0, prev + delta);
      try {
        localStorage.setItem('micro_odyssey_atp_points', next.toString());
      } catch {}
      return next;
    });
  }, []);

  // Handle buying an upgrade
  const handleBuyUpgrade = useCallback((key: keyof PlayerUpgrades, cost: number) => {
    setPlayerUpgrades((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      try {
        localStorage.setItem('micro_odyssey_upgrades', JSON.stringify(next));
      } catch {}
      if (engineRef.current) {
        engineRef.current.applyUpgrades(next);
      }
      return next;
    });
    updatePoints(-cost);
  }, [updatePoints]);

  // Initialize Three.js Engine once on mount inside dedicated ref container
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(canvasMountRef.current, {
      onStatsUpdate: (stats) => {
        setPlayerStats(stats);
      },
      onZoneChange: (zone: AnatomicalZone) => {
        setCurrentZoneIdx(zone.id - 1);
        setUnlockedZone((prev) => {
          const updated = Math.max(prev, zone.id - 1);
          try {
            localStorage.setItem('micro_odyssey_unlocked_zone', updated.toString());
          } catch {}
          return updated;
        });
      },
      onPenileLaunch: () => {
        setShowPenileLaunchBanner(true);
        setTimeout(() => setShowPenileLaunchBanner(false), 4500);
      },
      onLeapUpdate: (leaping, hitTarget, detourName) => {
        setIsLeaping(leaping);
        setLeapResult({ hitTarget, detourName });
      },
      onFloatingNotification: (text, type) => {
        addFloatingMessage(text, type);
      },
      onGameOver: (score, zoneIdx) => {
        setGameOverScore(score);
        setCurrentZoneIdx(zoneIdx);
        setGameStatus('GAMEOVER');
        updatePoints(Math.round(score * 0.25));
      },
      onVictory: (result) => {
        setLevelResult(result);
        setGameStatus('VICTORY');
        updatePoints(result.score);
      },
    });

    engine.applyUpgrades(playerUpgrades);
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [addFloatingMessage, updatePoints, playerUpgrades]);

  // Handle Journey Start
  const handleStartGame = useCallback((zoneIndex: number) => {
    setCurrentZoneIdx(zoneIndex);
    if (engineRef.current) {
      engineRef.current.applyUpgrades(playerUpgrades);
      engineRef.current.startJourney(zoneIndex);
    }
    setGameStatus('PLAYING');
  }, [playerUpgrades]);

  // Handle Pause / Resume
  const handlePause = useCallback(() => {
    if (engineRef.current) {
      const isPaused = engineRef.current.togglePause();
      setGameStatus(isPaused ? 'PAUSED' : 'PLAYING');
    }
  }, []);

  const handleResume = useCallback(() => {
    if (engineRef.current && engineRef.current.isGamePaused()) {
      engineRef.current.togglePause();
    }
    setGameStatus('PLAYING');
  }, []);

  const handleRestartJourney = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.applyUpgrades(playerUpgrades);
      engineRef.current.startJourney(currentZoneIdx);
    }
    setGameStatus('PLAYING');
  }, [currentZoneIdx, playerUpgrades]);

  const handleReturnTitle = useCallback(() => {
    setGameStatus('TITLE');
  }, []);

  // Keyboard shortcut to start from Title
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameStatus === 'TITLE' && !isGuideOpen && !isUpgradesOpen) {
        if (e.code === 'Space' || e.code === 'Enter') {
          handleStartGame(0);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStatus, isGuideOpen, isUpgradesOpen, handleStartGame]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-['Outfit',sans-serif]">
      {/* Isolated Three.js WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Title Screen Overlay */}
      {gameStatus === 'TITLE' && (
        <TitleScreen
          onStartGame={handleStartGame}
          unlockedZone={unlockedZone}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenUpgrades={() => setIsUpgradesOpen(true)}
          savedPoints={savedPoints}
          upgrades={playerUpgrades}
        />
      )}

      {/* In-Game HUD */}
      {gameStatus === 'PLAYING' && (
        <>
          <GameHud
            stats={playerStats}
            onPause={handlePause}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenUpgrades={() => setIsUpgradesOpen(true)}
            showPenileLaunchBanner={showPenileLaunchBanner}
            isLeaping={isLeaping}
            leapResult={leapResult}
            floatingMessages={floatingMessages}
          />
          <TouchControls
            onSteer={(x, y) => engineRef.current?.setVirtualSteer(x, y)}
            onBoost={(active) => engineRef.current?.setVirtualBoost(active)}
          />
        </>
      )}

      {/* Pause Modal */}
      {gameStatus === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestartLevel={handleRestartJourney}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'GAMEOVER' && (
        <GameOverModal
          score={gameOverScore}
          levelIndex={currentZoneIdx}
          onRetry={handleRestartJourney}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Grand Conception Victory Modal */}
      {gameStatus === 'VICTORY' && levelResult && (
        <VictoryModal
          result={levelResult}
          onPlayAgain={() => handleStartGame(0)}
        />
      )}

      {/* Survival Guide Modal */}
      <SurvivalGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onStartJourney={gameStatus === 'TITLE' ? () => handleStartGame(0) : undefined}
      />

      {/* Evolution Upgrades Modal */}
      <UpgradeShopModal
        isOpen={isUpgradesOpen}
        onClose={() => setIsUpgradesOpen(false)}
        upgrades={playerUpgrades}
        points={savedPoints}
        onBuyUpgrade={handleBuyUpgrade}
      />
    </div>
  );
}
