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
  initialized: boolean;
  interactive: boolean;
  lastMoveX: number;
  lastMoveY: number;
  lastSpawnX: number;
  lastSpawnY: number;
  opacity: number;
  targetOpacity: number;
  targetX: number;
  targetY: number;
  tone: CursorTone;
};

const CANVAS_Z_INDEX = 100;
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

function parseComputedColor(
  value: string
): { alpha: number; blue: number; green: number; red: number } | null {
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

function findNearestInteractiveElement(target: EventTarget | null): HTMLElement | null {
  return target instanceof HTMLElement ? target.closest<HTMLElement>(INTERACTIVE_SELECTOR) : null;
}

function findNearestTone(target: HTMLElement | null): CursorTone | null {
  const toneValue = target?.closest<HTMLElement>('[data-cursor-tone]')?.dataset.cursorTone;
  return toneValue === 'light' || toneValue === 'dark' || toneValue === 'accent'
    ? toneValue
    : null;
}

function findNearestOpaqueBackground(
  target: HTMLElement | null
): { blue: number; green: number; red: number } | null {
  let current: HTMLElement | null = target;

  while (current) {
    const parsed = parseComputedColor(window.getComputedStyle(current).backgroundColor);

    if (parsed && parsed.alpha >= OPAQUE_BACKGROUND_ALPHA) {
      return { red: parsed.red, green: parsed.green, blue: parsed.blue };
    }

    current = current.parentElement;
  }

  return null;
}

function getFallbackTone(target: HTMLElement | null, interactive: boolean): CursorTone {
  const background = findNearestOpaqueBackground(target);
  if (!background) return interactive ? 'light' : 'accent';

  const luminance = getRelativeLuminance(background.red, background.green, background.blue);
  return luminance > 0.42 ? 'dark' : 'light';
}

function getEventTone(target: EventTarget | null): { interactive: boolean; tone: CursorTone } {
  const interactiveTarget = findNearestInteractiveElement(target);
  const fallbackTarget = interactiveTarget ?? (target instanceof HTMLElement ? target : null);
  const interactive = Boolean(interactiveTarget);

  return {
    interactive,
    tone: findNearestTone(fallbackTarget) ?? getFallbackTone(fallbackTarget, interactive),
  };
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<PointerState>({
    initialized: false,
    interactive: false,
    lastMoveX: 0,
    lastMoveY: 0,
    lastSpawnX: 0,
    lastSpawnY: 0,
    opacity: 0,
    targetOpacity: 0,
    targetX: 0,
    targetY: 0,
    tone: 'accent',
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
    if (!isEnabled) {
      trailRef.current = [];
      return undefined;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

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

    const spawnParticle = (
      tone: CursorTone,
      interactive: boolean,
      deltaX: number,
      deltaY: number
    ) => {
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
    };

    const fadeOut = () => {
      pointer.targetOpacity = 0;
      pointer.interactive = false;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;

      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.targetOpacity = 1;
      updateToneFromTarget(event.target);

      if (!pointer.initialized) {
        pointer.initialized = true;
        pointer.lastMoveX = event.clientX;
        pointer.lastMoveY = event.clientY;
        pointer.lastSpawnX = event.clientX;
        pointer.lastSpawnY = event.clientY;
        return;
      }

      const deltaX = event.clientX - pointer.lastMoveX;
      const deltaY = event.clientY - pointer.lastMoveY;
      const distance = Math.hypot(
        event.clientX - pointer.lastSpawnX,
        event.clientY - pointer.lastSpawnY
      );
      if (distance >= (pointer.interactive ? 4 : 6)) {
        spawnParticle(pointer.tone, pointer.interactive, deltaX, deltaY);
        pointer.lastSpawnX = event.clientX;
        pointer.lastSpawnY = event.clientY;
      }

      pointer.lastMoveX = event.clientX;
      pointer.lastMoveY = event.clientY;
    };

    const onPointerOver = (event: PointerEvent) => updateToneFromTarget(event.target);
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget) {
        updateToneFromTarget(event.relatedTarget);
      } else {
        fadeOut();
      }
    };

    resizeCanvas();

    const renderFrame = () => {
      pointer.opacity += (pointer.targetOpacity - pointer.opacity) * 0.16;
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
    window.addEventListener('blur', fadeOut);
    document.addEventListener('visibilitychange', fadeOut);
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
      window.removeEventListener('blur', fadeOut);
      document.removeEventListener('visibilitychange', fadeOut);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 block"
      style={{ zIndex: CANVAS_Z_INDEX }}
    />
  );
};
