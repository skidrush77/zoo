import { SECTION_COUNT, SECTION_ANGLE } from "./wheelData";

export const SPIN_DURATION = 10000; // ms
export const MIN_ROTATIONS = 6;
export const MAX_INITIAL_VELOCITY = 0.03; // rad/ms

export interface PhysicsState {
  startAngle: number;
  totalRotation: number;
  startTime: number;
  duration: number;
  targetSectionIndex: number;
}

export function easeOutExponential(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function getCurrentVelocity(t: number): number {
  // derivative of easeOutExponential scaled to initial velocity
  return MAX_INITIAL_VELOCITY * Math.pow(1 - t, 2);
}

export function createSpinState(currentAngle: number): PhysicsState {
  const targetSectionIndex = Math.floor(Math.random() * SECTION_COUNT);
  // pointer is at top (270deg = 3π/2), section center within that section
  const sectionCenterOffset = SECTION_ANGLE / 2;
  const pointerAngle = Math.PI * 1.5;
  // We want: (pointerAngle - (currentAngle + totalRotation)) % 2π ≈ targetSectionIndex * SECTION_ANGLE + sectionCenterOffset
  const desiredFinalAngle =
    pointerAngle - (targetSectionIndex * SECTION_ANGLE + sectionCenterOffset);
  // Normalize to [0, 2π)
  const normalizedCurrent = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const normalizedTarget = ((desiredFinalAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  let deltaAngle = normalizedTarget - normalizedCurrent;
  if (deltaAngle < 0) deltaAngle += Math.PI * 2;

  const totalRotation = MIN_ROTATIONS * Math.PI * 2 + deltaAngle;

  return {
    startAngle: currentAngle,
    totalRotation,
    startTime: 0, // set when animation begins
    duration: SPIN_DURATION,
    targetSectionIndex,
  };
}

export function getWinnerIndex(finalAngle: number): number {
  const pointerAngle = Math.PI * 1.5;
  const normalized = ((finalAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const relativeAngle = ((pointerAngle - normalized) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  return Math.floor(relativeAngle / SECTION_ANGLE) % SECTION_COUNT;
}
