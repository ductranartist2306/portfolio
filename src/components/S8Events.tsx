import React from 'react';
import { VideoCard } from './VideoCard';
import { Film } from 'lucide-react';

interface S8EventsProps {
  data: any;
  isActive?: boolean;
  reducedMotion?: boolean;
}

export const S8Events: React.FC<S8EventsProps> = ({
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
            {data.index} // {data.subtitle}
          </span>
          <h2 className="font-title text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white">
            {data.title}
          </h2>
        </div>
      </div>

      {/* Mixed horizontal and portrait YouTube showcases */}
      <div
        data-showcase-focus
        className="mx-auto my-auto grid max-w-6xl grid-cols-12 items-start gap-8"
      >
        {data.sections.map((section: any, index: number) => (
          <div
            key={section.title}
            className={`col-span-12 rounded-[28px] border bg-[#141B24]/70 p-4 sm:p-5 ${
              index === 0
                ? 'border-[#00D9FF]/30 lg:col-span-7'
                : 'mx-auto w-full max-w-sm border-[#FF9F1C]/30 lg:col-span-5'
            }`}
          >
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <Film className={`h-5 w-5 ${index === 0 ? 'text-[#00D9FF]' : 'text-[#FF9F1C]'}`} />
              <span className="font-mono-tech text-xs uppercase tracking-[0.2em] text-white/70">
                {section.aspectRatio} YouTube
              </span>
            </div>
            <VideoCard
              title={section.title}
              description={section.description}
              videoPath={section.videoUrl}
              fallbackUrl={section.videoUrl}
              youtubeUrl={section.youtubeUrl}
              posterUrl={section.posterUrl}
              sourceAspectRatio={section.aspectRatio as any}
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
