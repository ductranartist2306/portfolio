export type MediaAspectRatio = '16:9' | '9:16' | '4:5' | '1:1';
export type CursorTone = 'light' | 'dark' | 'accent';

interface YouTubeEmbedOptions {
  isActive: boolean;
  autoplay: boolean;
  reducedMotion: boolean;
}

interface CursorCapabilityOptions {
  canHover: boolean;
  finePointer: boolean;
  reducedMotion: boolean;
}

interface SlideNavigationOptions {
  drawerOpen: boolean;
  interactiveTarget: boolean;
}

interface ScrollBoundaryOptions {
  direction: 'up' | 'down';
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

interface MediaRenderOptions {
  activeSource: string | undefined;
  hasError: boolean;
  hasYoutube: boolean;
  youtubeSrc: string | null;
}

interface FocusTrapOptions {
  activeIndex: number;
  count: number;
  shiftKey: boolean;
}

export type MediaRenderState = 'unavailable' | 'deferred-youtube' | 'youtube' | 'native';

export interface PortalAssetSources {
  desktopAvif: string;
  desktopWebp: string;
  mobileAvif: string;
  mobileWebp: string;
}

const CURSOR_PALETTES = {
  light: {
    foreground: '#FFF8E7',
    outline: '#111111',
    trail: 'rgba(255, 214, 140, 0.72)',
  },
  dark: {
    foreground: '#111111',
    outline: '#FFF8E7',
    trail: 'rgba(64, 32, 12, 0.58)',
  },
  accent: {
    foreground: '#F4B860',
    outline: '#111111',
    trail: 'rgba(244, 184, 96, 0.68)',
  },
} satisfies Record<CursorTone, { foreground: string; outline: string; trail: string }>;

export function getHeaderTranslateY(scrollTop: number, headerHeight: number): number {
  const safeScrollTop = Math.max(0, scrollTop);
  const safeHeaderHeight = Math.max(0, headerHeight);
  const offset = Math.min(safeScrollTop, safeHeaderHeight);
  return offset === 0 ? 0 : -offset;
}

export function getMediaObjectFit(aspectRatio: MediaAspectRatio = '16:9'): 'cover' | 'contain' {
  return aspectRatio === '16:9' ? 'cover' : 'contain';
}

export function getActiveMediaSource(
  source: string | undefined,
  isActive: boolean
): string | undefined {
  return isActive ? source : undefined;
}

export function getMediaRenderState(options: MediaRenderOptions): MediaRenderState {
  if (options.hasError || (!options.hasYoutube && !options.activeSource)) return 'unavailable';
  if (options.hasYoutube && !options.youtubeSrc) return 'deferred-youtube';
  return options.hasYoutube ? 'youtube' : 'native';
}

export function getNextMediaSourceIndex(
  currentIndex: number,
  sourceCount: number
): number | null {
  const nextIndex = currentIndex + 1;
  return sourceCount > 0 && nextIndex < sourceCount ? nextIndex : null;
}

export function getFocusTrapTargetIndex(options: FocusTrapOptions): number | null {
  if (options.count <= 0) return null;
  if (options.shiftKey && options.activeIndex <= 0) return options.count - 1;
  if (!options.shiftKey && options.activeIndex >= options.count - 1) return 0;
  return null;
}

export function getPortalAssetSources(baseUrl: string): PortalAssetSources {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const assetUrl = (fileName: string) => `${normalizedBase}assets/${fileName}`;

  return {
    desktopAvif: assetUrl('golden-portal-desktop.avif'),
    desktopWebp: assetUrl('golden-portal-desktop.webp'),
    mobileAvif: assetUrl('golden-portal-mobile.avif'),
    mobileWebp: assetUrl('golden-portal-mobile.webp'),
  };
}

export function shouldEnableCustomCursor(options: CursorCapabilityOptions): boolean {
  return options.canHover && options.finePointer && !options.reducedMotion;
}

export function getCursorPalette(tone: CursorTone) {
  return CURSOR_PALETTES[tone];
}

export function canNavigateSlides(options: SlideNavigationOptions): boolean {
  return !options.drawerOpen && !options.interactiveTarget;
}

export function shouldNavigateFromScroll(options: ScrollBoundaryOptions): boolean {
  if (options.direction === 'up') return options.scrollTop <= 0;
  return options.scrollTop + options.clientHeight >= options.scrollHeight - 1;
}

function normalizeYouTubeUrl(value: string): URL | null {
  const repaired = value.replace('.autoplay=', '?autoplay=');

  try {
    const parsed = new URL(repaired);

    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0];
      return videoId ? new URL(`https://www.youtube.com/embed/${videoId}`) : null;
    }

    if (parsed.pathname === '/watch') {
      const videoId = parsed.searchParams.get('v');
      return videoId ? new URL(`https://www.youtube.com/embed/${videoId}`) : null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function buildYouTubeEmbedUrl(
  value: string,
  options: YouTubeEmbedOptions
): string | null {
  if (!options.isActive) return null;

  const parsed = normalizeYouTubeUrl(value);
  if (!parsed) return null;

  const autoplay = options.autoplay && !options.reducedMotion;
  parsed.searchParams.set('enablejsapi', '1');
  parsed.searchParams.set('controls', '1');
  parsed.searchParams.set('playsinline', '1');
  parsed.searchParams.set('rel', '0');
  parsed.searchParams.set('autoplay', autoplay ? '1' : '0');

  if (autoplay) {
    parsed.searchParams.set('mute', '1');
  } else {
    parsed.searchParams.delete('mute');
  }

  return parsed.toString();
}
