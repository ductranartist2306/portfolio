import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Film } from 'lucide-react';
import {
  buildYouTubeEmbedUrl,
  getActiveMediaSource,
  getMediaObjectFit,
  getMediaRenderState,
  getNextMediaSourceIndex,
  type MediaAspectRatio,
} from '../lib/portfolioUi';

interface VideoCardProps {
  title: string;
  subtitle?: string;
  videoPath?: string;
  fallbackUrl?: string;
  youtubeUrl?: string;
  sourceAspectRatio?: MediaAspectRatio;
  playMode?: 'autoplay' | 'hover' | 'click';
  isActive?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

const DEFAULT_MEDIA_ASPECT_RATIO: MediaAspectRatio = '16:9';

export const VideoCard: React.FC<VideoCardProps> = ({
  title,
  subtitle,
  videoPath,
  fallbackUrl,
  youtubeUrl,
  sourceAspectRatio = DEFAULT_MEDIA_ASPECT_RATIO,
  playMode = 'hover',
  isActive = true,
  reducedMotion = false,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(playMode === 'autoplay' && !reducedMotion);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [shouldRenderYouTube, setShouldRenderYouTube] = useState(playMode === 'autoplay');
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectFitClass =
    getMediaObjectFit(sourceAspectRatio) === 'contain' ? 'object-contain' : 'object-cover';
  const nativeSources = useMemo(
    () => Array.from(new Set([videoPath, fallbackUrl].filter(Boolean))) as string[],
    [fallbackUrl, videoPath]
  );
  const activeSource = nativeSources[sourceIndex];

  const rawYtUrl =
    youtubeUrl ||
    (activeSource && (activeSource.includes('youtube.com') || activeSource.includes('youtu.be'))
      ? activeSource
      : undefined);
  const shouldMountYouTube = Boolean(rawYtUrl) && isActive && (playMode === 'autoplay' || shouldRenderYouTube);
  const youtubeSrc = rawYtUrl
    ? buildYouTubeEmbedUrl(rawYtUrl, {
        isActive: shouldMountYouTube,
        autoplay: playMode === 'autoplay' || isPlaying,
        reducedMotion,
      })
    : null;

  useEffect(() => {
    setSourceIndex(0);
    setHasError(false);
    setIsReady(false);
    setIsMuted(true);
    setIsPlaying(playMode === 'autoplay' && !reducedMotion);
    setShouldRenderYouTube(playMode === 'autoplay');
  }, [fallbackUrl, playMode, reducedMotion, videoPath, youtubeUrl]);

  useEffect(() => {
    const video = videoRef.current;

    if (rawYtUrl) {
      if (!isActive) {
        setShouldRenderYouTube(false);
        setIsPlaying(false);
        setIsReady(false);
      } else if (playMode === 'autoplay') {
        setShouldRenderYouTube(true);
        setIsPlaying(!reducedMotion);
      }
      return;
    }

    if (!video) return;

    if (!isActive) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    if (playMode === 'autoplay' && !reducedMotion) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      return;
    }

    if (playMode === 'autoplay') {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
    }
  }, [activeSource, isActive, playMode, rawYtUrl, reducedMotion]);

  const startNativePlayback = () => {
    if (!videoRef.current || !isActive) return;

    videoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const stopNativePlayback = (reset = false) => {
    if (!videoRef.current) return;

    videoRef.current.pause();
    if (reset) {
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleMouseEnter = () => {
    if (playMode === 'hover' && !rawYtUrl && isActive && !reducedMotion) {
      startNativePlayback();
    }
  };

  const handleMouseLeave = () => {
    if (playMode === 'hover' && !rawYtUrl) {
      stopNativePlayback(true);
    }
  };

  const togglePlay = () => {
    if (!isActive) return;

    if (rawYtUrl) {
      if (isPlaying) {
        setShouldRenderYouTube(false);
        setIsPlaying(false);
        setIsReady(false);
      } else {
        setShouldRenderYouTube(true);
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      stopNativePlayback(playMode === 'hover');
    } else {
      startNativePlayback();
    }
  };

  const toggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (playMode === 'autoplay') return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePlay();
    }
  };

  const handleVideoError = () => {
    setIsReady(false);
    const nextSourceIndex = getNextMediaSourceIndex(sourceIndex, nativeSources.length);
    if (nextSourceIndex !== null) {
      setSourceIndex(nextSourceIndex);
      return;
    }
    setHasError(true);
  };

  const mediaRenderState = getMediaRenderState({
    activeSource,
    hasError,
    hasYoutube: Boolean(rawYtUrl),
    youtubeSrc,
  });
  const showUnavailableState = mediaRenderState === 'unavailable';
  const showDeferredYouTubeState = mediaRenderState === 'deferred-youtube';

  if (showUnavailableState || showDeferredYouTubeState) {
    const statusLabel = hasError
      ? 'Video tạm thời không khả dụng'
      : showDeferredYouTubeState
      ? isActive
        ? 'Sẵn sàng phát khi bạn bấm xem'
        : 'Video sẽ tải khi section được chọn'
      : 'Video sắp cập nhật';

    return (
      <div
        data-cursor-tone="light"
        className={`relative w-full overflow-hidden rounded-2xl bg-[#141B24] neon-border transition-all duration-500 ${className}`}
      >
        <div
          className="relative aspect-video w-full bg-[radial-gradient(circle_at_top,_rgba(244,184,96,0.2),_transparent_55%),linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(10,14,20,0.96))]"
          data-source-aspect={sourceAspectRatio}
          data-video-stage
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30">
              <Film className="h-5 w-5 text-white/60" />
            </div>
            <div className="space-y-1">
              <h4 className="font-title text-sm font-semibold tracking-wide text-white">{title}</h4>
              {subtitle && (
                <p className="font-body text-xs text-[#B8C2CC] line-clamp-2">{subtitle}</p>
              )}
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
                {statusLabel}
              </p>
            </div>
            {showDeferredYouTubeState && isActive && playMode !== 'autoplay' && (
              <button
                type="button"
                onClick={togglePlay}
                data-cursor-tone="dark"
                className="inline-flex items-center gap-2 rounded-full border border-[#00D9FF]/40 bg-[#00D9FF]/10 px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.24em] text-[#9AE8FF] transition-colors hover:bg-[#00D9FF]/20"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Xem Video
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={playMode === 'click' && !rawYtUrl ? togglePlay : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={playMode === 'autoplay' ? -1 : 0}
      role={playMode === 'autoplay' ? undefined : 'button'}
      aria-label={playMode === 'autoplay' ? undefined : `${isPlaying ? 'Tạm dừng' : 'Phát'} ${title}`}
      data-cursor-tone="light"
      className={`relative w-full overflow-hidden rounded-2xl bg-[#141B24] neon-border neon-border-hover transition-all duration-500 ${playMode === 'autoplay' ? '' : 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/60'} ${className}`}
    >
      <div
        className="relative aspect-video w-full bg-[#0A0E14]"
        data-source-aspect={sourceAspectRatio}
        data-video-stage
      >
        {mediaRenderState === 'youtube' && youtubeSrc ? (
          <iframe
            src={youtubeSrc}
            title={title || 'YouTube video player'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsReady(true)}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <video
            ref={videoRef}
            key={activeSource}
            src={getActiveMediaSource(activeSource, isActive)}
            autoPlay={playMode === 'autoplay' && isActive && !reducedMotion}
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            onLoadedData={() => setIsReady(true)}
            onError={handleVideoError}
            className={`h-full w-full transition-transform duration-700 ${objectFitClass} ${playMode === 'hover' ? 'group-hover:scale-[1.02]' : ''}`}
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0E14]/88 via-[#0A0E14]/10 to-black/25" />

        <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-3">
          <div className="max-w-[75%] rounded-full border border-white/12 bg-black/45 px-3 py-1.5 backdrop-blur-md">
            <p className="font-title text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              {title}
            </p>
            {subtitle && (
              <p className="mt-1 line-clamp-1 font-body text-[11px] text-[#B8C2CC]">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {playMode !== 'autoplay' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
                data-cursor-tone="dark"
                className="rounded-full bg-black/60 p-2 text-[#00D9FF] transition-colors hover:bg-[#00D9FF] hover:text-black backdrop-blur-md"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
              </button>
            )}

            {!rawYtUrl && (
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                data-cursor-tone="dark"
                className="rounded-full bg-black/60 p-2 text-[#00D9FF] transition-colors hover:bg-[#00D9FF] hover:text-black backdrop-blur-md"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        {!isReady && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0A0E14]/45">
            <div className="h-10 w-10 rounded-full border border-[#00D9FF]/30 bg-[#0A0E14]/60 shadow-[0_0_25px_rgba(0,217,255,0.14)]" />
          </div>
        )}

        {playMode !== 'autoplay' && !isPlaying && (
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#00D9FF]/35 bg-[#00D9FF]/14 text-[#B8F2FF] shadow-[0_0_30px_rgba(0,217,255,0.16)]">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-10 rounded-full border border-white/12 bg-black/45 px-3 py-1 font-mono-tech text-[10px] uppercase tracking-[0.24em] text-[#00D9FF] backdrop-blur-md">
          16:9 Stage
        </div>
      </div>

      <div className="border-t border-white/8 bg-[#111824] px-5 py-4">
        <p className="font-title text-base font-semibold tracking-wide text-white">{title}</p>
        {subtitle && <p className="mt-1 font-body text-xs font-light text-[#B8C2CC]">{subtitle}</p>}
      </div>
    </div>
  );
};
