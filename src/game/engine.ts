/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ANATOMICAL_ZONES,
  AnatomicalZone,
  LevelResult,
  PlayerStats,
  PlayerUpgrades,
  PowerUpType,
  HazardType,
} from '../types/game';
import { soundManager } from '../audio/soundManager';
import { createCartoonSperm, SpermModelInstance } from './spermModel';
import { generateWorld, WorldData, PickupItem, HazardItem, RivalSperm, EjaculationLeapState } from './worldGenerator';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: PlayerStats) => void;
  onZoneChange: (zone: AnatomicalZone) => void;
  onPenileLaunch: () => void;
  onLeapUpdate: (isLeaping: boolean, hitTarget: boolean | null, detourName: string) => void;
  onFloatingNotification: (text: string, type: 'GOOD' | 'BAD' | 'COMBAT' | 'LEAP') => void;
  onGameOver: (score: number, zoneIdx: number) => void;
  onVictory: (result: LevelResult) => void;
}

// Module-scope math helpers for Zero Garbage Collection
const _vPlayerPos = new THREE.Vector3();
const _vTangent = new THREE.Vector3();
const _vNormal = new THREE.Vector3();
const _vBinormal = new THREE.Vector3();
const _vCamTarget = new THREE.Vector3();
const _vCamDesired = new THREE.Vector3();
const _vLookAt = new THREE.Vector3();
const _vUp = new THREE.Vector3(0, 1, 0);

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private hemiLight: THREE.HemisphereLight;
  private isSoftwareGl: boolean;
  private world: WorldData;
  private heroSperm: SpermModelInstance;
  private callbacks: GameEngineCallbacks;

  // Game state
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentZoneIndex: number = 0;
  private timeElapsed: number = 0;
  private score: number = 0;
  private fructoseCount: number = 0;
  private powerUpsCount: number = 0;
  private obstaclesAvoided: number = 0;
  private rivalsKnockedOut: number = 0;
  private trapsAvoided: number = 0;
  private totalRacers: number = 100;

  // Track coordinates - Relaxed, comfortable speed so player can absorb the view!
  private progressT: number = 0;
  private lateralX: number = 0;
  private lateralY: number = 0;
  private currentSpeed: number = 38; // Comfortable readable starting velocity
  private baseSpeed: number = 38;
  private boostMultiplier: number = 1.0;
  private fluidSurgeModifier: number = 0;

  // Player stats
  private health: number = 100;
  private stamina: number = 100;
  private maxStamina: number = 100;
  private combo: number = 0;
  private invulnerableTimer: number = 0;
  private inSlowMotion: boolean = false;

  // Player upgrades
  private upgrades: PlayerUpgrades = {
    tailPower: 0,
    atpTank: 0,
    acrosomeArmor: 0,
    alkalineShield: 0,
    chemotaxisMagnet: 0,
  };

  // Power-up active timers
  private powerUps = {
    energy: 0,
    shield: 0,
    guidance: 0,
  };

  // Camera Shake & Hitstop
  private hitstopTimer: number = 0;
  private cameraShake: number = 0;

  // Input state
  private keysHeld: Record<string, boolean> = {};
  private virtualSteer = { x: 0, y: 0 };
  private virtualBoost: boolean = false;

  // Timing
  private clock: THREE.Clock;
  private animationFrameId: number = 0;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x2a0d18, 0.006);

    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.5,
      1400
    );

    // 4. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const keyLight = new THREE.DirectionalLight(0xfff1f2, 1.8);
    keyLight.position.set(20, 40, 20);
    this.scene.add(keyLight);

    this.hemiLight = new THREE.HemisphereLight(0xff8fa3, 0x1f2937, 1.2);
    this.scene.add(this.hemiLight);

    // 5. Generate World & Hero Sperm
    this.world = generateWorld(this.scene);
    this.heroSperm = createCartoonSperm(true);
    this.scene.add(this.heroSperm.group);

    this.setupEventListeners();
    this.tick = this.tick.bind(this);
    this.startLoop();
  }

  public applyUpgrades(newUpgrades: PlayerUpgrades) {
    this.upgrades = { ...newUpgrades };
    this.baseSpeed = 38 * (1 + this.upgrades.tailPower * 0.15);
    this.maxStamina = 100 + this.upgrades.atpTank * 20;
    this.stamina = Math.min(this.stamina, this.maxStamina);
  }

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('resize', this.handleResize);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keysHeld[e.code] = true;
    if (e.code === 'KeyP' || e.code === 'Escape') {
      this.togglePause();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysHeld[e.code] = false;
  };

  private handleBlur = () => {
    this.keysHeld = {};
    this.virtualSteer = { x: 0, y: 0 };
    this.virtualBoost = false;
  };

  private handleResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public setVirtualSteer(x: number, y: number) {
    this.virtualSteer.x = THREE.MathUtils.clamp(x, -1, 1);
    this.virtualSteer.y = THREE.MathUtils.clamp(y, -1, 1);
  }

  public setVirtualBoost(active: boolean) {
    this.virtualBoost = active;
  }

  public startJourney(startZoneIndex = 0) {
    this.currentZoneIndex = THREE.MathUtils.clamp(startZoneIndex, 0, ANATOMICAL_ZONES.length - 1);
    const zone = ANATOMICAL_ZONES[this.currentZoneIndex];

    this.progressT = zone.startT;
    this.lateralX = 0;
    this.lateralY = 0;
    this.currentSpeed = this.baseSpeed;
    this.health = 100;
    this.stamina = this.maxStamina;
    this.combo = 0;
    this.timeElapsed = 0;
    this.score = 0;
    this.fructoseCount = 0;
    this.powerUpsCount = 0;
    this.obstaclesAvoided = 0;
    this.rivalsKnockedOut = 0;
    this.trapsAvoided = 0;
    this.powerUps = { energy: 0, shield: 0, guidance: 0 };

    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(zone.fogColor);
    }
    this.renderer.setClearColor(zone.fogColor);
    this.hemiLight.color.setHex(zone.ambientColor);

    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();
  }

  public togglePause(): boolean {
    if (!this.isRunning) return false;
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  public isGamePaused(): boolean {
    return this.isPaused;
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animationFrameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.animationFrameId = window.setTimeout(cb, 80);
      }
    };
    this.animationFrameId = window.setTimeout(poll, 5);
  }

  private startLoop() {
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.animationFrameId = requestAnimationFrame(this.tick);
    }
  }

  private tick() {
    const rawDt = this.clock.getDelta();
    let delta = Math.min(rawDt, 0.05);

    // SLOW-MOTION BULLET-TIME DURING THE OPEN-AIR EJACULATION LEAP!
    if (this.progressT >= 0.47 && this.progressT <= 0.53) {
      delta *= 0.35; // Cinematic slow motion flight
      this.inSlowMotion = true;
    } else {
      this.inSlowMotion = false;
    }

    if (this.isRunning && !this.isPaused) {
      this.updateSimulation(delta);
    } else if (!this.isRunning) {
      this.updateTitleCamera(delta);
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.animationFrameId = requestAnimationFrame(this.tick);
    }
  }

  private updateTitleCamera(delta: number) {
    const time = this.clock.getElapsedTime();
    const titlePoint = this.world.trackCurve.getPointAt(0.02);
    this.camera.position.set(
      titlePoint.x + Math.sin(time * 0.4) * 20,
      titlePoint.y + 12 + Math.cos(time * 0.3) * 6,
      titlePoint.z + 24
    );
    this.camera.lookAt(titlePoint);

    this.heroSperm.group.position.copy(titlePoint);
    this.heroSperm.group.rotation.y = time * 0.5;
    this.heroSperm.update(delta, false, 0, 0, 0.6);
  }

  private updateSimulation(delta: number) {
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= delta;
      return;
    }

    this.timeElapsed += delta;

    // 1. Responsive & Smooth Steering Inputs
    let steerX = this.virtualSteer.x;
    let steerY = this.virtualSteer.y;

    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) steerX -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) steerX += 1;
    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) steerY += 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) steerY -= 1;

    steerX = THREE.MathUtils.clamp(steerX, -1, 1);
    steerY = THREE.MathUtils.clamp(steerY, -1, 1);

    // 2. Comfortable Boost & Stamina Logic
    const isBoostKey = this.keysHeld['Space'] || this.virtualBoost;
    const hasEnergyPowerUp = this.powerUps.energy > 0;
    let isBoosting = false;

    if (hasEnergyPowerUp) {
      isBoosting = true;
      this.boostMultiplier = 1.9;
    } else if (isBoostKey && this.stamina > 5) {
      isBoosting = true;
      const staminaDrainRate = Math.max(12, 28 - this.upgrades.atpTank * 2.5);
      this.stamina = Math.max(0, this.stamina - delta * staminaDrainRate);
      this.boostMultiplier = 1.6;
      if (Math.random() < 0.2) soundManager.playSwimWhip();
    } else {
      const rechargeRate = 18 + this.upgrades.atpTank * 4;
      this.stamina = Math.min(this.maxStamina, this.stamina + delta * rechargeRate);
      this.boostMultiplier = 1.0;
    }

    // 3. Update Power-Up Active Timers
    if (this.powerUps.energy > 0) this.powerUps.energy = Math.max(0, this.powerUps.energy - delta);
    if (this.powerUps.shield > 0) this.powerUps.shield = Math.max(0, this.powerUps.shield - delta);
    if (this.powerUps.guidance > 0) this.powerUps.guidance = Math.max(0, this.powerUps.guidance - delta);

    if (this.invulnerableTimer > 0) this.invulnerableTimer -= delta;

    // 4. Calculate Speed & Forward Movement (Comfortable pace across longer track)
    const targetSpeed = (this.baseSpeed * this.boostMultiplier + this.fluidSurgeModifier * 25);
    this.currentSpeed = THREE.MathUtils.damp(this.currentSpeed, targetSpeed, 3.5, delta);

    const advanceRate = (this.currentSpeed / this.world.totalLength) * delta * 0.7;
    this.progressT += advanceRate;

    // Lateral steering response inside tube / open air
    const agility = 20 * (1 + this.upgrades.tailPower * 0.12);
    this.lateralX = THREE.MathUtils.clamp(this.lateralX + steerX * agility * delta, -20, 20);
    this.lateralY = THREE.MathUtils.clamp(this.lateralY + steerY * agility * delta, -20, 20);

    // 5. Position Hero Sperm in 3D Spline Coordinate Space
    const tClamped = THREE.MathUtils.clamp(this.progressT, 0, 1.0);
    this.world.trackCurve.getPointAt(tClamped, _vPlayerPos);
    this.world.trackCurve.getTangentAt(tClamped, _vTangent);

    _vNormal.crossVectors(_vTangent, _vUp).normalize();
    _vBinormal.crossVectors(_vTangent, _vNormal).normalize();

    _vPlayerPos.addScaledVector(_vNormal, this.lateralX);
    _vPlayerPos.addScaledVector(_vBinormal, this.lateralY);

    this.heroSperm.group.position.copy(_vPlayerPos);

    _vLookAt.copy(_vPlayerPos).add(_vTangent);
    this.heroSperm.group.lookAt(_vLookAt);
    this.heroSperm.group.rotateZ(-steerX * 0.4);
    this.heroSperm.group.rotateX(steerY * 0.2);

    this.heroSperm.update(
      delta,
      isBoosting,
      steerX,
      steerY,
      this.currentSpeed / 100,
      this.powerUps,
      this.upgrades
    );

    // 6. Update World, Hazards, Contraceptive Traps & Rivals
    const magnetRadius = 18 * (1 + this.upgrades.chemotaxisMagnet * 0.3);
    const worldResult = this.world.update(
      delta,
      _vPlayerPos,
      this.progressT,
      isBoosting,
      this.powerUps.shield > 0,
      this.powerUps.guidance > 0,
      magnetRadius,
      this.lateralX,
      this.lateralY
    );

    // Dynamic Zone Transition
    const currentZone = worldResult.currentZone;
    if (currentZone.id - 1 !== this.currentZoneIndex) {
      this.currentZoneIndex = currentZone.id - 1;
      soundManager.playZoneTransition();
      this.callbacks.onZoneChange(currentZone);
      this.callbacks.onFloatingNotification(`${currentZone.humorQuote}`, 'LEAP');
    }

    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.lerp(new THREE.Color(currentZone.fogColor), delta * 2);
    }
    this.hemiLight.color.lerp(new THREE.Color(currentZone.ambientColor), delta * 2);

    // Penile Launch Milestone Blast!
    if (worldResult.justCrossedPenisExit) {
      soundManager.playPenisLaunchBurst();
      this.cameraShake = 1.4;
      this.callbacks.onPenileLaunch();
      this.callbacks.onFloatingNotification('🚀 PENILE BLAST! SLOW-MOTION FLIGHT ACTIVE!', 'LEAP');
    }

    // Handle Open-Air Ejaculation Leap
    const leapState = worldResult.leapState;
    this.callbacks.onLeapUpdate(
      leapState.isActive,
      leapState.hasEvaluated ? leapState.hitTarget : null,
      leapState.detourName
    );

    if (leapState.isActive && Math.random() < 0.08) {
      soundManager.playAimSwoosh();
    }

    if (leapState.hasEvaluated) {
      if (leapState.hitTarget) {
        soundManager.playDirectHitSuccess();
        this.score += 1500;
        this.currentSpeed += 40;
        this.callbacks.onFloatingNotification('🎯 DIRECT HIT! VAGINAL INFILTRATION! +1500 PTS', 'GOOD');
      } else {
        soundManager.playMissBounce();
        this.cameraShake = 1.2;
        this.heroSperm.triggerHitSquash();
        this.callbacks.onFloatingNotification(`💥 BOING! HIT ${leapState.detourName}! VACUUM GUST CATCHES YOU!`, 'BAD');
        this.lateralX = THREE.MathUtils.lerp(this.lateralX, 0, 0.85);
        this.lateralY = THREE.MathUtils.lerp(this.lateralY, 0, 0.85);
      }
    }

    // Fluid surge feedback
    this.fluidSurgeModifier = worldResult.activeSurge;
    if (Math.abs(this.fluidSurgeModifier) > 0.3 && Math.random() < 0.06) {
      soundManager.playSurgeWhoosh(this.fluidSurgeModifier > 0);
    }

    // COMBAT: Player Rammed / Knocked Out a Rival Sperm!
    if (worldResult.rammedRival) {
      this.rivalsKnockedOut++;
      this.score += 350;
      this.stamina = Math.min(this.maxStamina, this.stamina + 30);
      this.heroSperm.triggerTailWhipAttack();
      soundManager.playRivalHit();
      soundManager.playRivalSpinout();
      this.cameraShake = 0.35;

      const rivalPuns = [
        `⚔️ POW! ${worldResult.rammedRival.name} spun out! “See ya at the egg, loser!”`,
        `⚔️ SMACK! ${worldResult.rammedRival.name} got tail-whipped! +350 PTS`,
        `⚔️ OUTPLAYED! ${worldResult.rammedRival.name} sent packing!`,
      ];
      this.callbacks.onFloatingNotification(rivalPuns[this.rivalsKnockedOut % rivalPuns.length], 'COMBAT');
    }

    // Handle Hazard & Contraceptive Trap Collisions
    if (worldResult.hitHazard && this.invulnerableTimer <= 0) {
      const hType = worldResult.hitHazard.type;

      if (this.powerUps.shield > 0) {
        soundManager.playShieldDeflect();
        this.invulnerableTimer = 0.5;
        this.score += 200;
        this.callbacks.onFloatingNotification('🛡️ SHIELD DEFLECTED TRAP! +200 PTS', 'GOOD');
      } else {
        soundManager.playHitObstacle();
        this.heroSperm.triggerHitSquash();
        this.hitstopTimer = 0.06;
        this.cameraShake = 0.8;
        this.invulnerableTimer = 1.3;
        this.combo = 0;

        // Damage reduction from Alkaline Bio-Membrane upgrade
        const acidResist = 1 - this.upgrades.alkalineShield * 0.15;
        let dmg = 22 * acidResist;
        let punchline = '💥 OUCH! HAZARD HIT!';

        if (hType === 'NUVARING') {
          dmg = 15 * acidResist;
          punchline = '💍 NUVARING HORMONAL FIELD! Motility suppressed!';
        } else if (hType === 'COPPER_IUD') {
          dmg = 28 * acidResist;
          punchline = '⚡ COPPER-T IUD SHOCK! Spermicidal copper ions!';
        } else if (hType === 'SPERMICIDE_FOAM') {
          dmg = 24 * acidResist;
          punchline = '🧪 NONOXYNOL-9 FOAM! Membrane dissolved!';
        } else if (hType === 'WHITE_BLOOD_CELL') {
          dmg = 25;
          punchline = '🦠 MACROPHAGE CHOMP! Immune system detected you!';
        }

        this.health = Math.max(0, this.health - Math.round(dmg));
        this.callbacks.onFloatingNotification(punchline, 'BAD');

        if (this.health <= 0) {
          this.handlePlayerDeath();
          return;
        }
      }
    }

    if (worldResult.avoidedHazardsCount > 0) {
      this.obstaclesAvoided += worldResult.avoidedHazardsCount;
      this.score += worldResult.avoidedHazardsCount * 50;
    }

    // Handle Pickup Collection (Luminous Golden ATP & Power-ups)
    if (worldResult.collectedPickup) {
      const p = worldResult.collectedPickup;
      if (p.type === 'FRUCTOSE') {
        this.combo++;
        this.fructoseCount++;
        const pts = 100 * Math.min(this.combo, 5);
        this.score += pts;
        this.stamina = Math.min(this.maxStamina, this.stamina + 25);
        soundManager.playCollectATP(this.combo);
        this.callbacks.onFloatingNotification(`💎 +${pts} ATP HARVESTED!`, 'GOOD');
      } else {
        this.powerUpsCount++;
        this.score += 400;
        soundManager.playPowerUpCollect(p.type as PowerUpType);

        if (p.type === 'ENERGY_SPHERE') {
          this.powerUps.energy = 8.0;
          this.callbacks.onFloatingNotification('⚡ TURBO SPEED BOOST! (8s)', 'GOOD');
        } else if (p.type === 'SHIELD_BUBBLE') {
          this.powerUps.shield = 10.0;
          this.callbacks.onFloatingNotification('🛡️ SHIELD BUBBLE ONLINE! (10s)', 'GOOD');
        } else if (p.type === 'GUIDANCE_CRYSTAL') {
          this.powerUps.guidance = 12.0;
          this.callbacks.onFloatingNotification('🧭 RADAR MAGNETIZING ATP!', 'GOOD');
        }
      }
    }

    // 7. Dynamic Camera (Pulls back wide during open-air slow-mo flight)
    const isLeapPhase = this.progressT >= 0.47 && this.progressT <= 0.53;
    const camDistance = isLeapPhase ? 28 : 15 + (isBoosting ? 5 : 0);
    const camHeight = isLeapPhase ? 8.5 : 4.8;

    _vCamDesired.copy(_vPlayerPos)
      .addScaledVector(_vTangent, -camDistance)
      .addScaledVector(_vBinormal, camHeight);

    if (this.cameraShake > 0) {
      _vCamDesired.x += (Math.random() - 0.5) * this.cameraShake * 2.5;
      _vCamDesired.y += (Math.random() - 0.5) * this.cameraShake * 2.5;
      this.cameraShake = Math.max(0, this.cameraShake - delta * 3.5);
    }

    this.camera.position.lerp(_vCamDesired, delta * 9);
    _vCamTarget.copy(_vPlayerPos).addScaledVector(_vTangent, 12);
    this.camera.lookAt(_vCamTarget);

    const racePos = Math.max(1, 100 - Math.round(this.progressT * 85) - this.rivalsKnockedOut);

    // Update UI Stats
    this.callbacks.onStatsUpdate({
      health: Math.round(this.health),
      stamina: Math.round(this.stamina),
      speed: Math.round(this.currentSpeed),
      progress: Math.round(this.progressT * 100),
      totalDistanceTraveled: Math.round(this.progressT * 320),
      fructoseCollected: this.fructoseCount,
      energySpheresCollected: this.powerUpsCount,
      shieldsCollected: Math.round(this.powerUps.shield),
      crystalsCollected: Math.round(this.powerUps.guidance),
      obstaclesAvoided: this.obstaclesAvoided,
      rivalsKnockedOut: this.rivalsKnockedOut,
      trapsAvoided: this.trapsAvoided,
      racePosition: racePos,
      totalRacers: this.totalRacers,
      currentZoneIndex: this.currentZoneIndex,
      isBoosting,
      score: this.score,
      combo: this.combo,
      activePowerUps: {
        energy: Math.ceil(this.powerUps.energy),
        shield: Math.ceil(this.powerUps.shield),
        guidance: Math.ceil(this.powerUps.guidance),
      },
      invulnerableTimer: this.invulnerableTimer,
      currentFluidSurge: this.fluidSurgeModifier,
      inSlowMotion: this.inSlowMotion,
      activeUpgrades: this.upgrades,
    });

    if (this.progressT >= 0.99) {
      this.handleGrandConceptionVictory();
    }
  }

  private handlePlayerDeath() {
    this.isRunning = false;
    soundManager.playHitObstacle();
    this.callbacks.onGameOver(this.score, this.currentZoneIndex);
  }

  private handleGrandConceptionVictory() {
    this.isRunning = false;
    soundManager.playVictoryFanfare();

    let rank: 'S' | 'A' | 'B' | 'C' = 'C';
    let stars = 1;

    if (this.timeElapsed <= 240 && this.health > 70) {
      rank = 'S';
      stars = 3;
    } else if (this.timeElapsed <= 320) {
      rank = 'A';
      stars = 2;
    } else {
      rank = 'B';
      stars = 2;
    }

    const result: LevelResult = {
      levelNumber: 11,
      levelName: 'The Golden Oocyte & Conception',
      timeElapsed: Math.round(this.timeElapsed * 10) / 10,
      targetTime: 240,
      score: this.score + 10000 + this.rivalsKnockedOut * 500,
      fructoseCollected: this.fructoseCount,
      powerUpsGathered: this.powerUpsCount,
      obstaclesAvoided: this.obstaclesAvoided,
      rivalsKnockedOut: this.rivalsKnockedOut,
      trapsAvoided: this.trapsAvoided,
      rank,
      stars,
      isGameComplete: true,
    };

    this.callbacks.onVictory(result);
  }

  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('resize', this.handleResize);

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      clearTimeout(this.animationFrameId);
    }

    this.world.dispose();
    this.heroSperm.dispose();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
