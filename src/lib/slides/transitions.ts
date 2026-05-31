/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AVRYTHINK SUITE — Slide Transitions Engine
   Pure CSS animations, no Framer Motion.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import type { SlideTransition, TransitionType, EasingType } from './types';

export type { TransitionType, EasingType, SlideTransition };

export const DEFAULT_TRANSITION: SlideTransition = {
  type: 'fade',
  duration: 300,
  easing: 'ease-out',
};

export const TRANSITION_TYPES: { type: TransitionType; label: string; description: string }[] = [
  { type: 'none', label: 'None', description: 'Instant swap' },
  { type: 'fade', label: 'Fade', description: 'Cross-fade' },
  { type: 'slide-left', label: 'Slide Left', description: 'Current exits left' },
  { type: 'slide-right', label: 'Slide Right', description: 'Current exits right' },
  { type: 'slide-up', label: 'Slide Up', description: 'Current exits up' },
  { type: 'slide-down', label: 'Slide Down', description: 'Current enters from below' },
  { type: 'push-left', label: 'Push Left', description: 'Parallax push' },
  { type: 'push-right', label: 'Push Right', description: 'Parallax push reverse' },
  { type: 'zoom-in', label: 'Zoom In', description: 'Next zooms in' },
  { type: 'zoom-out', label: 'Zoom Out', description: 'Current zooms out' },
  { type: 'flip', label: 'Flip', description: '3D flip' },
  { type: 'dissolve', label: 'Dissolve', description: 'Blur cross-fade' },
  { type: 'cube', label: 'Cube', description: '3D cube rotation' },
  { type: 'wipe-left', label: 'Wipe', description: 'Clip wipe' },
];

export const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
  { value: 'spring', label: 'Spring' },
];

/**
 * Returns CSS class names and inline styles for entering/exiting slides.
 * `direction` indicates whether this is the slide entering or exiting.
 */
export function getTransitionCSS(
  transition: SlideTransition,
  direction: 'entering' | 'exiting',
): { className: string; style: React.CSSProperties } {
  const duration = transition.duration;

  let easing = 'ease-out';
  switch (transition.easing) {
    case 'ease': easing = 'ease'; break;
    case 'ease-in': easing = 'ease-in'; break;
    case 'ease-out': easing = 'ease-out'; break;
    case 'ease-in-out': easing = 'ease-in-out'; break;
    case 'spring': easing = 'cubic-bezier(0.16, 1, 0.3, 1)'; break;
  }

  if (transition.type === 'none') {
    return { className: '', style: {} };
  }

  const base: Record<string, { enter: React.CSSProperties; exit: React.CSSProperties }> = {
    fade: {
      enter: { opacity: 1, transition: `opacity ${duration}ms ${easing}` },
      exit: { opacity: 0, transition: `opacity ${duration}ms ${easing}` },
    },
    'slide-left': {
      enter: { transform: 'translateX(0)', opacity: 1, transition: `all ${duration}ms ${easing}` },
      exit: { transform: 'translateX(-100%)', opacity: 0, transition: `all ${duration}ms ${easing}` },
    },
    'slide-right': {
      enter: { transform: 'translateX(0)', opacity: 1, transition: `all ${duration}ms ${easing}` },
      exit: { transform: 'translateX(100%)', opacity: 0, transition: `all ${duration}ms ${easing}` },
    },
    'slide-up': {
      enter: { transform: 'translateY(0)', opacity: 1, transition: `all ${duration}ms ${easing}` },
      exit: { transform: 'translateY(-100%)', opacity: 0, transition: `all ${duration}ms ${easing}` },
    },
    'slide-down': {
      enter: { transform: 'translateY(0)', opacity: 1, transition: `all ${duration}ms ${easing}` },
      exit: { transform: 'translateY(100%)', opacity: 0, transition: `all ${duration}ms ${easing}` },
    },
    'push-left': {
      enter: { transform: 'translateX(0)', transition: `transform ${duration}ms ${easing}` },
      exit: { transform: 'translateX(-100%)', transition: `transform ${duration}ms ${easing}` },
    },
    'push-right': {
      enter: { transform: 'translateX(0)', transition: `transform ${duration}ms ${easing}` },
      exit: { transform: 'translateX(100%)', transition: `transform ${duration}ms ${easing}` },
    },
    'zoom-in': {
      enter: { transform: 'scale(1)', opacity: 1, transition: `all ${duration}ms ${easing}` },
      exit: { transform: 'scale(1.08)', opacity: 0, transition: `all ${duration}ms ${easing}` },
    },
    'zoom-out': {
      enter: { transform: 'scale(1)', opacity: 1, transition: `all ${duration}ms ${easing}` },
      exit: { transform: 'scale(0.92)', opacity: 0, transition: `all ${duration}ms ${easing}` },
    },
    flip: {
      enter: { transform: 'rotateY(0deg)', opacity: 1, transition: `all ${duration}ms ${easing}`, perspective: '1200px' },
      exit: { transform: 'rotateY(-90deg)', opacity: 0, transition: `all ${duration}ms ${easing}`, perspective: '1200px' },
    },
    dissolve: {
      enter: { opacity: 1, filter: 'blur(0px)', transition: `all ${duration}ms ${easing}` },
      exit: { opacity: 0, filter: 'blur(4px)', transition: `all ${duration}ms ${easing}` },
    },
    cube: {
      enter: {
        transform: 'rotateY(0deg)',
        transition: `transform ${duration}ms ${easing}`,
        transformStyle: 'preserve-3d' as React.CSSProperties['transformStyle'],
        perspective: '1200px',
      },
      exit: {
        transform: 'rotateY(90deg)',
        transition: `transform ${duration}ms ${easing}`,
        transformStyle: 'preserve-3d' as React.CSSProperties['transformStyle'],
        perspective: '1200px',
      },
    },
    'wipe-left': {
      enter: { clipPath: 'inset(0 0 0 0)', transition: `clip-path ${duration}ms ${easing}` },
      exit: { clipPath: 'inset(0 100% 0 0)', transition: `clip-path ${duration}ms ${easing}` },
    },
  };

  const t = base[transition.type] || base.fade;
  const style = direction === 'entering' ? t.enter : t.exit;
  return { className: '', style };
}

/**
 * Returns the "from" (pre-animation) CSS properties for a slide that is about to enter.
 * This sets the initial state before the CSS transition kicks in.
 */
export function getTransitionFromState(transition: SlideTransition): React.CSSProperties {
  if (transition.type === 'none') return {};

  const map: Partial<Record<TransitionType, React.CSSProperties>> = {
    fade: { opacity: 0 },
    'slide-left': { transform: 'translateX(100%)', opacity: 0 },
    'slide-right': { transform: 'translateX(-100%)', opacity: 0 },
    'slide-up': { transform: 'translateY(100%)', opacity: 0 },
    'slide-down': { transform: 'translateY(-100%)', opacity: 0 },
    'push-left': { transform: 'translateX(100%)' },
    'push-right': { transform: 'translateX(-100%)' },
    'zoom-in': { transform: 'scale(0.92)', opacity: 0 },
    'zoom-out': { transform: 'scale(1.08)', opacity: 0 },
    flip: { transform: 'rotateY(90deg)', opacity: 0, perspective: '1200px' },
    dissolve: { opacity: 0, filter: 'blur(4px)' },
    cube: { transform: 'rotateY(-90deg)', transformStyle: 'preserve-3d' as React.CSSProperties['transformStyle'], perspective: '1200px' },
    'wipe-left': { clipPath: 'inset(0 0 0 100%)' },
  };

  return map[transition.type] ?? { opacity: 0 };
}

/**
 * Returns the "to" (post-animation) CSS properties for a slide that has fully entered.
 */
export function getTransitionToState(transition: SlideTransition): React.CSSProperties {
  if (transition.type === 'none') return {};

  const map: Partial<Record<TransitionType, React.CSSProperties>> = {
    fade: { opacity: 1 },
    'slide-left': { transform: 'translateX(0)', opacity: 1 },
    'slide-right': { transform: 'translateX(0)', opacity: 1 },
    'slide-up': { transform: 'translateY(0)', opacity: 1 },
    'slide-down': { transform: 'translateY(0)', opacity: 1 },
    'push-left': { transform: 'translateX(0)' },
    'push-right': { transform: 'translateX(0)' },
    'zoom-in': { transform: 'scale(1)', opacity: 1 },
    'zoom-out': { transform: 'scale(1)', opacity: 1 },
    flip: { transform: 'rotateY(0deg)', opacity: 1, perspective: '1200px' },
    dissolve: { opacity: 1, filter: 'blur(0px)' },
    cube: { transform: 'rotateY(0deg)', transformStyle: 'preserve-3d' as React.CSSProperties['transformStyle'], perspective: '1200px' },
    'wipe-left': { clipPath: 'inset(0 0 0 0)' },
  };

  return map[transition.type] ?? { opacity: 1 };
}
