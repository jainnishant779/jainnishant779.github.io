import * as THREE from 'three';

export interface CameraWaypoint {
  progress: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  eventHint?: string;
}

export const CAMERA_WAYPOINTS: CameraWaypoint[] = [
  {
    progress: 0.0,
    position: new THREE.Vector3(0, 1.6, 18),
    lookAt: new THREE.Vector3(0, 3.5, 0),
    eventHint: 'SCROLL / ACCESS THE FACILITY',
  },
  {
    progress: 0.12,
    position: new THREE.Vector3(0, 1.6, 9),
    lookAt: new THREE.Vector3(0, 3.5, 0),
    eventHint: 'MOUNTAIN GATE ACCESS',
  },
  {
    progress: 0.30,
    position: new THREE.Vector3(0, 1.6, 8),
    lookAt: new THREE.Vector3(0, 3.5, 0),
    eventHint: 'GATE UNLOCKING',
  },
  {
    progress: 0.45,
    position: new THREE.Vector3(0, 0.6, -20),
    lookAt: new THREE.Vector3(0, 0.6, -35),
    eventHint: 'ENTERING THE FACILITY',
  },
  {
    progress: 0.58,
    position: new THREE.Vector3(0, 0.6, -32),
    lookAt: new THREE.Vector3(0, 4.0, -50),
    eventHint: 'CAVERN REVEAL',
  },
  {
    progress: 0.72,
    position: new THREE.Vector3(-8, 0.6, -42),
    lookAt: new THREE.Vector3(-16, 0.6, -42),
    eventHint: 'INSPECT SUIT',
  },
  {
    progress: 0.92,
    position: new THREE.Vector3(0, 2.6, -58),
    lookAt: new THREE.Vector3(0, 2.6, -65),
    eventHint: 'APPROACHING WORKSTATION',
  },
  {
    progress: 1.0,
    position: new THREE.Vector3(0, 2.6, -61),
    lookAt: new THREE.Vector3(0, 2.6, -66),
    eventHint: 'E / TAP — ACCESS COMPUTER',
  },
];

// Continuous CatmullRom splines sampled by normalised progress
export const positionSpline = new THREE.CatmullRomCurve3(
  CAMERA_WAYPOINTS.map((w) => w.position),
  false,
  'catmullrom',
  0.25
);

export const lookAtSpline = new THREE.CatmullRomCurve3(
  CAMERA_WAYPOINTS.map((w) => w.lookAt),
  false,
  'catmullrom',
  0.25
);

/**
 * Sample camera position and lookAt at progress 0..1
 */
export function sampleCameraPose(
  p: number,
  targetPos: THREE.Vector3,
  targetLook: THREE.Vector3
): void {
  const clamped = Math.max(0, Math.min(1, p));
  positionSpline.getPointAt(clamped, targetPos);
  lookAtSpline.getPointAt(clamped, targetLook);
}

/**
 * Get active event hint for current progress
 */
export function getActiveHint(p: number): string {
  const waypoint = CAMERA_WAYPOINTS.slice()
    .reverse()
    .find((w) => p >= w.progress);
  return waypoint?.eventHint || 'SCROLL TO EXPLORE';
}
