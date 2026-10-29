/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Flame } from 'lucide-react';

interface TouchControlsProps {
  onSteer: (x: number, y: number) => void;
  onBoost: (active: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onSteer, onBoost }) => {
  const [touchActive, setTouchActive] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const isTouchingRef = useRef(false);

  // Check if touch device
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    isTouchingRef.current = true;
    setTouchActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchingRef.current || !baseRef.current) return;
    const touch = e.touches[0];
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const maxRadius = rect.width / 2;

    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxRadius);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * dist;
    const clampedY = Math.sin(angle) * dist;

    setStickPos({ x: clampedX, y: clampedY });
    // Inverted Y for screen coordinates (up is negative Y on screen, but positive Y steer in game)
    onSteer(clampedX / maxRadius, -clampedY / maxRadius);
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    setTouchActive(false);
    setStickPos({ x: 0, y: 0 });
    onSteer(0, 0);
  };

  if (!isTouchDevice) return null;

  return (
    <div className="absolute inset-x-0 bottom-6 px-6 pointer-events-none z-20 flex justify-between items-end select-none">
      {/* Virtual Joystick */}
      <div
        ref={baseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-28 h-28 rounded-full bg-slate-900/60 border-2 border-slate-700/60 pointer-events-auto relative flex items-center justify-center touch-none shadow-2xl backdrop-blur-none"
      >
        <div
          className="w-12 h-12 rounded-full bg-rose-500/80 border-2 border-white shadow-lg pointer-events-none transition-transform duration-75"
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          }}
        />
      </div>

      {/* Virtual Boost Button */}
      <button
        onTouchStart={() => onBoost(true)}
        onTouchEnd={() => onBoost(false)}
        className="w-20 h-20 rounded-full bg-amber-500/80 active:bg-amber-400 border-2 border-amber-300 pointer-events-auto flex flex-col items-center justify-center text-white shadow-2xl touch-none select-none cursor-pointer"
      >
        <Flame className="w-7 h-7" />
        <span className="text-[10px] font-black uppercase tracking-wider">BOOST</span>
      </button>
    </div>
  );
};
