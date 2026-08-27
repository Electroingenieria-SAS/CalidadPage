export type AssetKind = "image" | "audio";

export type AssetEntry = {
  kind: AssetKind;
  key: string;
  url: string;
};

const PACO: AssetEntry[] = [
  { kind: "image", key: "paco-idle", url: "/assets/paco-game/paco-four/idle.png" },
  { kind: "image", key: "paco-walk", url: "/assets/paco-game/paco-four/walk.png" },
  { kind: "image", key: "paco-jump", url: "/assets/paco-game/paco-four/jump.png" },
  { kind: "image", key: "paco-fall", url: "/assets/paco-game/paco-four/fall.png" },
];

const BACKGROUNDS = Array.from({ length: 6 }, (_, index) => ({
  kind: "image" as const,
  key: `hill-${index + 1}`,
  url: `/assets/paco-game/backgrounds/Hills Layer 0${index + 1}.png`,
}));

export const ASSET_GROUPS: Record<string, AssetEntry[]> = {
  core: [
    { kind: "image", key: "pickup-lightbulb", url: "/assets/paco-game/collectibles/lightbulb.png" },
  ],
  paco: PACO,
  environment: [
    ...BACKGROUNDS,
    { kind: "image", key: "decor-pole", url: "/assets/paco-game/decor/utility-pole.png" },
    { kind: "image", key: "decor-lamp", url: "/assets/paco-game/decor/street-lamp.png" },
    { kind: "image", key: "obstacle-cone", url: "/assets/paco-game/obstacles/cone.png" },
    { kind: "image", key: "obstacle-toolbox", url: "/assets/paco-game/obstacles/toolbox.png" },
    { kind: "image", key: "obstacle-reel", url: "/assets/paco-game/obstacles/cable-reel.png" },
    { kind: "image", key: "obstacle-cabinet", url: "/assets/paco-game/obstacles/electrical-cabinet.png" },
    { kind: "image", key: "obstacle-barrier", url: "/assets/paco-game/obstacles/barrier.png" },
    { kind: "image", key: "obstacle-pothole", url: "/assets/paco-game/obstacles/pothole.png" },
    { kind: "image", key: "obstacle-spikerack", url: "/assets/paco-game/obstacles/spike-rack.png" },
    { kind: "image", key: "obstacle-generator", url: "/assets/paco-game/obstacles/generator.png" },
    { kind: "image", key: "obstacle-compressor", url: "/assets/paco-game/obstacles/compressor.png" },
    { kind: "image", key: "obstacle-saw", url: "/assets/paco-game/obstacles/sawblade.png" },
  ],
  level_02: [],
  level_03: [],
  level_04: [],
  level_05: [],
  level_06: [],
  boss: [],
};

export const SHARED_ASSET_GROUPS = ["core", "paco", "environment"];
