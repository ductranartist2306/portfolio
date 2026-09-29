import React from 'react';
import { VideoCard } from './VideoCard';
import { Sparkles } from 'lucide-react';

interface S6TikTokProps {
  data: any;
  isActive?: boolean;
  reducedMotion?: boolean;
}

export const S6TikTok: React.FC<S6TikTokProps> = ({
  data,
  isActive = true,
  reducedMotion = false,
}) => {
  return (
    <div
      className="portal-section relative h-full min-h-screen w-full overflow-y-auto px-6 pb-16 pt-32 text-white lg:px-16"
      data-slide-scroll
    >
      {/* Header Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <span className="font-mono-tech text-sm font-bold text-[#00D9FF] tracking-widest uppercase block mb-3">
            {data.subtitle}
          </span>
          <h2 className="font-title text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white">
            {data.title}
          </h2>
        </div>
        <p className="font-body text-xs sm:text-sm text-[#B8C2CC] max-w-xl font-light">
          {data.description}
        </p>
      </div>

      {/* Four 9:16 YouTube showcases in a single row */}
      <div
        data-showcase-focus
        className="mx-auto grid max-w-6xl grid-cols-2 gap-6 lg:grid-cols-4"
      >
        {data.grid.map((item: any) => (
          <div
            key={item.id}
            className="mx-auto flex h-full w-full max-w-sm flex-col rounded-[28px] border border-[#00D9FF]/20 bg-[#141B24]/70 p-4 transition-colors hover:border-[#00D9FF] sm:p-5"
          >
            <VideoCard
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              videoPath={item.path}
              fallbackUrl={item.fallbackVideoUrl}
              youtubeUrl={item.youtubeUrl}
              posterUrl={item.posterUrl}
              sourceAspectRatio={item.aspectRatio as any}
              playMode="click"
              isActive={isActive}
              reducedMotion={reducedMotion}
              className="flex h-full flex-col"
            />
          </div>
        ))}
      </div>

      {/* Dock-style status bar */}
      <div className="mx-auto mt-8 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full px-6 py-3 liquid-glass">
        <div className="flex items-center gap-2 text-[#FF9F1C]">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-mono-tech text-[11px] font-bold uppercase tracking-wider">
            Phong Cách Animation
          </span>
        </div>
        <span className="hidden h-4 w-px bg-white/15 sm:block" />
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono-tech text-[11px] text-[#00D9FF]">
          <span>Motion Graphics 2D/3D</span>
          <span>Sound Design Đồng Bộ</span>
          <span>Định Dạng Dọc 9:16</span>
        </div>
      </div>
    </div>
  );
};
