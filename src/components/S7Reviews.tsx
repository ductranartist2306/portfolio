import React from 'react';
import { VideoCard } from './VideoCard';

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
          <span className="font-mono-tech text-xs text-[#00D9FF] tracking-widest uppercase block mb-1">
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
        className="mx-auto my-auto grid max-w-6xl grid-cols-2 items-start gap-6 lg:grid-cols-4"
      >
        {data.reviews.map((rev: any) => (
          <div
            key={rev.id}
            className="mx-auto w-full max-w-sm rounded-[28px] border border-[#00D9FF]/20 bg-[#141B24]/70 p-4 transition-colors hover:border-[#00D9FF] sm:p-5"
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};
