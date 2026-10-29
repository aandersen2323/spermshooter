/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Procedurally generates an organic cellular wall texture with subtle cell outlines and veinlets
 */
export function createCellularTexture(colorBase: string, cellOutlineColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = colorBase;
  ctx.fillRect(0, 0, 512, 512);

  const numCells = 120;
  for (let i = 0; i < numCells; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 16 + Math.random() * 32;

    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = cellOutlineColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Mucosal streaks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 3;
  for (let y = 0; y < 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(128, y + 10, 384, y - 10, 512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 32);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Glowing circular particle texture
 */
export function createGlowParticleTexture(tint = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const cx = 64;
  const cy = 64;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
  grad.addColorStop(0, tint);
  grad.addColorStop(0.35, tint);
  grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Sparkling golden starburst texture for ATP Gems (Unmistakable GOOD collection visual!)
 */
export function createGoldenGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const cx = 64;
  const cy = 64;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, '#fef08a');
  grad.addColorStop(0.6, 'rgba(234, 179, 8, 0.6)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  // 4-point golden star flare
  ctx.strokeStyle = '#fffbeb';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy);
  ctx.lineTo(cx + 50, cy);
  ctx.moveTo(cx, cy - 50);
  ctx.lineTo(cx, cy + 50);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Danger Warning Zone Decal Texture (Pulsing spiky hazard ring on floor)
 */
export function createDangerDecalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const cx = 128;
  const cy = 128;

  // Outer red glow
  const grad = ctx.createRadialGradient(cx, cy, 60, cx, cy, 124);
  grad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
  grad.addColorStop(0.7, 'rgba(220, 38, 38, 0.3)');
  grad.addColorStop(1, 'rgba(153, 27, 27, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Spiky hazard teeth ring
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 5;
  ctx.beginPath();
  const numTeeth = 16;
  for (let i = 0; i < numTeeth * 2; i++) {
    const angle = (i * Math.PI) / numTeeth;
    const r = i % 2 === 0 ? 98 : 78;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Ribbed Latex Pattern Texture (For the male condom blocker)
 */
export function createLatexRibTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 8;
  for (let y = 0; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Nonoxynol-9 Spermicide Toxic Foam Texture
 */
export function createFoamBubbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(163, 230, 53, 0.2)';
  ctx.fillRect(0, 0, 256, 256);

  // Toxic effervescent bubbles
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 8 + Math.random() * 18;

    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(190, 242, 100, 0.4)');
    grad.addColorStop(1, 'rgba(101, 163, 13, 0.8)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bef264';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
