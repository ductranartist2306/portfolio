import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoCardProps {
  title: string;
  subtitle?: string;
  videoPath?: string;
  fallbackUrl?: string;
  youtubeUrl?: string;
  aspectRatio?: '16:9' | '9:16' | '4:5' | '1:1';
  playMode?: 'autoplay' | 'hover' | 'click';
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  title,
  subtitle,
  videoPath,
  fallbackUrl,
  youtubeUrl,
  aspectRatio = '16:9',
  playMode = 'hover',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(playMode === 'autoplay');
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if youtubeUrl is present or videoPath is a YouTube URL
  const rawYtUrl =
    youtubeUrl ||
    (videoPath && (videoPath.includes('youtube.com') || videoPath.includes('youtu.be'))
      ? videoPath
      : undefined);

  let cleanYtUrl = rawYtUrl;
  if (cleanYtUrl) {
    if (cleanYtUrl.includes('.autoplay=')) {
      cleanYtUrl = cleanYtUrl.replace('.autoplay=', '?autoplay=');
    }
    if (cleanYtUrl.includes('playlist=ID_VIDEO_CỦA_BẠN')) {
      const match = cleanYtUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
      const vidId = match ? match[1] : 'eC9a1EjCDFM';
      cleanYtUrl = cleanYtUrl.replace('playlist=ID_VIDEO_CỦA_BẠN', `playlist=${vidId}`);
    }
  }

  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : aspectRatio === '4:5'
      ? 'aspect-[4/5]'
      : aspectRatio === '1:1'
      ? 'aspect-square'
      : 'aspect-[16/9]';

  if (cleanYtUrl) {
    return (
      <div
        className={`relative group rounded-2xl overflow-hidden bg-[#141B24] neon-border neon-border-hover transition-all duration-500 ${aspectClass} ${className}`}
      >
        <iframe
          width="100%"
          height="100%"
          src={cleanYtUrl}
          title={title || 'YouTube video player'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '12px',
          }}
        />
      </div>
    );
  }

  const videoSource = !hasError && videoPath ? videoPath : fallbackUrl || videoPath;

  const handleMouseEnter = () => {
    if (playMode === 'hover' && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (playMode === 'hover' && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={playMode === 'click' ? togglePlay : undefined}
      className={`relative group rounded-2xl overflow-hidden bg-[#141B24] neon-border neon-border-hover transition-all duration-500 cursor-pointer ${aspectClass} ${className}`}
    >
      <video
        ref={videoRef}
        src={videoSource}
        autoPlay={playMode === 'autoplay'}
        loop
        muted={isMuted}
        playsInline
        onError={() => {
          if (!hasError && fallbackUrl) {
            setHasError(true);
          }
        }}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14] via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

      {/* Top Controls Badge */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <span className="font-mono-tech text-[10px] text-[#00D9FF] bg-black/60 px-2.5 py-1 rounded-full border border-[#00D9FF]/30 backdrop-blur-md uppercase tracking-wider">
          {aspectRatio} • {playMode.toUpperCase()}
        </span>

        <button
          onClick={toggleMute}
          className="pointer-events-auto p-2 rounded-full bg-black/60 text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black transition-colors backdrop-blur-md"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Play/Pause Center Trigger Icon */}
      {playMode !== 'autoplay' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className={`w-12 h-12 rounded-full bg-[#00D9FF] text-black flex items-center justify-center shadow-lg transform transition-all duration-300 ${
              isPlaying ? 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100' : 'scale-100 opacity-90'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </div>
        </div>
      )}

      {/* Bottom Title Label */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <h4 className="font-title text-base sm:text-lg text-white font-semibold tracking-wide group-hover:text-[#00D9FF] transition-colors">
          {title}
        </h4>
        {subtitle && (
          <p className="font-body text-xs text-[#B8C2CC] mt-1 line-clamp-1 font-light">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
