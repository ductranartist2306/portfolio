import React from 'react';
import { Award, Film, CheckCircle2, Cpu, Wrench } from 'lucide-react';
import portraitImg from '../assets/images/regenerated_image_1787278337594.webp';

interface S2AboutProps {
  data: any;
  brand: any;
}

export const S2About: React.FC<S2AboutProps> = ({ data, brand }) => {
  return (
    <div
      className="portal-section relative h-full min-h-screen w-full overflow-y-auto px-6 pb-16 pt-32 text-white lg:px-16"
      data-slide-scroll
    >
      {/* Header Eyebrow */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-8">
        <span className="font-mono-tech text-xs text-[#00D9FF] tracking-widest uppercase">
          {data.index} // {data.title}
        </span>
      </div>

      {/* Grid 2 Column Split Dashboard (4:6 ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start my-auto">
        {/* Left Sticky Sidebar (4 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div className="relative group rounded-2xl overflow-hidden bg-[#141B24] neon-border neon-border-hover shadow-cyan-glow aspect-[4/5] max-w-md mx-auto lg:mx-0">
            <img
              src={portraitImg || data.media?.path}
              alt={data.subtitle}
              onError={(e) => {
                (e.target as HTMLImageElement).src = './assets/profile_portrait.jpg';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14] via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-panel-dark border border-white/10 backdrop-blur-md">
              <span className="font-title text-xl font-bold text-white block">
                {data.subtitle}
              </span>
              <span className="font-mono-tech text-xs text-[#00D9FF] block uppercase tracking-wider mt-1">
                {brand.role} • 5+ Năm Kinh Nghiệm
              </span>
            </div>
          </div>
        </div>

        {/* Right Scrollable Content (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="font-mono-tech text-xs text-[#FF9F1C] uppercase tracking-widest block mb-2">
              TỔNG QUAN NĂNG LỰC
            </span>
            <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide leading-tight text-white mb-6">
              {data.headline}
            </h2>
            <p className="font-body text-base sm:text-lg text-[#B8C2CC] font-light leading-relaxed">
              {data.body}
            </p>
          </div>

          {/* Software Skills Highlights Grid */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="font-mono-tech text-xs text-[#00D9FF] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>PHẦN MỀM THÀNH THẠO</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.highlights.map((skill: string, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#141B24] border border-[#00D9FF]/20 hover:border-[#00D9FF] hover:shadow-cyan-glow transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-[#00D9FF] mb-2 neon-glow-cyan" />
                  <span className="font-title text-sm font-semibold text-white block">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Specializations */}
          <div className="p-6 rounded-2xl bg-[#141B24] border border-[#FF9F1C]/30 space-y-4">
            <h4 className="font-title text-base font-bold text-[#FF9F1C] uppercase tracking-wider">
              LĨNH VỰC SẢN XUẤT CHÍNH
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-body text-sm text-[#B8C2CC]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D9FF]" />
                <span>Video Quảng Cáo Thương Hiệu</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D9FF]" />
                <span>Video TVC </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D9FF]" />
                <span>Video TikTok / Shorts / Reels</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D9FF]" />
                <span>Video Intro Event & Ảnh Chụp Event</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
