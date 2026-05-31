/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AVRYTHINK SUITE — Slides Type Definitions
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface SlideElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'video' | 'table' | 'icon';
  x: number;       // percentage 0-100
  y: number;       // percentage 0-100
  width: number;   // percentage 0-100
  height: number;  // percentage 0-100
  rotation: number;
  opacity: number;
  zIndex: number;
  locked?: boolean;
  // Type-specific props
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  textAlign?: string;
  shapeType?: 'rectangle' | 'circle' | 'rounded' | 'diamond';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  src?: string;
  rows?: number;
  cols?: number;
}

export type TransitionType =
  | 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
  | 'push-left' | 'push-right' | 'zoom-in' | 'zoom-out' | 'flip'
  | 'dissolve' | 'cube' | 'wipe-left';

export type EasingType = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';

export interface SlideTransition {
  type: TransitionType;
  duration: number; // ms
  easing: EasingType;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
  transition: SlideTransition;
  notes: string;
  hidden: boolean;
}

export interface DeckSettings {
  theme: string;
  aspectRatio: '16:9' | '4:3';
}

export type SlidesTool = 'select' | 'text' | 'shape-rect' | 'shape-circle' | 'shape-rounded' | 'image' | 'table';

export const DEFAULT_TRANSITION: SlideTransition = {
  type: 'fade',
  duration: 300,
  easing: 'ease-out',
};

export function createDefaultSlide(id: string): Slide {
  return {
    id,
    elements: [],
    background: '#FFFFFF',
    transition: { ...DEFAULT_TRANSITION },
    notes: '',
    hidden: false,
  };
}

export function createDefaultElement(type: SlideElement['type'], overrides: Partial<SlideElement> = {}): SlideElement {
  const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base: SlideElement = {
    id,
    type,
    x: 25,
    y: 20,
    width: 50,
    height: 30,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
  };

  switch (type) {
    case 'text':
      return {
        ...base,
        content: 'Click to edit text',
        fontSize: 18,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 400,
        color: '#1C1B19',
        textAlign: 'left',
        ...overrides,
      };
    case 'shape':
      return {
        ...base,
        shapeType: 'rectangle',
        fill: '#FF3333',
        stroke: 'transparent',
        strokeWidth: 0,
        ...overrides,
      };
    case 'image':
      return {
        ...base,
        src: '',
        ...overrides,
      };
    default:
      return { ...base, ...overrides };
  }
}
