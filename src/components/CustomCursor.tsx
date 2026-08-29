import React, { useEffect, useRef, useState } from 'react';
import {
  CursorTone,
  getCursorPalette,
  shouldEnableCustomCursor,
} from '../lib/portfolioUi';

type CustomCursorProps = {
  reducedMotion?: boolean;
};

type Particle = {
  color: string;
  life: number;
  maxLife: number;
  size: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

type PointerState = {
  dotScale: number;
  initialized: boolean;
  interactive: boolean;
  isPointerDown: boolean;
  lastMoveX: number;
  lastMoveY: number;
  lastSpawnX: number;
  lastSpawnY: number;
  opacity: number;
  ringScale: number;
  targetDotScale: number;
  targetOpacity: number;
  targetRingScale: number;
  targetX: number;
  targetY: number;
  tone: CursorTone;
  x: number;
  y: number;
};

const CANVAS_Z_INDEX = 100;
const RING_Z_INDEX = 101;
const DOT_Z_INDEX = 102;
const CURSOR_STYLE_ID = 'portfolio-custom-cursor-style';
const DUAL_BLACK = 'rgba(17, 17, 17, 0.96)';
const DUAL_CREAM = 'rgba(255, 248, 231, 0.96)';
const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'iframe',
  'input',
  'label',
  'select',
  'summary',
  'textarea',
  'video',
  '[role="button"]',
  '[data-cursor]',
  '[tabindex]:not([tabindex="-1"])',
  '.cursor-hover',
].join(', ');
const MAX_DPR = 2;
const MAX_TRAIL_PARTICLES = 12;
const OPAQUE_BACKGROUND_ALPHA = 0.9;
const POINTER_STYLE = `
html[data-custom-cursor='active'],
html[data-custom-cursor='active'] body,
html[data-custom-cursor='active'] body * {
  cursor: none !important;
}
`;

function getMediaQueryMatch(query: string): boolean {
  return typeof window !== 'undefined' && window.matchMedia(query).matches;
}

function getResolvedReducedMotion(propValue?: boolean): boolean {
  return propValue ?? getMediaQueryMatch('(prefers-reduced-motion: reduce)');
}

function getCursorCapability(propValue?: boolean): boolean {
  return shouldEnableCustomCursor({
    canHover: getMediaQueryMatch('(hover: hover)'),
    finePointer: getMediaQueryMatch('(pointer: fine)'),
    reducedMotion: getResolvedReducedMotion(propValue),
  });
}

function parseComputedColor(value: string): { alpha: number; blue: number; green: number; red: number } | null {
  const match = value.match(
    /rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,/]+([0-9]*\.?[0-9]+))?\s*\)/i
  );

  if (!match) return null;

  return {
    red: Number(match[1]),
    green: Number(match[2]),
    blue: Number(match[3]),
    alpha: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function getRelativeLuminance(red: number, green: number, blue: number): number {
  const normalize = (channel: number) => {
    const scaled = channel / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * normalize(red) + 0.7152 * normalize(green) + 0.0722 * normalize(blue);
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((segment) => `${segment}${segment}`)
          .join('')
      : normalized;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function findNearestInteractiveElement(target: EventTarget | null): HTMLElement | null {
  return target instanceof HTMLElement ? target.closest<HTMLElement>(INTERACTIVE_SELECTOR) : null;
}

function findNearestTone(target: HTMLElement | null): CursorTone | null {
  const toneValue = target?.closest<HTMLElement>('[data-cursor-tone]')?.dataset.cursorTone;
  return toneValue === 'light' || toneValue === 'dark' || toneValue === 'accent' ? toneValue : null;
}

function findNearestOpaqueBackground(target: HTMLElement | null): { blue: number; green: number; red: number } | null {
  let current: HTMLElement | null = target;

  while (current) {
    const parsed = parseComputedColor(window.getComputedStyle(current).backgroundColor);

    if (parsed && parsed.alpha >= OPAQUE_BACKGROUND_ALPHA) {
      return {
        red: parsed.red,
        green: parsed.green,
        blue: parsed.blue,
      };
    }

    current = current.parentElement;
  }

  return null;
}

function getFallbackTone(target: HTMLElement | null, interactive: boolean): CursorTone {
  const background = findNearestOpaqueBackground(target);

  if (!background) {
    return interactive ? 'light' : 'accent';
  }

  const luminance = getRelativeLuminance(background.red, background.green, background.blue);
  return luminance > 0.42 ? 'dark' : 'light';
}

function ensureCursorStyle(): HTMLStyleElement {
  const existing = document.getElementById(CURSOR_STYLE_ID);
  if (existing instanceof HTMLStyleElement) return existing;

  const style = document.createElement('style');
  style.id = CURSOR_STYLE_ID;
  style.textContent = POINTER_STYLE;
  document.head.appendChild(style);
  return style;
}

function getEventTone(target: EventTarget | null): { interactive: boolean; tone: CursorTone } {
  const interactiveTarget = findNearestInteractiveElement(target);
  const interactive = Boolean(interactiveTarget);
  const delegatedTone = findNearestTone(interactiveTarget ?? (target instanceof HTMLElement ? target : null));

  return {
    interactive,
    tone: delegatedTone ?? getFallbackTone(interactiveTarget ?? (target instanceof HTMLElement ? target : null), interactive),
  };
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<PointerState>({
    initialized: false,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    lastMoveX: 0,
    lastMoveY: 0,
    lastSpawnX: 0,
    lastSpawnY: 0,
    opacity: 0,
    targetOpacity: 0,
    dotScale: 1,
    targetDotScale: 1,
    ringScale: 1,
    targetRingScale: 1,
    tone: 'accent',
    interactive: false,
    isPointerDown: false,
  });
  const [isEnabled, setIsEnabled] = useState(() => getCursorCapability(reducedMotion));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const hoverQuery = window.matchMedia('(hover: hover)');
    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateCapability = () => {
      setIsEnabled(
        shouldEnableCustomCursor({
          canHover: hoverQuery.matches,
          finePointer: finePointerQuery.matches,
          reducedMotion: reducedMotion ?? motionQuery.matches,
        })
      );
    };

    updateCapability();
    hoverQuery.addEventListener('change', updateCapability);
    finePointerQuery.addEventListener('change', updateCapability);
    motionQuery.addEventListener('change', updateCapability);

    return () => {
      hoverQuery.removeEventListener('change', updateCapability);
      finePointerQuery.removeEventListener('change', updateCapability);
      motionQuery.removeEventListener('change', updateCapability);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const root = document.documentElement;
    if (!isEnabled) {
      delete root.dataset.customCursor;
      document.getElementById(CURSOR_STYLE_ID)?.remove();
      return undefined;
    }

    const style = ensureCursorStyle();
    root.dataset.customCursor = 'active';

    return () => {
      delete root.dataset.customCursor;
      style.remove();
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      trailRef.current = [];
      return undefined;
    }

    const canvas = canvasRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!canvas || !dot || !ring) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const pointer = pointerRef.current;
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const applyTone = (tone: CursorTone, interactive: boolean) => {
      const palette = getCursorPalette(tone);
      const ringGlow = interactive ? 26 : 16;

      dot.style.backgroundColor = palette.foreground;
      dot.style.boxShadow = `0 0 0 1px ${palette.outline}, 0 0 0 2px ${DUAL_BLACK}, 0 0 0 3px ${DUAL_CREAM}, 0 0 ${ringGlow}px ${palette.trail}`;

      ring.style.borderColor = palette.foreground;
      ring.style.backgroundColor = interactive ? hexToRgba(palette.foreground, 0.08) : 'transparent';
      ring.style.boxShadow = `0 0 0 1px ${palette.outline}, 0 0 0 2px ${DUAL_BLACK}, 0 0 0 3px ${DUAL_CREAM}, inset 0 0 0 1px ${hexToRgba(
        palette.foreground,
        interactive ? 0.35 : 0.18
      )}, 0 0 ${ringGlow}px ${palette.trail}`;
    };

    const syncScales = () => {
      pointer.targetDotScale = pointer.isPointerDown ? 0.82 : 1;

      const hoverScale = pointer.interactive ? 1.35 : 1;
      pointer.targetRingScale = pointer.isPointerDown ? hoverScale * 0.88 : hoverScale;
    };

    const spawnParticle = (tone: CursorTone, interactive: boolean, deltaX: number, deltaY: number) => {
      const palette = getCursorPalette(tone);
      const spread = interactive ? 0.16 : 0.28;

      trailRef.current.push({
        x: pointer.targetX,
        y: pointer.targetY,
        vx: deltaX * spread,
        vy: deltaY * spread,
        size: interactive ? 3.2 : 4.4,
        life: 1,
        maxLife: interactive ? 16 : 22,
        color: palette.trail,
      });

      if (trailRef.current.length > MAX_TRAIL_PARTICLES) {
        trailRef.current.splice(0, trailRef.current.length - MAX_TRAIL_PARTICLES);
      }
    };

    const updateToneFromTarget = (target: EventTarget | null) => {
      const next = getEventTone(target);
      pointer.interactive = next.interactive;
      pointer.tone = next.tone;
      syncScales();
      applyTone(pointer.tone, pointer.interactive);
    };

    const fadeOut = () => {
      pointer.targetOpacity = 0;
      pointer.interactive = false;
      pointer.isPointerDown = false;
      syncScales();
      applyTone(pointer.tone, false);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;

      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.targetOpacity = 1;
      updateToneFromTarget(event.target);

      if (!pointer.initialized) {
        pointer.initialized = true;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.lastMoveX = event.clientX;
        pointer.lastMoveY = event.clientY;
        pointer.lastSpawnX = event.clientX;
        pointer.lastSpawnY = event.clientY;
        return;
      }

      const deltaX = event.clientX - pointer.lastMoveX;
      const deltaY = event.clientY - pointer.lastMoveY;
      const distance = Math.hypot(event.clientX - pointer.lastSpawnX, event.clientY - pointer.lastSpawnY);
      if (distance >= (pointer.interactive ? 4 : 6)) {
        spawnParticle(pointer.tone, pointer.interactive, deltaX, deltaY);
        pointer.lastSpawnX = event.clientX;
        pointer.lastSpawnY = event.clientY;
      }

      pointer.lastMoveX = event.clientX;
      pointer.lastMoveY = event.clientY;
    };

    const onPointerOver = (event: PointerEvent) => {
      updateToneFromTarget(event.target);
    };

    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget) {
        updateToneFromTarget(event.relatedTarget);
        return;
      }

      fadeOut();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      pointer.isPointerDown = true;
      pointer.targetOpacity = 1;
      syncScales();
    };

    const onPointerUp = () => {
      pointer.isPointerDown = false;
      syncScales();
    };

    const onWindowBlur = () => {
      fadeOut();
    };

    resizeCanvas();
    applyTone(pointer.tone, pointer.interactive);

    const renderFrame = () => {
      pointer.x += (pointer.targetX - pointer.x) * 0.32;
      pointer.y += (pointer.targetY - pointer.y) * 0.32;
      pointer.opacity += (pointer.targetOpacity - pointer.opacity) * 0.16;
      pointer.dotScale += (pointer.targetDotScale - pointer.dotScale) * 0.18;
      pointer.ringScale += (pointer.targetRingScale - pointer.ringScale) * 0.18;

      dot.style.opacity = `${pointer.opacity}`;
      ring.style.opacity = `${pointer.opacity}`;
      dot.style.transform = `translate3d(${pointer.targetX}px, ${pointer.targetY}px, 0) translate(-50%, -50%) scale(${pointer.dotScale})`;
      ring.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%) scale(${pointer.ringScale})`;

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      trailRef.current = trailRef.current.filter((particle) => particle.life > 0.02);
      for (const particle of trailRef.current) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.9;
        particle.vy *= 0.9;
        particle.life -= 1 / particle.maxLife;

        context.globalAlpha = particle.life * pointer.opacity;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
      frameRef.current = window.requestAnimationFrame(renderFrame);
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerover', onPointerOver);
    window.addEventListener('pointerout', onPointerOut);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('visibilitychange', onWindowBlur);

    frameRef.current = window.requestAnimationFrame(renderFrame);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      trailRef.current = [];
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onWindowBlur);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 block"
        style={{ zIndex: CANVAS_Z_INDEX }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 block h-8 w-8 rounded-full border"
        style={{ zIndex: RING_Z_INDEX }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 block h-3 w-3 rounded-full"
        style={{ zIndex: DOT_Z_INDEX }}
      />
    </>
  );
};
