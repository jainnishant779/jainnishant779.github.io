/* ============================================================
 * layout.ts — Project Nightfall World Coordinates (metres)
 * Reference system: +Y up; visitor walks toward −Z
 * All world positions MUST come from this file.
 * ============================================================ */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BoxDimensions {
  width: number;
  height: number;
  depth: number;
}

/** Camera starting pose outside the mountain gate */
export const EXTERIOR_START: Vec3 = { x: 0, y: 1.6, z: 18 };

/** Mountain Gate structure */
export const GATE = {
  centre: { x: 0, y: 4, z: 0 } as Vec3,
  opening: { width: 8, height: 7 } as { width: number; height: number },
  slideDeltaX: 4.5,
};

/** Concrete bunker portal frame around gate */
export const BUNKER_PORTAL = {
  frame: { width: 12, height: 10, depth: 3 } as BoxDimensions,
  cliffZ: 0,
};

/** Tunnel connecting portal to main cavern */
export const TUNNEL = {
  startZ: 0,
  endZ: -20,
  width: 6,
  height: 6,
  floorStartY: 0,
  floorEndY: -1,
};

/** Main Cavern dimensions (displaced inverted ellipsoid) */
export const CAVERN = {
  centre: { x: 0, y: 8, z: -50 } as Vec3,
  radii: { x: 34, y: 18, z: 30 } as Vec3,
};

/** Steel grating main walkway */
export const MAIN_WALKWAY = {
  startY: -1,
  start: { x: 0, y: -1, z: -20 } as Vec3,
  end: { x: 0, y: -1, z: -55 } as Vec3,
  width: 3,
};

/** Water channel & waterfall on the East side */
export const WATER_CHANNEL = {
  minX: 14,
  maxX: 26,
  startZ: -30,
  endZ: -75,
  surfaceY: -4,
  waterfallSource: { x: 24, y: 6, z: -62 } as Vec3,
  waterfallTargetY: -4,
};

/** Suit display platform on the West side */
export const SUIT_PLATFORM = {
  centre: { x: -16, y: -1, z: -42 } as Vec3,
  deckSize: { width: 5, depth: 5 },
  junctionZ: -42,
};

/** Suit glass display case */
export const SUIT_CASE = {
  dimensions: { width: 1.6, height: 2.6, depth: 1.6 } as BoxDimensions,
  plinthHeight: 0.4,
  suitFacing: '+X', // toward main walkway
};

/** Raised command platform */
export const COMMAND_PLATFORM = {
  centre: { x: 0, y: 1, z: -62 } as Vec3,
  deckSize: { width: 12, depth: 8 },
  stairStartZ: -55,
  stairStartY: -1,
  stairEndZ: -58,
  stairEndY: 1,
};

/** Batcomputer / Workstation command console */
export const BATCOMPUTER = {
  deskCentre: { x: 0, y: 1, z: -65 } as Vec3,
  monitorCount: 5,
  arcRadius: 2.2,
  facing: '+Z',
  mainScreen: {
    centre: { x: 0, y: 2.6, z: -66 } as Vec3,
    width: 1.8,
    height: 1.0,
  },
};

/** Final camera pose when zoomed into the main monitor */
export const SCREEN_CAMERA_POSE = {
  position: { x: 0, y: 2.55, z: -64.1 } as Vec3,
  lookAt: { x: 0, y: 2.6, z: -66 } as Vec3,
};

/** Orbit controls constraints for inspecting the armored suit */
export const SUIT_ORBIT = {
  target: { x: -16, y: 0.6, z: -42 } as Vec3,
  minRadius: 3.2,
  maxRadius: 5.0,
  minPolarAngle: (60 * Math.PI) / 180,
  maxPolarAngle: (95 * Math.PI) / 180,
};

/** Interaction radii in metres */
export const INTERACT_RADIUS = {
  workstation: 2.5,
  suit: 3.0,
};

/** Lighting configuration (max 6 real lights) */
export const LIGHTS = {
  gateSpotLeft: { x: -4, y: 6, z: 2 } as Vec3,
  gateSpotRight: { x: 4, y: 6, z: 2 } as Vec3,
  cavernCoolFill: { x: 0, y: 15, z: -45 } as Vec3,
  workstationPoint: { x: 0, y: 3.8, z: -65 } as Vec3,
  suitSpot: { x: -16, y: 4.5, z: -42 } as Vec3,
  monitorPoint: { x: 0, y: 2.6, z: -65 } as Vec3,
};
