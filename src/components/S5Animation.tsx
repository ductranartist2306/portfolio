import React from 'react';
import { VideoCard } from './VideoCard';

interface S5AnimationProps {
  data: any;
  isActive?: boolean;
  reducedMotion?: boolean;
}

export const S5Animation: React.FC<S5AnimationProps> = ({
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
        <p className="font-body text-xs sm:text-sm text-[#B8C2CC] max-w-xl font-light">
          {data.description}
        </p>
      </div>

      {/* Mosaic Bento Grid */}
      <div className="grid grid-cols-12 gap-6 my-auto">
        {data.bentoGrid.map((item: any) => (
          <div key={item.id} className="col-span-12 lg:col-span-6">
            <VideoCard
              title={item.title}
              subtitle={item.subtitle}
              videoPath={item.path}
              fallbackUrl={item.fallbackVideoUrl}
              sourceAspectRatio={item.aspectRatio as any}
              playMode="hover"
              isActive={isActive}
              reducedMotion={reducedMotion}
            />
          </div>
        ))}
      </div>

      {/* Animation Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 font-mono-tech text-xs">
        <div className="p-3 rounded-lg bg-[#141B24] border border-[#00D9FF]/20 text-center">
          <span className="text-[#00D9FF] block">2D ANIMATION</span>
          <span className="text-[#B8C2CC] text-[10px]">Mỹ phẩm & Dược phẩm</span>
        </div>
        <div className="p-3 rounded-lg bg-[#141B24] border border-[#00D9FF]/20 text-center">
          <span className="text-[#00D9FF] block">APP MOCKUP</span>
          <span className="text-[#B8C2CC] text-[10px]">TMT-eGreen / Oppo A93</span>
        </div>
        <div className="p-3 rounded-lg bg-[#141B24] border border-[#FF9F1C]/20 text-center">
          <span className="text-[#FF9F1C] block">4K MOTION</span>
          <span className="text-[#B8C2CC] text-[10px]">Transition & Effects</span>
        </div>
        <div className="p-3 rounded-lg bg-[#141B24] border border-[#00D9FF]/20 text-center">
          <span className="text-[#00D9FF] block">AFTER EFFECTS</span>
          <span className="text-[#B8C2CC] text-[10px]">Keyframing & Compositing</span>
        </div>
      </div>
    </div>
  );
};
