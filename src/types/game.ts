/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type PowerUpType = 'ENERGY_SPHERE' | 'SHIELD_BUBBLE' | 'GUIDANCE_CRYSTAL';

export type HazardType = 
  | 'WHITE_BLOOD_CELL'    // Aggressive immune macrophage that chases
  | 'ACID_DROPLET'        // Low pH damaging blob
  | 'CONSTRICTION_VALVE'  // Muscular sphincter that opens/closes
  | 'FLUID_SURGE'         // Forward peristaltic booster or backward counter-current
  // Contraceptive & Anatomical Traps
  | 'CONDOM_BLOCKER'      // Latex wall / reservoir tip barrier that bounces sperm back
  | 'FEMALE_CONDOM'       // Polyurethane flexible ring & pouch labyrinth in vagina
  | 'NUVARING'            // 54mm flexible ring emitting hormonal slowing field
  | 'COPPER_IUD'          // Copper T-shaped intrauterine device radiating spermicidal ions
  | 'PLAN_B_MUCUS'        // Hyper-dense progestin cervical mucus barrier
  | 'SPERMICIDE_FOAM';    // Acidic nonoxynol-9 chemical trap

export interface AnatomicalZone {
  id: number;
  name: string;
  location: string;
  tract: 'MALE' | 'TRANSITION' | 'FEMALE';
  startT: number;
  endT: number;
  themeColor: string;
  fogColor: number;
  ambientColor: number;
  description: string;
  humorQuote: string;
  tunnelRadius: number;
}

export const ANATOMICAL_ZONES: AnatomicalZone[] = [
  {
    id: 1,
    name: 'Seminiferous Nursery',
    location: 'Testis (The Genesis Hatchery)',
    tract: 'MALE',
    startT: 0.0,
    endT: 0.12,
    themeColor: '#fb7185',
    fogColor: 0x2a0d18,
    ambientColor: 0xff8fa3,
    description: 'Where 250 million hopeful little swimmers are born with fresh flagella and big dreams.',
    humorQuote: '“Welcome to existence, kid. Statistically, you have a 0.0000004% chance. Have fun!”',
    tunnelRadius: 18,
  },
  {
    id: 2,
    name: 'Epididymis Training Coils',
    location: 'Maturation Reservoir',
    tract: 'MALE',
    startT: 0.12,
    endT: 0.24,
    themeColor: '#f43f5e',
    fogColor: 0x260714,
    ambientColor: 0xfb7185,
    description: 'Boot camp for flagellum propulsion. Coiled tubules where sperm learn how to swim in straight lines (mostly).',
    humorQuote: '“Wiggle left, wiggle right! If you don’t move your tail, you become a cellular snack!”',
    tunnelRadius: 20,
  },
  {
    id: 3,
    name: 'Vas Deferens Muscle Highway',
    location: 'Spermatic Cord Accelerator',
    tract: 'MALE',
    startT: 0.24,
    endT: 0.35,
    themeColor: '#a855f7',
    fogColor: 0x1f0b33,
    ambientColor: 0xc084fc,
    description: 'Smooth muscle peristaltic highway. Extreme muscular pressure launches you toward the launch pad.',
    humorQuote: '“Hold onto your acrosome! We’re going from 0 to 11 mph in one peristaltic squeeze!”',
    tunnelRadius: 22,
  },
  {
    id: 4,
    name: 'Prostate & Seminal Caverns',
    location: 'Chemical Fuel Depot',
    tract: 'MALE',
    startT: 0.35,
    endT: 0.43,
    themeColor: '#38bdf8',
    fogColor: 0x06283d,
    ambientColor: 0x7dd3fc,
    description: 'Fuel up on fructose, zinc, and alkaline buffers before entering the hostile outside world.',
    humorQuote: '“Drink your seminal fructose, boys. Where we’re going, pH drops faster than a bad pickup line.”',
    tunnelRadius: 24,
  },
  {
    id: 5,
    name: 'Penile Urethra & Glans Launch',
    location: 'The Exit Barrel',
    tract: 'TRANSITION',
    startT: 0.43,
    endT: 0.47,
    themeColor: '#00f2fe',
    fogColor: 0x031d2e,
    ambientColor: 0x38bdf8,
    description: 'Pressurizing at the Glans Penis. Prepare for the great slow-motion bullet-time leap!',
    humorQuote: '“May the odds be ever in your motility. ALL ENGINES FULL AHEAD!”',
    tunnelRadius: 17,
  },
  {
    id: 6,
    name: 'THE GREAT OPEN-AIR LEAP',
    location: 'Trajectory Fork (Penile Exit -> Vagina)',
    tract: 'TRANSITION',
    startT: 0.47,
    endT: 0.53,
    themeColor: '#fde047',
    fogColor: 0x0b1329,
    ambientColor: 0xfef08a,
    description: 'Open-air slow-motion flight! Steer toward the Vaginal Portal and avoid the Trojan Condom & Bedsheet Void!',
    humorQuote: '“AIM CAREFULLY! One wrong twitch and you end up on a college dorm towel!”',
    tunnelRadius: 55,
  },
  {
    id: 7,
    name: 'Vaginal Rugae & Contraceptive Maze',
    location: 'Female Reproductive Vault',
    tract: 'FEMALE',
    startT: 0.53,
    endT: 0.65,
    themeColor: '#ec4899',
    fogColor: 0x2e071f,
    ambientColor: 0xf472b6,
    description: 'Acidic pH 4.0 cavern filled with folded tissue, NuvaRing hormonal suppression fields, and Female Condom pouches.',
    humorQuote: '“It’s dark, it’s acidic, and there’s a giant NuvaRing glowing like a disco hula-hoop.”',
    tunnelRadius: 38,
  },
  {
    id: 8,
    name: 'The Cervical Fortress & Plan B Barrier',
    location: 'Internal Os & Crypts',
    tract: 'FEMALE',
    startT: 0.65,
    endT: 0.76,
    themeColor: '#e11d48',
    fogColor: 0x330612,
    ambientColor: 0xfb7185,
    description: 'Labyrinth of mucosal channels fortified by Plan B progestin thickeners and Nonoxynol-9 spermicide foam.',
    humorQuote: '“99% of your brothers are stuck in cervical mucus like prehistoric insects in amber.”',
    tunnelRadius: 22,
  },
  {
    id: 9,
    name: 'Uterine Cavern & The Copper IUD',
    location: 'Endometrial Amphitheater',
    tract: 'FEMALE',
    startT: 0.76,
    endT: 0.86,
    themeColor: '#c026d3',
    fogColor: 0x29042b,
    ambientColor: 0xe879f9,
    description: 'Vast muscular cavern patrolled by hungry white blood cells and the dreaded metallic Copper-T IUD!',
    humorQuote: '“Behold the Copper T! The gynecological monolith of anti-conception!”',
    tunnelRadius: 46,
  },
  {
    id: 10,
    name: 'Fallopian Cilia Rapids',
    location: 'Oviduct Isthmus & Ampulla',
    tract: 'FEMALE',
    startT: 0.86,
    endT: 0.94,
    themeColor: '#f59e0b',
    fogColor: 0x241201,
    ambientColor: 0xfbbf24,
    description: 'Lush canyon of waving epithelial cilia beating downstream against you. The upstream salmon run!',
    humorQuote: '“Upstream against 20 million microscopic hairs. Who designed this highway anyway?!”',
    tunnelRadius: 22,
  },
  {
    id: 11,
    name: 'The Corona Radiata & Golden Oocyte',
    location: 'The Final Conception Rendezvous',
    tract: 'FEMALE',
    startT: 0.94,
    endT: 1.0,
    themeColor: '#eab308',
    fogColor: 0x1f1601,
    ambientColor: 0xfef08a,
    description: 'The ultimate boss battle: Fight through the final rival sperm swarm drilling into the Zona Pellucida to achieve conception!',
    humorQuote: '“THIS IS IT! Drill your enzyme cap into the receptor and claim the trophy of LIFE!”',
    tunnelRadius: 58,
  },
];

export interface PlayerStats {
  health: number; // 0 - 100
  stamina: number; // 0 - 100 (ATP)
  speed: number; // in um/s (smooth comfortable range ~35 - 180)
  progress: number; // 0 - 100% across the full continuous anatomical journey
  totalDistanceTraveled: number; // in um / mm
  fructoseCollected: number;
  energySpheresCollected: number;
  shieldsCollected: number;
  crystalsCollected: number;
  obstaclesAvoided: number;
  rivalsKnockedOut: number;
  trapsAvoided: number;
  racePosition: number;
  totalRacers: number;
  currentZoneIndex: number;
  isBoosting: boolean;
  score: number;
  combo: number;
  activePowerUps: {
    energy: number;
    shield: number;
    guidance: number;
  };
  invulnerableTimer: number;
  currentFluidSurge: number;
  inSlowMotion: boolean;
  activeUpgrades: PlayerUpgrades;
}

export interface PlayerUpgrades {
  tailPower: number;      // 0 to 5: Increases base speed & agility (+15% each)
  atpTank: number;        // 0 to 5: Increases max stamina & boost efficiency
  acrosomeArmor: number;  // 0 to 5: Increases ramming knockback & collision defense
  alkalineShield: number; // 0 to 5: Reduces damage from acid & spermicide by up to 50%
  chemotaxisMagnet: number;// 0 to 5: Widens magnetic attraction radius for ATP gems
}

export const UPGRADE_DEFINITIONS = [
  {
    id: 'tailPower' as keyof PlayerUpgrades,
    name: 'Flagellum Turbo Whip',
    icon: '⚡',
    description: 'Reinforces axial microtubules for higher cruising speed and razor-sharp steering.',
    baseCost: 250,
    maxLevel: 5,
    perk: '+15% Base Swim Speed & Turn Agility per level',
  },
  {
    id: 'atpTank' as keyof PlayerUpgrades,
    name: 'Mitochondrial Reactor',
    icon: '🔋',
    description: 'Expands the spiral mitochondrial engine in the midpiece for longer boost duration.',
    baseCost: 300,
    maxLevel: 5,
    perk: '+20% Maximum Stamina & Faster Recharge per level',
  },
  {
    id: 'acrosomeArmor' as keyof PlayerUpgrades,
    name: 'Hardened Acrosome Helmet',
    icon: '🛡️',
    description: 'Toughens the protective enzyme cap to smash through rival sperm and deflect impacts.',
    baseCost: 350,
    maxLevel: 5,
    perk: '+35% Ramming Knockout Force & -15% Crash Damage per level',
  },
  {
    id: 'alkalineShield' as keyof PlayerUpgrades,
    name: 'Alkaline Bio-Membrane',
    icon: '🧪',
    description: 'Thickens basic seminal buffer coating to resist vaginal acid, spermicide, and hormonal mist.',
    baseCost: 400,
    maxLevel: 5,
    perk: '-20% Acid & Spermicide Damage per level',
  },
  {
    id: 'chemotaxisMagnet' as keyof PlayerUpgrades,
    name: 'Progesterone Chemotaxis Radar',
    icon: '🧭',
    description: 'Heightens olfactory sensitivity to magnetically vacuum nearby ATP fructose gems.',
    baseCost: 300,
    maxLevel: 5,
    perk: '+30% Fructose Magnet Attraction Radius per level',
  },
];

export interface LevelResult {
  levelNumber: number;
  levelName: string;
  timeElapsed: number;
  targetTime: number;
  score: number;
  fructoseCollected: number;
  powerUpsGathered: number;
  obstaclesAvoided: number;
  rivalsKnockedOut: number;
  trapsAvoided: number;
  rank: 'S' | 'A' | 'B' | 'C';
  stars: number;
  isGameComplete: boolean;
}
