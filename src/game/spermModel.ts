/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { PlayerUpgrades } from '../types/game';

export interface SpermModelInstance {
  group: THREE.Group;
  update: (
    delta: number,
    isBoosting: boolean,
    steerX: number,
    steerY: number,
    speedRatio: number,
    powerUps?: { energy: number; shield: number; guidance: number },
    upgrades?: PlayerUpgrades
  ) => void;
  triggerHitSquash: () => void;
  triggerSpinOut: () => void;
  triggerTailWhipAttack: () => void;
  isSpinningOut: () => boolean;
  dispose: () => void;
  getHeadPosition: (out: THREE.Vector3) => THREE.Vector3;
}

export function createCartoonSperm(isHero = true, baseHue = 0.55): SpermModelInstance {
  const root = new THREE.Group();

  // 1. Primary Head (Nucleus)
  const headGeo = new THREE.SphereGeometry(1.2, 32, 24);
  headGeo.scale(0.85, 0.75, 1.4);

  const headColor = isHero ? 0xf8fafc : new THREE.Color().setHSL(baseHue, 0.65, 0.82).getHex();
  const headMat = new THREE.MeshPhysicalMaterial({
    color: headColor,
    roughness: 0.18,
    metalness: 0.05,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    reflectivity: 0.8,
  });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  root.add(headMesh);

  // 2. Acrosome Cap (protective enzyme hood on front tip)
  const capGeo = new THREE.SphereGeometry(0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
  capGeo.scale(0.9, 0.8, 1.0);
  capGeo.rotateX(Math.PI / 2);
  const capColor = isHero ? 0x38bdf8 : new THREE.Color().setHSL(baseHue, 0.85, 0.55).getHex();
  const capMat = new THREE.MeshPhysicalMaterial({
    color: capColor,
    roughness: 0.35,
    metalness: 0.2,
    transmission: 0.2,
    transparent: true,
    opacity: 0.85,
    emissive: capColor,
    emissiveIntensity: 0.35,
  });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.set(0, 0, 0.7);
  headMesh.add(capMesh);

  // 3. Cartoon Eyes
  const eyeGroup = new THREE.Group();
  headMesh.add(eyeGroup);

  const eyeWhiteGeo = new THREE.SphereGeometry(0.32, 16, 16);
  eyeWhiteGeo.scale(1.0, 1.2, 0.7);
  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
  });

  const pupilGeo = new THREE.SphereGeometry(0.16, 14, 14);
  pupilGeo.scale(1.0, 1.1, 0.5);
  const pupilMat = new THREE.MeshBasicMaterial({ color: isHero ? 0x0f172a : 0x7f1d1d });

  const highlightGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Left Eye
  const leftEye = new THREE.Group();
  const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.set(0, 0, 0.2);
  const leftHighlight = new THREE.Mesh(highlightGeo, highlightMat);
  leftHighlight.position.set(0.05, 0.05, 0.28);
  leftEye.add(leftEyeWhite, leftPupil, leftHighlight);
  leftEye.position.set(-0.45, 0.32, 0.6);
  leftEye.rotation.y = -0.2;

  // Right Eye
  const rightEye = new THREE.Group();
  const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  rightPupil.position.set(0, 0, 0.2);
  const rightHighlight = new THREE.Mesh(highlightGeo, highlightMat);
  rightHighlight.position.set(0.05, 0.05, 0.28);
  rightEye.add(rightEyeWhite, rightPupil, rightHighlight);
  rightEye.position.set(0.45, 0.32, 0.6);
  rightEye.rotation.y = 0.2;

  eyeGroup.add(leftEye, rightEye);

  // Rivals have competitive angled brows
  if (!isHero) {
    const browGeo = new THREE.BoxGeometry(0.35, 0.06, 0.05);
    const browMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.45, 0.56, 0.7);
    leftBrow.rotation.z = -0.25;

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.45, 0.56, 0.7);
    rightBrow.rotation.z = 0.25;
    eyeGroup.add(leftBrow, rightBrow);
  } else {
    // Hero cheeks
    const cheekGeo = new THREE.CircleGeometry(0.18, 16);
    const cheekMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.62, 0.02, 0.55);
    leftCheek.rotation.y = -Math.PI / 3;

    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.62, 0.02, 0.55);
    rightCheek.rotation.y = Math.PI / 3;
    eyeGroup.add(leftCheek, rightCheek);
  }

  // 4. Midpiece (Centriole & Mitochondria Spiral Engine)
  const midpieceGeo = new THREE.CylinderGeometry(0.38, 0.3, 1.1, 16);
  midpieceGeo.rotateX(Math.PI / 2);
  const midpieceMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.45,
    metalness: 0.6,
  });
  const midpieceMesh = new THREE.Mesh(midpieceGeo, midpieceMat);
  midpieceMesh.position.set(0, 0, -1.5);
  headMesh.add(midpieceMesh);

  // Helix spiral rings (mitochondria)
  const helixCount = 5;
  const helixMeshes: THREE.Mesh[] = [];
  const helixGeo = new THREE.TorusGeometry(0.42, 0.07, 10, 24);
  const helixMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });

  for (let i = 0; i < helixCount; i++) {
    const ring = new THREE.Mesh(helixGeo, helixMat);
    ring.position.set(0, 0, -0.4 + i * 0.22);
    ring.rotation.x = 0.25;
    midpieceMesh.add(ring);
    helixMeshes.push(ring);
  }

  // 5. Undulating Flagellum Tail (14 segments)
  const tailSegmentsCount = 14;
  const tailSegments: THREE.Group[] = [];
  let currentParent: THREE.Group | THREE.Object3D = midpieceMesh;

  const baseTailRadius = 0.24;
  for (let i = 0; i < tailSegmentsCount; i++) {
    const segGroup = new THREE.Group();
    segGroup.position.set(0, 0, i === 0 ? -0.55 : -0.7);

    const rTop = baseTailRadius * Math.max(0.15, 1 - (i / tailSegmentsCount) * 0.85);
    const rBottom = baseTailRadius * Math.max(0.1, 1 - ((i + 1) / tailSegmentsCount) * 0.85);
    const segGeo = new THREE.CylinderGeometry(rBottom, rTop, 0.75, 12);
    segGeo.rotateX(Math.PI / 2);

    const segMat = new THREE.MeshStandardMaterial({
      color: isHero ? 0xf1f5f9 : 0xcbd5e1,
      roughness: 0.35,
      metalness: 0.08,
    });
    const segMesh = new THREE.Mesh(segGeo, segMat);
    segMesh.position.set(0, 0, -0.37);
    segMesh.castShadow = true;
    segGroup.add(segMesh);

    currentParent.add(segGroup);
    tailSegments.push(segGroup);
    currentParent = segGroup;
  }

  // 6. Dizzy stars effect (when spinning out)
  const dizzyStarsGroup = new THREE.Group();
  const starGeo = new THREE.OctahedronGeometry(0.25, 0);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  for (let s = 0; s < 3; s++) {
    const star = new THREE.Mesh(starGeo, starMat);
    const a = (s * Math.PI * 2) / 3;
    star.position.set(Math.cos(a) * 0.9, 0.9, Math.sin(a) * 0.9);
    dizzyStarsGroup.add(star);
  }
  dizzyStarsGroup.visible = false;
  headMesh.add(dizzyStarsGroup);

  // 7. Power-up visuals
  let shieldMesh: THREE.Mesh | null = null;
  let guidanceGroup: THREE.Group | null = null;
  let guidanceCrystal: THREE.Mesh | null = null;

  if (isHero) {
    const shieldGeo = new THREE.SphereGeometry(2.5, 24, 24);
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x2dd4bf,
      emissive: 0x0f766e,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.55,
    });
    shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.visible = false;

    const shieldRingGeo = new THREE.TorusGeometry(2.6, 0.06, 12, 32);
    const shieldRingMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.8 });
    shieldMesh.add(new THREE.Mesh(shieldRingGeo, shieldRingMat));
    root.add(shieldMesh);

    guidanceGroup = new THREE.Group();
    const guidanceCrystalGeo = new THREE.OctahedronGeometry(0.65, 0);
    const guidanceCrystalMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 1.1,
      roughness: 0.1,
    });
    guidanceCrystal = new THREE.Mesh(guidanceCrystalGeo, guidanceCrystalMat);
    guidanceGroup.add(guidanceCrystal);

    const arrowGeo = new THREE.ConeGeometry(0.3, 1.2, 8);
    arrowGeo.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xd8b4fe, transparent: true, opacity: 0.8 });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowMesh.position.set(0, 0, 1.8);
    guidanceGroup.add(arrowMesh);

    guidanceGroup.position.set(0, 1.4, 1.2);
    guidanceGroup.visible = false;
    root.add(guidanceGroup);
  }

  // Animation Kinematics
  let swimTime = 0;
  let squashTimer = 0;
  let blinkTimer = Math.random() * 3 + 2;
  let spinOutTimer = 0;
  let tailWhipTimer = 0;

  const triggerHitSquash = () => {
    squashTimer = 1.0;
  };

  const triggerSpinOut = () => {
    spinOutTimer = 1.4;
    dizzyStarsGroup.visible = true;
  };

  const triggerTailWhipAttack = () => {
    tailWhipTimer = 0.4;
  };

  const isSpinningOut = () => spinOutTimer > 0;

  const update = (
    delta: number,
    isBoosting: boolean,
    steerX: number,
    steerY: number,
    speedRatio: number,
    powerUps?: { energy: number; shield: number; guidance: number },
    upgrades?: PlayerUpgrades
  ) => {
    if (spinOutTimer > 0) {
      spinOutTimer -= delta;
      root.rotation.z += delta * 18;
      root.rotation.y += delta * 12;
      dizzyStarsGroup.rotation.y += delta * 10;
      if (spinOutTimer <= 0) {
        dizzyStarsGroup.visible = false;
        root.rotation.z = 0;
        root.rotation.y = 0;
      }
      return;
    }

    const hasEnergy = (powerUps?.energy ?? 0) > 0;
    const hasShield = (powerUps?.shield ?? 0) > 0;
    const hasGuidance = (powerUps?.guidance ?? 0) > 0;

    // Upgrades boost visual effect
    const tailLvl = upgrades?.tailPower ?? 0;
    const armorLvl = upgrades?.acrosomeArmor ?? 0;

    if (armorLvl > 0 && isHero) {
      capMat.color.setHex(0xf59e0b);
      capMat.emissive.setHex(0xd97706);
      capMat.emissiveIntensity = 0.7 + armorLvl * 0.1;
    }

    const boostMultiplier = isBoosting || hasEnergy ? 1.8 : 1.0;
    const baseFreq = (5.5 + speedRatio * 5.0 + tailLvl * 0.8) * boostMultiplier;
    swimTime += delta * baseFreq;

    const waveLength = 0.55;
    let baseAmp = 0.28 * (isBoosting || hasEnergy ? 1.4 : 1.0);

    if (tailWhipTimer > 0) {
      tailWhipTimer -= delta;
      baseAmp *= 3.0;
      root.rotation.z += delta * 20;
    }

    for (let i = 0; i < tailSegments.length; i++) {
      const seg = tailSegments[i];
      const phase = swimTime - i * waveLength;
      seg.rotation.y = Math.sin(phase) * baseAmp * (1 + (i / tailSegments.length) * 0.6);
      seg.rotation.x = Math.cos(phase * 0.9) * (baseAmp * 0.45);
      seg.rotation.z = Math.sin(phase * 0.5) * 0.1;
    }

    // Squash & Stretch
    if (squashTimer > 0) {
      squashTimer -= delta * 3.5;
      const squashVal = Math.sin(Math.max(0, squashTimer) * Math.PI);
      headMesh.scale.set(1.2 + squashVal * 0.3, 1.2 + squashVal * 0.3, 0.8 - squashVal * 0.4);
    } else {
      const swimStretch = Math.sin(swimTime * 0.5) * 0.04;
      const boostStretch = isBoosting || hasEnergy ? 0.25 : 0;
      headMesh.scale.set(
        1.0 - boostStretch * 0.12 - swimStretch,
        1.0 - boostStretch * 0.12 - swimStretch,
        1.0 + boostStretch * 0.3 + swimStretch * 1.5
      );
    }

    if (shieldMesh) {
      if (hasShield) {
        shieldMesh.visible = true;
        shieldMesh.rotation.y += delta * 2;
        shieldMesh.rotation.x += delta * 1.5;
        const pulse = 1.0 + Math.sin(swimTime * 3) * 0.05;
        shieldMesh.scale.set(pulse, pulse, pulse);
      } else {
        shieldMesh.visible = false;
      }
    }

    if (guidanceGroup && guidanceCrystal) {
      if (hasGuidance) {
        guidanceGroup.visible = true;
        guidanceCrystal.rotation.y += delta * 4;
        guidanceGroup.position.y = 1.4 + Math.sin(swimTime * 2) * 0.15;
      } else {
        guidanceGroup.visible = false;
      }
    }

    // Eye pupil steering
    const targetPupilX = THREE.MathUtils.clamp(steerX * 0.1, -0.09, 0.09);
    const targetPupilY = THREE.MathUtils.clamp(steerY * 0.1, -0.09, 0.09);
    leftPupil.position.x = targetPupilX;
    leftPupil.position.y = targetPupilY;
    rightPupil.position.x = targetPupilX;
    rightPupil.position.y = targetPupilY;

    // Blinking
    blinkTimer -= delta;
    if (blinkTimer <= 0) {
      eyeWhiteGeo.scale(1, 0.1, 1);
      setTimeout(() => eyeWhiteGeo.scale(1, 10, 1), 120);
      blinkTimer = Math.random() * 4 + 2.5;
    }

    // Mitochondria power core flare
    const targetEmissive = isBoosting || hasEnergy ? 2.0 : 0.5 + Math.sin(swimTime * 2) * 0.2;
    helixMat.emissiveIntensity = THREE.MathUtils.lerp(helixMat.emissiveIntensity, targetEmissive, delta * 10);
    helixMeshes.forEach((ring, idx) => {
      ring.rotation.z += delta * (isBoosting || hasEnergy ? 14 : 3) * (idx % 2 === 0 ? 1 : -1);
    });

    headMesh.rotation.y = Math.sin(swimTime) * 0.08 * (isBoosting ? 0.6 : 1.0);
    headMesh.rotation.x = Math.cos(swimTime * 0.5) * 0.04;
  };

  const getHeadPosition = (out: THREE.Vector3) => {
    headMesh.getWorldPosition(out);
    return out;
  };

  const dispose = () => {
    headGeo.dispose();
    headMat.dispose();
    capGeo.dispose();
    capMat.dispose();
    eyeWhiteGeo.dispose();
    eyeWhiteMat.dispose();
    pupilGeo.dispose();
    pupilMat.dispose();
    highlightGeo.dispose();
    highlightMat.dispose();
    midpieceGeo.dispose();
    midpieceMat.dispose();
    helixGeo.dispose();
    helixMat.dispose();
    starGeo.dispose();
    starMat.dispose();
  };

  return {
    group: root,
    update,
    triggerHitSquash,
    triggerSpinOut,
    triggerTailWhipAttack,
    isSpinningOut,
    dispose,
    getHeadPosition,
  };
}
