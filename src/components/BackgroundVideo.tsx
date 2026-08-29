import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface BackgroundVideoProps {
  opacity?: number;
  className?: string;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  opacity = 0.5,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamUrl = 'https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{ opacity }}
        className="w-full h-full object-cover transition-opacity duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90 pointer-events-none" />
    </div>
  );
};
