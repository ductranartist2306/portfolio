import React from 'react';
import { VideoCard } from './VideoCard';
import { Camera, Film, HeartHandshake, Sparkles } from 'lucide-react';

interface S8EventsProps {
  data: any;
}

export const S8Events: React.FC<S8EventsProps> = ({ data }) => {
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
      </div>

      {/* Grid 2 Event Sections (Video Intro vs Event Photography) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-auto">
        {/* Section 1: Video Intro Event */}
        <div className="p-6 rounded-2xl bg-[#141B24] border border-[#00D9FF]/30 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Film className="w-5 h-5 text-[#00D9FF]" />
            <h3 className="font-title text-xl font-bold text-white uppercase">
              {data.sections[0].title}
            </h3>
          </div>

          <VideoCard
            title="SỰ KIỆN VIVANT SKINCARE VIỆT NAM"
            subtitle="Video Intro mở đầu hội nghị khoa học Aesthetic"
            videoPath={data.sections[0].videoUrl}
            fallbackUrl={data.sections[0].videoUrl}
            aspectRatio="16:9"
            playMode="click"
          />

          <p className="font-body text-sm text-[#B8C2CC] leading-relaxed">
            {data.sections[0].body}
          </p>
        </div>

        {/* Section 2: Ảnh Chụp Event */}
        <div className="p-6 rounded-2xl bg-[#141B24] border border-[#FF9F1C]/30 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Camera className="w-5 h-5 text-[#FF9F1C]" />
            <h3 className="font-title text-xl font-bold text-white uppercase">
              {data.sections[1].title}
            </h3>
          </div>

          <div className="relative group rounded-2xl overflow-hidden aspect-[16/9] border border-white/10">
            <img
              src={data.sections[1].imageUrl}
              alt={data.sections[1].title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = './assets/project_spatial.jpg';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg glass-panel-dark">
              <span className="font-mono-tech text-xs text-[#FF9F1C] block uppercase font-semibold">
                DỰ ÁN THIỆN NGUYỆN "XOÁ BỚT CHO EM"
              </span>
              <span className="font-body text-[11px] text-[#B8C2CC]">
                Phối hợp cùng VTV Cần Thơ
              </span>
            </div>
          </div>

          <p className="font-body text-sm text-[#B8C2CC] leading-relaxed">
            {data.sections[1].body}
          </p>
        </div>
      </div>
    </div>
  );
};
