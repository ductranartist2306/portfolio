import React from 'react';
import { VideoCard } from './VideoCard';
import { Star, ShieldCheck, Tag } from 'lucide-react';

interface S7ReviewsProps {
  data: any;
}

export const S7Reviews: React.FC<S7ReviewsProps> = ({ data }) => {
  return (
    <div className="relative w-full h-full min-h-screen pt-28 pb-16 px-6 lg:px-16 bg-[#0A0E14] text-white overflow-y-auto">
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

      {/* Grid of Interactive Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-auto">
        {data.reviews.map((rev: any) => (
          <div
            key={rev.id}
            className="p-6 rounded-2xl bg-[#141B24] border border-[#00D9FF]/20 hover:border-[#00D9FF] transition-all grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
          >
            <div className="md:col-span-5">
              <VideoCard
                title={rev.title}
                subtitle={rev.category}
                videoPath={rev.videoUrl}
                fallbackUrl={rev.videoUrl}
                aspectRatio="9:16"
                playMode="click"
              />
            </div>

            <div className="md:col-span-7 space-y-4">
              <span className="font-mono-tech text-xs text-[#FF9F1C] px-3 py-1 rounded-full bg-[#FF9F1C]/10 border border-[#FF9F1C]/30 inline-block">
                {rev.category}
              </span>

              <h3 className="font-title text-xl font-bold text-white uppercase">
                {rev.title}
              </h3>

              <p className="font-body text-sm text-[#B8C2CC] leading-relaxed">
                {rev.desc}
              </p>

              <div className="pt-4 border-t border-white/10 flex items-center gap-2 font-mono-tech text-xs text-[#00D9FF]">
                <ShieldCheck className="w-4 h-4" />
                <span>Thực hiện trọn gói: Lên kịch bản • Quay • Hậu kỳ</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
