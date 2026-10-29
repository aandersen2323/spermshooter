/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ANATOMICAL_ZONES, AnatomicalZone, PowerUpType, HazardType } from '../types/game';
import {
  createCellularTexture,
  createGlowParticleTexture,
  createGoldenGlowTexture,
  createDangerDecalTexture,
  createLatexRibTexture,
  createFoamBubbleTexture,
} from './proceduralAssets';
import { createCartoonSperm, SpermModelInstance } from './spermModel';

export interface PickupItem {
  id: number;
  type: 'FRUCTOSE' | PowerUpType;
  position: THREE.Vector3;
  mesh: THREE.Object3D;
  collected: boolean;
  radius: number;
  zoneIndex: number;
}

export interface HazardItem {
  id: number;
  type: HazardType;
  position: THREE.Vector3;
  basePos: THREE.Vector3;
  mesh: THREE.Object3D;
  radius: number;
  wanderPhase: number;
  patrolSpeed: number;
  zoneIndex: number;
  isChasing?: boolean;
  aggression: number;
  valveCycle?: number;
  isOpen?: boolean;
  aperture?: number;
  valveLeaves?: THREE.Mesh[];
  surgeDirection?: number;
  surgeStrength?: number;
}

export interface RivalSperm {
  id: number;
  name: string;
  instance: SpermModelInstance;
  t: number;
  laneOffset: THREE.Vector2;
  speed: number;
  radius: number;
  isSpinning: boolean;
  spinTimer: number;
  isAggressive: boolean;
  isEggDefender?: boolean;
}

export interface EjaculationLeapState {
  isActive: boolean;
  hasEvaluated: boolean;
  hitTarget: boolean;
  detourName: string;
}

export interface WorldData {
  trackCurve: THREE.CatmullRomCurve3;
  totalLength: number;
  tunnelMesh: THREE.Mesh;
  penisExitMesh: THREE.Group;
  vaginaEntranceMesh: THREE.Group;
  seminalBlastParticles: THREE.Points;
  sockDetourGroup: THREE.Group;
  condomDetourGroup: THREE.Group;
  pickups: PickupItem[];
  hazards: HazardItem[];
  rivals: RivalSperm[];
  eggGroup: THREE.Group;
  ciliaGroup: THREE.Group;
  guidanceLineMesh: THREE.Line;
  update: (
    delta: number,
    playerPos: THREE.Vector3,
    playerProgressT: number,
    playerIsBoosting: boolean,
    hasShield: boolean,
    hasGuidance: boolean,
    magnetRadius: number,
    lateralX: number,
    lateralY: number
  ) => {
    hitHazard: HazardItem | null;
    collectedPickup: PickupItem | null;
    activeSurge: number;
    avoidedHazardsCount: number;
    rammedRival: RivalSperm | null;
    rivalPassedCount: number;
    currentZone: AnatomicalZone;
    justCrossedPenisExit: boolean;
    leapState: EjaculationLeapState;
  };
  dispose: () => void;
}

export function generateWorld(scene: THREE.Scene): WorldData {
  // 1. Long, Expansive Continuous Anatomical Spline (11 Zones over 95 control points)
  const points: THREE.Vector3[] = [];
  const numControlPoints = 95;

  for (let i = 0; i < numControlPoints; i++) {
    const fraction = i / (numControlPoints - 1);
    let x = 0;
    let y = 0;
    let z = -i * 72; // Much longer track length

    // Zone 1: Seminiferous Nursery (0.0 to 0.12)
    if (fraction < 0.12) {
      x = Math.sin(i * 1.4) * 24;
      y = Math.cos(i * 1.1) * 20;
    }
    // Zone 2: Epididymis Training Coils (0.12 to 0.24)
    else if (fraction < 0.24) {
      x = Math.sin(i * 1.8) * 28;
      y = 10 + Math.cos(i * 1.4) * 22;
    }
    // Zone 3: Vas Deferens Muscle Highway (0.24 to 0.35)
    else if (fraction < 0.35) {
      x = Math.sin(i * 0.6) * 32;
      y = 25 + Math.sin(i * 0.7) * 28;
    }
    // Zone 4: Prostate & Seminal Caverns (0.35 to 0.43)
    else if (fraction < 0.43) {
      x = 10 + Math.sin(i * 0.5) * 22;
      y = 35 + Math.cos(i * 0.5) * 18;
    }
    // Zone 5: Penile Urethra (0.43 to 0.47)
    else if (fraction < 0.47) {
      x = Math.sin(i * 0.2) * 8;
      y = 40 + Math.cos(i * 0.2) * 6;
    }
    // Zone 6: THE GREAT OPEN-AIR LEAP (0.47 to 0.53) - Open flight trajectory
    else if (fraction < 0.53) {
      x = 0;
      y = 40;
    }
    // Zone 7: Vaginal Rugae & Contraceptive Maze (0.53 to 0.65)
    else if (fraction < 0.65) {
      x = -22 + Math.sin(i * 0.7) * 44;
      y = -10 + Math.cos(i * 0.5) * 36;
    }
    // Zone 8: Cervical Fortress & Plan B (0.65 to 0.76)
    else if (fraction < 0.76) {
      x = Math.sin(i * 0.9) * 26;
      y = 5 + Math.cos(i * 0.8) * 24;
    }
    // Zone 9: Uterine Cavern & Copper IUD (0.76 to 0.86)
    else if (fraction < 0.86) {
      x = Math.sin(i * 0.7) * 58;
      y = 20 + Math.cos(i * 0.6) * 48;
    }
    // Zone 10: Fallopian Cilia Rapids (0.86 to 0.94)
    else if (fraction < 0.94) {
      x = 44 + Math.sin(i * 0.95) * 28;
      y = -15 + Math.cos(i * 0.85) * 24;
    }
    // Zone 11: Corona Radiata & Golden Oocyte (0.94 to 1.0)
    else {
      x = 42 + Math.sin(i * 0.25) * 14;
      y = -15 + Math.cos(i * 0.25) * 14;
      z = -i * 78;
    }
    points.push(new THREE.Vector3(x, y, z));
  }

  const trackCurve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
  const totalLength = trackCurve.getLength();

  // 2. Generate the Morphing 3D Tube with Vertex Colors
  const tubularSegments = 700;
  const radialSegments = 24;

  const tunnelGeo = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const getAnatomicalRadiusAt = (t: number): number => {
    if (t < 0.12) return 18; // Testis
    if (t < 0.24) return 20; // Epididymis
    if (t < 0.35) return 22; // Vas Deferens
    if (t < 0.43) return 24; // Prostate
    if (t < 0.47) return 17; // Penile Urethra (narrow)
    if (t < 0.53) return 56; // Open-air leap
    if (t < 0.65) return 38; // Vagina (wide cavern)
    if (t < 0.76) return 22; // Cervix (constricted)
    if (t < 0.86) return 46; // Uterus (huge expansive chamber)
    if (t < 0.94) return 22; // Fallopian Tube
    return 60;               // Ovary Sanctuary
  };

  const getAnatomicalColorAt = (t: number, outColor: THREE.Color): THREE.Color => {
    if (t < 0.12) outColor.setRGB(0.96, 0.42, 0.52); // Soft coral
    else if (t < 0.24) outColor.setRGB(0.95, 0.25, 0.4); // Epididymis rose
    else if (t < 0.35) outColor.setRGB(0.65, 0.25, 0.85); // Vas muscle purple
    else if (t < 0.43) outColor.setRGB(0.2, 0.75, 0.98); // Seminal electric blue
    else if (t < 0.47) outColor.setRGB(0.0, 0.95, 1.0); // Glans cyan
    else if (t < 0.53) outColor.setRGB(0.08, 0.15, 0.35); // Open night sky
    else if (t < 0.65) outColor.setRGB(0.85, 0.18, 0.55); // Vaginal magenta
    else if (t < 0.76) outColor.setRGB(0.88, 0.12, 0.28); // Cervix ruby
    else if (t < 0.86) outColor.setRGB(0.75, 0.15, 0.82); // Uterus purple
    else if (t < 0.94) outColor.setRGB(0.96, 0.62, 0.1); // Fallopian amber
    else outColor.setRGB(0.98, 0.88, 0.45); // Celestial gold
    return outColor;
  };

  const tempColor = new THREE.Color();
  const upVec = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const center = trackCurve.getPointAt(t);
    const tangent = trackCurve.getTangentAt(t);
    const normal = new THREE.Vector3().crossVectors(tangent, upVec).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    const radius = getAnatomicalRadiusAt(t);
    getAnatomicalColorAt(t, tempColor);
    const isOpenAir = t >= 0.47 && t <= 0.53;

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const ripple = isOpenAir ? 1.0 : 1.0 + Math.sin(theta * 6 + t * 45) * 0.04;
      const effectiveRadius = radius * ripple;

      const cx = Math.cos(theta) * effectiveRadius;
      const cy = Math.sin(theta) * effectiveRadius;

      const vx = center.x + normal.x * cx + binormal.x * cy;
      const vy = center.y + normal.y * cx + binormal.y * cy;
      const vz = center.z + normal.z * cx + binormal.z * cy;

      vertices.push(vx, vy, vz);

      const nx = -(normal.x * Math.cos(theta) + binormal.x * Math.sin(theta));
      const ny = -(normal.y * Math.cos(theta) + binormal.y * Math.sin(theta));
      const nz = -(normal.z * Math.cos(theta) + binormal.z * Math.sin(theta));
      normals.push(nx, ny, nz);

      uvs.push(j / radialSegments, i / 25);
      colors.push(tempColor.r, tempColor.g, tempColor.b);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);

      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  tunnelGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  tunnelGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  tunnelGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  tunnelGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  tunnelGeo.setIndex(indices);

  const cellTexture = createCellularTexture('#ffffff', 'rgba(0, 0, 0, 0.22)');
  const tunnelMat = new THREE.MeshStandardMaterial({
    map: cellTexture,
    vertexColors: true,
    roughness: 0.5,
    metalness: 0.12,
    side: THREE.BackSide,
  });

  const tunnelMesh = new THREE.Mesh(tunnelGeo, tunnelMat);
  tunnelMesh.receiveShadow = true;
  scene.add(tunnelMesh);

  // 3. GLANS PENIS EXIT SPHINCTER & SEMINAL FIREWORKS (t = 0.47)
  const penisExitT = 0.47;
  const penisExitPos = trackCurve.getPointAt(penisExitT);
  const penisExitTangent = trackCurve.getTangentAt(penisExitT);

  const penisExitGroup = new THREE.Group();
  penisExitGroup.position.copy(penisExitPos);
  penisExitGroup.lookAt(penisExitPos.clone().add(penisExitTangent));

  // Organic Glans Nozzle Ring
  const glansNozzleGeo = new THREE.TorusGeometry(16, 3.5, 16, 32);
  const glansNozzleMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.4,
    roughness: 0.2,
    metalness: 0.3,
    clearcoat: 0.9,
  });
  const glansNozzleMesh = new THREE.Mesh(glansNozzleGeo, glansNozzleMat);
  penisExitGroup.add(glansNozzleMesh);
  scene.add(penisExitGroup);

  // Seminal Fluid Fireworks (220 glowing particles)
  const blastCount = 220;
  const blastGeo = new THREE.BufferGeometry();
  const blastPos: number[] = [];
  const blastVels: THREE.Vector3[] = [];

  for (let b = 0; b < blastCount; b++) {
    const rx = (Math.random() - 0.5) * 8;
    const ry = (Math.random() - 0.5) * 8;
    const rz = (Math.random() - 0.5) * 8;
    blastPos.push(penisExitPos.x + rx, penisExitPos.y + ry, penisExitPos.z + rz);
    blastVels.push(
      penisExitTangent.clone().multiplyScalar(30 + Math.random() * 35).add(
        new THREE.Vector3((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16)
      )
    );
  }
  blastGeo.setAttribute('position', new THREE.Float32BufferAttribute(blastPos, 3));
  const blastMat = new THREE.PointsMaterial({
    color: 0xe0f2fe,
    size: 2.4,
    map: createGlowParticleTexture('#38bdf8'),
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const seminalBlastParticles = new THREE.Points(blastGeo, blastMat);
  scene.add(seminalBlastParticles);

  // 4. THE OPEN-AIR LEAP: VAGINAL ENTRANCE (TARGET) & CONTRACEPTIVE DETOURS
  const vaginaEntranceT = 0.53;
  const vaginaEntrancePos = trackCurve.getPointAt(vaginaEntranceT);
  const vaginaEntranceTangent = trackCurve.getTangentAt(vaginaEntranceT);

  const vaginaEntranceGroup = new THREE.Group();
  vaginaEntranceGroup.position.copy(vaginaEntrancePos);
  vaginaEntranceGroup.lookAt(vaginaEntrancePos.clone().add(vaginaEntranceTangent));

  // Glowing Pink/Magenta Target Ring for Vaginal Canal Entrance
  const vaginaTargetRingGeo = new THREE.TorusGeometry(20, 2.8, 16, 32);
  const vaginaTargetRingMat = new THREE.MeshPhysicalMaterial({
    color: 0xf43f5e,
    emissive: 0xec4899,
    emissiveIntensity: 1.6,
    roughness: 0.2,
    clearcoat: 1.0,
  });
  const vaginaTargetRing = new THREE.Mesh(vaginaTargetRingGeo, vaginaTargetRingMat);
  vaginaEntranceGroup.add(vaginaTargetRing);

  // Glowing concentric aim guide
  const aimInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(11, 0.9, 12, 32),
    new THREE.MeshBasicMaterial({ color: 0xfde047, wireframe: true })
  );
  vaginaEntranceGroup.add(aimInnerRing);
  scene.add(vaginaEntranceGroup);

  // DETOUR 1 (LEFT): "THE BEDSHEETS / SOCK VOID"
  const sockDetourGroup = new THREE.Group();
  const sockNormal = new THREE.Vector3().crossVectors(vaginaEntranceTangent, upVec).normalize();
  const sockPos = vaginaEntrancePos.clone().addScaledVector(sockNormal, -30);
  sockDetourGroup.position.copy(sockPos);
  sockDetourGroup.lookAt(sockPos.clone().add(vaginaEntranceTangent));

  const sockMesh = new THREE.Mesh(
    new THREE.BoxGeometry(26, 26, 3),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 })
  );
  sockDetourGroup.add(sockMesh);
  scene.add(sockDetourGroup);

  // DETOUR 2 (RIGHT): "THE MALE CONDOM LATEX BARRIER"
  const condomDetourGroup = new THREE.Group();
  const condomPos = vaginaEntrancePos.clone().addScaledVector(sockNormal, 30);
  condomDetourGroup.position.copy(condomPos);
  condomDetourGroup.lookAt(condomPos.clone().add(vaginaEntranceTangent));

  const condomRibTex = createLatexRibTexture();
  const condomMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(14, 14, 2, 28),
    new THREE.MeshPhysicalMaterial({
      map: condomRibTex,
      color: 0xfef08a,
      emissive: 0xeab308,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.75,
    })
  );
  condomMesh.rotateX(Math.PI / 2);
  condomDetourGroup.add(condomMesh);
  scene.add(condomDetourGroup);

  // 5. Guidance Crystal Hologram Line
  const guidanceSamplePoints = trackCurve.getPoints(350);
  const guidanceLineGeo = new THREE.BufferGeometry().setFromPoints(guidanceSamplePoints);
  const guidanceLineMat = new THREE.LineBasicMaterial({
    color: 0xc084fc,
    transparent: true,
    opacity: 0.0,
  });
  const guidanceLineMesh = new THREE.Line(guidanceLineGeo, guidanceLineMat);
  scene.add(guidanceLineMesh);

  // 6. Fallopian Cilia Forest (Zone 10: t = 0.86 to 0.94)
  const ciliaGroup = new THREE.Group();
  scene.add(ciliaGroup);

  const ciliaGeo = new THREE.ConeGeometry(0.35, 6, 8);
  ciliaGeo.translate(0, 3, 0);
  const ciliaMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.4,
    metalness: 0.1,
  });

  const ciliaMeshes: { mesh: THREE.Mesh; phase: number }[] = [];
  const numCiliaRings = 50;
  for (let r = 0; r < numCiliaRings; r++) {
    const t = 0.86 + (r / numCiliaRings) * 0.08;
    const center = trackCurve.getPointAt(t);
    const tangent = trackCurve.getTangentAt(t);
    const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    const ciliaPerRing = 10;
    for (let c = 0; c < ciliaPerRing; c++) {
      const angle = (c / ciliaPerRing) * Math.PI * 2;
      const x = Math.cos(angle) * 20;
      const y = Math.sin(angle) * 20;

      const ciliaMesh = new THREE.Mesh(ciliaGeo, ciliaMat);
      const pos = center.clone().addScaledVector(normal, x).addScaledVector(binormal, y);
      ciliaMesh.position.copy(pos);
      ciliaMesh.lookAt(center);
      ciliaMesh.rotateX(Math.PI / 2);

      ciliaGroup.add(ciliaMesh);
      ciliaMeshes.push({ mesh: ciliaMesh, phase: Math.random() * Math.PI * 2 });
    }
  }

  // 7. PURE VISUAL GOOD ITEMS: GLOWING GOLDEN ATP GEMS & POWER-UPS (NO ANNOYING TEXT BADGES!)
  const pickups: PickupItem[] = [];
  const numItems = 150;

  const goldGlowTex = createGoldenGlowTexture();
  const fructoseGeo = new THREE.OctahedronGeometry(1.6, 0);
  const fructoseMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xeab308,
    emissiveIntensity: 0.95,
    roughness: 0.15,
    metalness: 0.85,
  });

  const energySphereGeo = new THREE.SphereGeometry(1.8, 16, 16);
  const energySphereMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });

  const shieldPickupGeo = new THREE.SphereGeometry(2.0, 16, 16);
  const shieldPickupMat = new THREE.MeshPhysicalMaterial({
    color: 0x2dd4bf,
    emissive: 0x0f766e,
    emissiveIntensity: 0.7,
    roughness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  const guidanceGeo = new THREE.OctahedronGeometry(1.9, 1);
  const guidanceMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0xa855f7,
    emissiveIntensity: 0.95,
    roughness: 0.15,
  });

  for (let i = 0; i < numItems; i++) {
    const t = 0.02 + (i / numItems) * 0.96;
    if (t >= 0.47 && t <= 0.53) continue; // Skip open air leap

    const center = trackCurve.getPointAt(t);
    const tangent = trackCurve.getTangentAt(t);
    const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    let zoneIdx = 0;
    for (let z = 0; z < ANATOMICAL_ZONES.length; z++) {
      if (t >= ANATOMICAL_ZONES[z].startT && t <= ANATOMICAL_ZONES[z].endT) {
        zoneIdx = z;
        break;
      }
    }

    const itemGroup = new THREE.Group();
    let type: 'FRUCTOSE' | PowerUpType = 'FRUCTOSE';

    if (i % 11 === 3) {
      type = 'ENERGY_SPHERE';
      const sphere = new THREE.Mesh(energySphereGeo, energySphereMat);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.14, 8, 24), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }));
      ring.rotation.x = Math.PI / 4;
      itemGroup.add(sphere, ring);
    } else if (i % 11 === 7) {
      type = 'SHIELD_BUBBLE';
      const shield = new THREE.Mesh(shieldPickupGeo, shieldPickupMat);
      const innerStar = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      itemGroup.add(shield, innerStar);
    } else if (i % 11 === 10) {
      type = 'GUIDANCE_CRYSTAL';
      const crystal = new THREE.Mesh(guidanceGeo, guidanceMat);
      itemGroup.add(crystal);
    } else {
      type = 'FRUCTOSE';
      const gem = new THREE.Mesh(fructoseGeo, fructoseMat);
      // Beautiful glowing starburst plane (unmistakably good!)
      const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: goldGlowTex, transparent: true, opacity: 0.95 }));
      glowSprite.scale.set(4.5, 4.5, 1);
      itemGroup.add(gem, glowSprite);
    }

    const tubeR = getAnatomicalRadiusAt(t);
    const angle = i * 1.7 * Math.PI * 2;
    const distFromCenter = Math.sin(i * 2.8) * (tubeR * 0.45);
    const pos = center.clone().addScaledVector(normal, Math.cos(angle) * distFromCenter).addScaledVector(binormal, Math.sin(angle) * distFromCenter);

    itemGroup.position.copy(pos);
    scene.add(itemGroup);

    pickups.push({
      id: i,
      type,
      position: itemGroup.position,
      mesh: itemGroup,
      collected: false,
      radius: type === 'FRUCTOSE' ? 2.5 : 3.0,
      zoneIndex: zoneIdx,
    });
  }

  // 8. CONTRACEPTIVE TRAPS & ANATOMICAL OBSTACLES (Vibrant Red & Neon Hazard Colors, No Text Labels!)
  const hazards: HazardItem[] = [];
  const numHazards = 65;

  const dangerDecalTex = createDangerDecalTexture();
  const foamTex = createFoamBubbleTexture();

  // Spiky Crimson Bio-Mine for Acid
  const acidGeo = new THREE.IcosahedronGeometry(2.4, 1);
  const acidMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.85,
    roughness: 0.3,
  });

  // White Blood Cell Macrophage
  const wbcGeo = new THREE.DodecahedronGeometry(3.8, 2);
  const wbcMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.35,
    roughness: 0.55,
    transparent: true,
    opacity: 0.9,
  });

  // Constriction Valve leaf
  const valveLeafGeo = new THREE.ConeGeometry(8, 14, 4);
  const valveMat = new THREE.MeshStandardMaterial({
    color: 0xbe123c,
    emissive: 0x881337,
    emissiveIntensity: 0.5,
    roughness: 0.6,
  });

  // TRAP 1: NuvaRing Geometry & Material (Glowing 54mm transparent ring)
  const nuvaRingGeo = new THREE.TorusGeometry(14, 1.2, 16, 48);
  const nuvaRingMat = new THREE.MeshPhysicalMaterial({
    color: 0xf472b6,
    emissive: 0xdb2777,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.85,
  });

  // TRAP 2: Copper-T IUD Geometry & Material
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xb87333,
    emissive: 0x7c2d12,
    emissiveIntensity: 0.3,
    roughness: 0.15,
    metalness: 0.95,
  });

  for (let i = 0; i < numHazards; i++) {
    const t = 0.08 + (i / numHazards) * 0.88;
    if (t >= 0.47 && t <= 0.53) continue; // Skip leap gap

    const center = trackCurve.getPointAt(t);
    const tangent = trackCurve.getTangentAt(t);
    const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    const tubeR = getAnatomicalRadiusAt(t);

    let zoneIdx = 0;
    for (let z = 0; z < ANATOMICAL_ZONES.length; z++) {
      if (t >= ANATOMICAL_ZONES[z].startT && t <= ANATOMICAL_ZONES[z].endT) {
        zoneIdx = z;
        break;
      }
    }

    const hazardGroup = new THREE.Group();

    // 1. CONTRACEPTIVE TRAP: NUVARING (In Vaginal Canal Zone 7)
    if (zoneIdx === 6 && i % 4 === 0) {
      hazardGroup.position.copy(center);
      hazardGroup.lookAt(center.clone().add(tangent));

      const ringMesh = new THREE.Mesh(nuvaRingGeo, nuvaRingMat);
      hazardGroup.add(ringMesh);

      // Pink hormonal mist particle field
      const mistGeo = new THREE.RingGeometry(2, 14, 24);
      const mistMat = new THREE.MeshBasicMaterial({
        color: 0xf472b6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      hazardGroup.add(new THREE.Mesh(mistGeo, mistMat));

      scene.add(hazardGroup);

      hazards.push({
        id: i,
        type: 'NUVARING',
        position: hazardGroup.position,
        basePos: center.clone(),
        mesh: hazardGroup,
        radius: 12.0,
        wanderPhase: 0,
        patrolSpeed: 1.0,
        zoneIndex: zoneIdx,
        aggression: 0,
      });
    }
    // 2. CONTRACEPTIVE TRAP: COPPER-T IUD (In Uterine Cavern Zone 9)
    else if (zoneIdx === 8 && i % 3 === 0) {
      hazardGroup.position.copy(center);
      hazardGroup.lookAt(center.clone().add(tangent));

      // Vertical stem
      const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 16, 16), copperMat);
      // Horizontal crossbar
      const barMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 18, 16), copperMat);
      barMesh.rotation.z = Math.PI / 2;
      barMesh.position.y = 8;
      hazardGroup.add(stemMesh, barMesh);

      // Sparkling blue copper ion field
      const sparkDecal = new THREE.Mesh(
        new THREE.RingGeometry(5, 18, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
      );
      sparkDecal.rotation.x = Math.PI / 2;
      hazardGroup.add(sparkDecal);

      scene.add(hazardGroup);

      hazards.push({
        id: i,
        type: 'COPPER_IUD',
        position: hazardGroup.position,
        basePos: center.clone(),
        mesh: hazardGroup,
        radius: 14.0,
        wanderPhase: 0,
        patrolSpeed: 1.0,
        zoneIndex: zoneIdx,
        aggression: 0,
      });
    }
    // 3. CONTRACEPTIVE TRAP: PLAN B THICKENED MUCUS / SPERMICIDE (Zone 8)
    else if (zoneIdx === 7 && i % 3 === 1) {
      hazardGroup.position.copy(center);
      hazardGroup.lookAt(center.clone().add(tangent));

      // Spermicide effervescent foam cloud
      const foamGeo = new THREE.CylinderGeometry(tubeR * 0.75, tubeR * 0.75, 4, 16);
      foamGeo.rotateX(Math.PI / 2);
      const foamMat = new THREE.MeshStandardMaterial({
        map: foamTex,
        color: 0xbef264,
        emissive: 0x65a30d,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.75,
      });
      hazardGroup.add(new THREE.Mesh(foamGeo, foamMat));
      scene.add(hazardGroup);

      hazards.push({
        id: i,
        type: 'SPERMICIDE_FOAM',
        position: hazardGroup.position,
        basePos: center.clone(),
        mesh: hazardGroup,
        radius: tubeR * 0.7,
        wanderPhase: 0,
        patrolSpeed: 1.0,
        zoneIndex: zoneIdx,
        aggression: 0,
      });
    }
    // 4. Constriction Valves (Vas Deferens Zone 3 & Fallopian Zone 10)
    else if (i % 8 === 0 && (zoneIdx === 2 || zoneIdx === 9)) {
      hazardGroup.position.copy(center);
      hazardGroup.lookAt(center.clone().add(tangent));

      const leaves: THREE.Mesh[] = [];
      for (let leaf = 0; leaf < 4; leaf++) {
        const lMesh = new THREE.Mesh(valveLeafGeo, valveMat);
        const lAngle = (leaf * Math.PI) / 2;
        lMesh.rotation.z = lAngle;
        lMesh.position.set(Math.cos(lAngle) * 12, Math.sin(lAngle) * 12, 0);
        hazardGroup.add(lMesh);
        leaves.push(lMesh);
      }
      scene.add(hazardGroup);

      hazards.push({
        id: i,
        type: 'CONSTRICTION_VALVE',
        position: hazardGroup.position,
        basePos: center.clone(),
        mesh: hazardGroup,
        radius: 7.0,
        wanderPhase: Math.random() * Math.PI * 2,
        patrolSpeed: 1.2,
        zoneIndex: zoneIdx,
        valveCycle: Math.random() * 5,
        isOpen: true,
        aperture: 1.0,
        valveLeaves: leaves,
        aggression: 0,
      });
    }
    // 5. White Blood Cells (Macrophages)
    else if (zoneIdx >= 6 && i % 3 === 2) {
      const body = new THREE.Mesh(wbcGeo, wbcMat);
      hazardGroup.add(body);

      // Glowing red eyes
      const eyeGeo = new THREE.SphereGeometry(0.75, 12, 12);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.0 });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-1.4, 1.0, 3.0);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(1.4, 1.0, 3.0);
      hazardGroup.add(leftEye, rightEye);

      // Red danger laser targeting ring
      const targetRing = new THREE.Mesh(
        new THREE.RingGeometry(4.5, 5.2, 24),
        new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
      );
      targetRing.rotation.x = Math.PI / 2;
      hazardGroup.add(targetRing);

      const offsetAngle = Math.random() * Math.PI * 2;
      const offsetDist = Math.random() * (tubeR * 0.5);
      const pos = center.clone().addScaledVector(normal, Math.cos(offsetAngle) * offsetDist).addScaledVector(binormal, Math.sin(offsetAngle) * offsetDist);
      hazardGroup.position.copy(pos);
      scene.add(hazardGroup);

      hazards.push({
        id: i,
        type: 'WHITE_BLOOD_CELL',
        position: hazardGroup.position,
        basePos: pos.clone(),
        mesh: hazardGroup,
        radius: 4.2,
        wanderPhase: Math.random() * Math.PI * 2,
        patrolSpeed: 1.8,
        zoneIndex: zoneIdx,
        isChasing: false,
        aggression: 0.6,
      });
    }
    // 6. Acid Bio-Mines
    else {
      const acidMesh = new THREE.Mesh(acidGeo, acidMat);
      hazardGroup.add(acidMesh);

      // Red danger decal on floor
      const decal = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 6),
        new THREE.MeshBasicMaterial({ map: dangerDecalTex, transparent: true, opacity: 0.85 })
      );
      decal.rotation.x = -Math.PI / 2;
      hazardGroup.add(decal);

      const offsetAngle = (i * 2.2) * Math.PI;
      const offsetDist = 4 + Math.random() * (tubeR * 0.45);
      const pos = center.clone().addScaledVector(normal, Math.cos(offsetAngle) * offsetDist).addScaledVector(binormal, Math.sin(offsetAngle) * offsetDist);
      hazardGroup.position.copy(pos);
      scene.add(hazardGroup);

      hazards.push({
        id: i,
        type: 'ACID_DROPLET',
        position: hazardGroup.position,
        basePos: pos.clone(),
        mesh: hazardGroup,
        radius: 2.6,
        wanderPhase: Math.random() * Math.PI * 2,
        patrolSpeed: 0.8,
        zoneIndex: zoneIdx,
        aggression: 0,
      });
    }
  }

  // 9. THE GOAL: THE COLOSSAL GOLDEN OOCYTE
  const eggGroup = new THREE.Group();
  const endPoint = trackCurve.getPointAt(1.0);
  eggGroup.position.copy(endPoint);
  scene.add(eggGroup);

  const eggGeo = new THREE.SphereGeometry(32, 48, 36);
  const eggMat = new THREE.MeshPhysicalMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const eggMesh = new THREE.Mesh(eggGeo, eggMat);
  eggGroup.add(eggMesh);

  // Zona Pellucida
  const zonaGeo = new THREE.SphereGeometry(35, 36, 24);
  const zonaMat = new THREE.MeshPhysicalMaterial({
    color: 0x67e8f9,
    roughness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.5,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.2,
  });
  const zonaMesh = new THREE.Mesh(zonaGeo, zonaMat);
  eggGroup.add(zonaMesh);

  // Corona Radiata follicular cells
  const follicularCellGeo = new THREE.DodecahedronGeometry(2.5, 1);
  const follicularCellMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });

  for (let f = 0; f < 36; f++) {
    const fMesh = new THREE.Mesh(follicularCellGeo, follicularCellMat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const dist = 40 + Math.random() * 14;
    fMesh.position.set(
      dist * Math.sin(phi) * Math.cos(theta),
      dist * Math.sin(phi) * Math.sin(theta),
      dist * Math.cos(phi)
    );
    eggGroup.add(fMesh);
  }

  // Receptor Dock Target (Target bullseye for conception victory!)
  const receptorTorusGeo = new THREE.TorusGeometry(6, 0.8, 16, 32);
  const receptorMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x16a34a,
    emissiveIntensity: 1.3,
    roughness: 0.2,
  });
  const receptorDock = new THREE.Mesh(receptorTorusGeo, receptorMat);
  receptorDock.position.set(0, 0, 36);
  eggGroup.add(receptorDock);

  // 10. RIVAL SPERM SWARM & DEFENDERS (Clean models without annoying floating text!)
  const rivals: RivalSperm[] = [];
  const rivalNames = [
    'Rival Chad', 'Speedy Sam', 'Bully Boris', 'Turbo Tim',
    'Dash Danny', 'Darting Dave', 'Rocket Rick', 'Slick Stan',
    'Mighty Max', 'Nitro Nick', 'Hyper Hank', 'Vicious Vic',
    'Rival Karen', 'Corona Cracker Cole', 'Zona Zealot Zack'
  ];

  for (let i = 0; i < rivalNames.length; i++) {
    const isDefender = i >= 12;
    const baseProgress = isDefender ? 0.95 + (i - 12) * 0.015 : 0.03 + (i / 12) * 0.88;
    const hue = (i * 0.15) % 1.0;
    const spermInstance = createCartoonSperm(false, hue);
    scene.add(spermInstance.group);

    rivals.push({
      id: i,
      name: rivalNames[i],
      instance: spermInstance,
      t: baseProgress,
      laneOffset: new THREE.Vector2(
        Math.sin(i * 1.8) * 9,
        Math.cos(i * 1.8) * 9
      ),
      speed: 0.007 + Math.random() * 0.005,
      radius: 2.4,
      isSpinning: false,
      spinTimer: 0,
      isAggressive: i % 2 === 0 || isDefender,
      isEggDefender: isDefender,
    });
  }

  // State update variables
  let worldTime = 0;
  let lastPassedPenisExit = false;
  let leapEvaluated = false;

  const update = (
    delta: number,
    playerPos: THREE.Vector3,
    playerProgressT: number,
    playerIsBoosting: boolean,
    hasShield: boolean,
    hasGuidance: boolean,
    magnetRadius: number,
    lateralX: number,
    lateralY: number
  ) => {
    worldTime += delta;
    let hitHazard: HazardItem | null = null;
    let collectedPickup: PickupItem | null = null;
    let activeSurge = 0;
    let avoidedHazardsCount = 0;
    let rammedRival: RivalSperm | null = null;
    let rivalPassedCount = 0;

    // Check Penile Launch Portal crossing (at t = 0.47)
    let justCrossedPenisExit = false;
    if (playerProgressT >= penisExitT && !lastPassedPenisExit) {
      lastPassedPenisExit = true;
      justCrossedPenisExit = true;
      leapEvaluated = false;
    } else if (playerProgressT < penisExitT) {
      lastPassedPenisExit = false;
    }

    // Open-Air Leap Trajectory evaluation (t = 0.47 to 0.53)
    const isLeaping = playerProgressT >= 0.47 && playerProgressT <= 0.53;
    const leapState: EjaculationLeapState = {
      isActive: isLeaping,
      hasEvaluated: leapEvaluated,
      hitTarget: false,
      detourName: '',
    };

    if (isLeaping && playerProgressT >= 0.525 && !leapEvaluated) {
      leapEvaluated = true;
      leapState.hasEvaluated = true;

      if (Math.abs(lateralX) <= 12 && Math.abs(lateralY) <= 12) {
        leapState.hitTarget = true;
      } else if (lateralX < -12) {
        leapState.hitTarget = false;
        leapState.detourName = 'THE SOCK / BEDSHEET VOID';
      } else {
        leapState.hitTarget = false;
        leapState.detourName = 'THE CONDOM LATEX WALL';
      }
    }

    // Determine current anatomical zone
    let currentZone = ANATOMICAL_ZONES[0];
    for (let z = 0; z < ANATOMICAL_ZONES.length; z++) {
      if (playerProgressT >= ANATOMICAL_ZONES[z].startT && playerProgressT <= ANATOMICAL_ZONES[z].endT) {
        currentZone = ANATOMICAL_ZONES[z];
        break;
      }
    }

    // Update Seminal Blast Particles
    const posArr = blastGeo.attributes.position.array as Float32Array;
    for (let b = 0; b < blastCount; b++) {
      const idx = b * 3;
      posArr[idx] += blastVels[b].x * delta;
      posArr[idx + 1] += blastVels[b].y * delta;
      posArr[idx + 2] += blastVels[b].z * delta;

      if (Math.abs(posArr[idx + 2] - penisExitPos.z) > 140) {
        posArr[idx] = penisExitPos.x + (Math.random() - 0.5) * 8;
        posArr[idx + 1] = penisExitPos.y + (Math.random() - 0.5) * 8;
        posArr[idx + 2] = penisExitPos.z;
      }
    }
    blastGeo.attributes.position.needsUpdate = true;

    // Guidance line opacity
    guidanceLineMat.opacity = THREE.MathUtils.lerp(
      guidanceLineMat.opacity,
      hasGuidance ? 0.85 : 0.0,
      delta * 5
    );

    // Ejaculation rings animation
    glansNozzleMesh.rotation.z += delta * 1.5;
    vaginaTargetRing.rotation.z += delta * 2;
    aimInnerRing.rotation.z -= delta * 3;

    // Animate Pickups
    pickups.forEach((p) => {
      if (!p.collected) {
        p.mesh.rotation.y += delta * 2.0;
        p.mesh.rotation.x += delta * 1.2;

        // Upgraded magnet attraction
        const effectiveMagnet = hasGuidance ? magnetRadius * 1.5 : magnetRadius;
        if (p.type === 'FRUCTOSE') {
          const distToPlayer = p.position.distanceTo(playerPos);
          if (distToPlayer < effectiveMagnet) {
            p.position.lerp(playerPos, delta * 4.0);
          }
        }

        if (p.position.distanceTo(playerPos) < p.radius + 1.2) {
          p.collected = true;
          p.mesh.visible = false;
          collectedPickup = p;
        }
      }
    });

    // Animate Hazards & Traps
    hazards.forEach((h) => {
      h.wanderPhase += delta * h.patrolSpeed;

      // NuvaRing Trap: Pulsing pink hormonal suppression field
      if (h.type === 'NUVARING') {
        h.mesh.rotation.z += delta * 1.5;
        const dist = h.position.distanceTo(playerPos);
        if (dist < h.radius) {
          hitHazard = h;
        }
      }
      // Copper IUD Trap: Pulsing electric copper ion field
      else if (h.type === 'COPPER_IUD') {
        h.mesh.rotation.z += delta * 0.8;
        const dist = h.position.distanceTo(playerPos);
        if (dist < h.radius) {
          hitHazard = h;
        }
      }
      // Spermicide Foam Trap
      else if (h.type === 'SPERMICIDE_FOAM') {
        h.mesh.rotation.z += delta * 0.5;
        const dist = h.position.distanceTo(playerPos);
        if (dist < h.radius) {
          hitHazard = h;
        }
      }
      // White Blood Cells
      else if (h.type === 'WHITE_BLOOD_CELL') {
        const distToPlayer = h.position.distanceTo(playerPos);
        const chaseRange = 36 * (1 + h.aggression);

        if (distToPlayer < chaseRange) {
          h.isChasing = true;
          h.mesh.lookAt(playerPos);
          h.position.lerp(playerPos, delta * (1.1 + h.aggression * 1.5));
          h.mesh.scale.set(1.1, 1.1, 1.1);
        } else {
          h.isChasing = false;
          h.position.x = h.basePos.x + Math.sin(h.wanderPhase) * 6;
          h.position.y = h.basePos.y + Math.cos(h.wanderPhase * 0.8) * 5;
          h.mesh.rotation.y += delta * 0.5;
          h.mesh.scale.set(1.0, 1.0, 1.0);
        }

        if (distToPlayer > 8 && distToPlayer < 14 && h.isChasing) {
          avoidedHazardsCount++;
        }

        if (distToPlayer < h.radius + 1.2) {
          hitHazard = h;
        }
      }
      // Constriction Valves
      else if (h.type === 'CONSTRICTION_VALVE' && h.valveLeaves) {
        h.valveCycle = (h.valveCycle || 0) + delta * 1.5;
        const openWave = Math.sin(h.valveCycle);
        h.aperture = 0.5 + openWave * 0.45;
        h.isOpen = h.aperture > 0.45;

        h.valveLeaves.forEach((leaf, idx) => {
          const lAngle = (idx * Math.PI) / 2;
          const radialDist = 6 + h.aperture! * 7;
          leaf.position.set(Math.cos(lAngle) * radialDist, Math.sin(lAngle) * radialDist, 0);
        });

        const distToValve = h.position.distanceTo(playerPos);
        if (distToValve < 5.0 && !h.isOpen) {
          hitHazard = h;
        } else if (distToValve < 6.0 && h.isOpen) {
          avoidedHazardsCount++;
        }
      }
      // Acid Droplet
      else if (h.type === 'ACID_DROPLET') {
        h.mesh.rotation.y += delta * 3;
        h.mesh.rotation.z += delta * 2;
        if (h.position.distanceTo(playerPos) < h.radius + 1.0) {
          hitHazard = h;
        }
      }
    });

    // Animate Cilia
    ciliaMeshes.forEach((c) => {
      c.mesh.rotation.z = Math.sin(worldTime * 6 + c.phase) * 0.35;
    });

    // Animate Egg
    eggGroup.rotation.y += delta * 0.08;
    receptorDock.rotation.z += delta * 1.5;

    // Animate Rivals
    rivals.forEach((r) => {
      if (r.isSpinning) {
        r.spinTimer -= delta;
        if (r.spinTimer <= 0) {
          r.isSpinning = false;
        }
      } else {
        r.t = (r.t + delta * r.speed) % 1.0;
      }

      const point = trackCurve.getPointAt(r.t);
      const tangent = trackCurve.getTangentAt(r.t);
      const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const pos = point.clone()
        .addScaledVector(normal, r.laneOffset.x)
        .addScaledVector(binormal, r.laneOffset.y);

      r.instance.group.position.copy(pos);
      r.instance.group.lookAt(pos.clone().add(tangent));
      r.instance.update(delta, false, 0, 0, 0.7);

      const distToRival = pos.distanceTo(playerPos);
      if (distToRival < r.radius + 1.6) {
        if (playerIsBoosting || hasShield || Math.random() < 0.6) {
          if (!r.isSpinning) {
            r.isSpinning = true;
            r.spinTimer = 1.6;
            r.instance.triggerSpinOut();
            rammedRival = r;
          }
        } else {
          r.laneOffset.x += (Math.random() - 0.5) * 4;
        }
      }

      if (playerProgressT > r.t && playerProgressT - r.t < 0.015) {
        rivalPassedCount++;
      }
    });

    return {
      hitHazard,
      collectedPickup,
      activeSurge,
      avoidedHazardsCount,
      rammedRival,
      rivalPassedCount,
      currentZone,
      justCrossedPenisExit,
      leapState,
    };
  };

  const dispose = () => {
    tunnelGeo.dispose();
    tunnelMat.dispose();
    glansNozzleGeo.dispose();
    glansNozzleMat.dispose();
    vaginaTargetRingGeo.dispose();
    vaginaTargetRingMat.dispose();
    blastGeo.dispose();
    blastMat.dispose();
    nuvaRingGeo.dispose();
    nuvaRingMat.dispose();
    copperMat.dispose();
    ciliaGeo.dispose();
    ciliaMat.dispose();
    fructoseGeo.dispose();
    fructoseMat.dispose();
    energySphereGeo.dispose();
    energySphereMat.dispose();
    shieldPickupGeo.dispose();
    shieldPickupMat.dispose();
    guidanceGeo.dispose();
    guidanceMat.dispose();
    guidanceLineGeo.dispose();
    guidanceLineMat.dispose();
    wbcGeo.dispose();
    wbcMat.dispose();
    acidGeo.dispose();
    acidMat.dispose();
    valveLeafGeo.dispose();
    valveMat.dispose();
    eggGeo.dispose();
    eggMat.dispose();
    zonaGeo.dispose();
    zonaMat.dispose();
    follicularCellGeo.dispose();
    follicularCellMat.dispose();
    receptorTorusGeo.dispose();
    receptorMat.dispose();

    rivals.forEach((r) => {
      r.instance.dispose();
      scene.remove(r.instance.group);
    });
  };

  return {
    trackCurve,
    totalLength,
    tunnelMesh,
    penisExitMesh: penisExitGroup,
    vaginaEntranceMesh: vaginaEntranceGroup,
    seminalBlastParticles,
    sockDetourGroup,
    condomDetourGroup,
    pickups,
    hazards,
    rivals,
    eggGroup,
    ciliaGroup,
    guidanceLineMesh,
    update,
    dispose,
  };
}
