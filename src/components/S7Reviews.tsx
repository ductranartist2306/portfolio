import React from 'react';
import { VideoCard } from './VideoCard';
import { Flame } from 'lucide-react';

interface S7ReviewsProps {
  data: any;
  isActive?: boolean;
  reducedMotion?: boolean;
}

export const S7Reviews: React.FC<S7ReviewsProps> = ({
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

      {/* Four portrait YouTube showcases in a horizontal row */}
      <div
        data-showcase-focus
        className="mx-auto grid max-w-4xl grid-cols-2 gap-6 lg:grid-cols-3"
      >
        {data.reviews.map((rev: any) => (
          <div
            key={rev.id}
            className="mx-auto flex h-full w-full max-w-sm flex-col rounded-[28px] border border-[#00D9FF]/20 bg-[#141B24]/70 p-4 transition-colors hover:border-[#00D9FF] sm:p-5"
          >
            <VideoCard
              title={rev.title}
              subtitle={rev.category}
              description={rev.description}
              videoPath={rev.videoUrl}
              fallbackUrl={rev.videoUrl}
              youtubeUrl={rev.youtubeUrl}
              posterUrl={rev.posterUrl}
              sourceAspectRatio={rev.aspectRatio as any}
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
          <Flame className="h-3.5 w-3.5" />
          <span className="font-mono-tech text-[11px] font-bold uppercase tracking-wider">
            Xu Hướng Short-Form
          </span>
        </div>
        <span className="hidden h-4 w-px bg-white/15 sm:block" />
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono-tech text-[11px] text-[#00D9FF]">
          <span>KOL/KOC · 100% Retain</span>
          <span>Dynamic Captions</span>
          <span>Trend Sound Effects</span>
        </div>
      </div>
    </div>
  );
};
