import React from 'react';
import { VideoCard } from './VideoCard';
import { Flame } from 'lucide-react';

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

      {/* Responsive 9:16 YouTube showcases */}
      <div className="mx-auto my-auto grid max-w-3xl grid-cols-1 items-start gap-8 md:grid-cols-2">
        {data.grid.map((item: any) => (
          <div
            key={item.id}
            className="mx-auto w-full max-w-sm rounded-[28px] border border-white/10 bg-[#141B24]/70 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-5"
          >
            <VideoCard
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              videoPath={item.path}
              fallbackUrl={item.fallbackVideoUrl}
              youtubeUrl={item.youtubeUrl}
              sourceAspectRatio={item.aspectRatio as any}
              playMode="click"
              isActive={isActive}
              reducedMotion={reducedMotion}
            />
          </div>
        ))}

        {/* Feature Highlights Card */}
        <div className="flex min-h-[280px] flex-col justify-between gap-6 rounded-[28px] border border-[#FF9F1C]/30 bg-[#141B24] p-6 md:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#FF9F1C]">
              <Flame className="w-5 h-5" />
              <span className="font-mono-tech text-xs font-bold uppercase tracking-wider">
                XU HƯỚNG SHORT-FORM
              </span>
            </div>

            <h3 className="font-title text-2xl font-bold uppercase text-white leading-tight">
              Tối Ưu Hoá Tỉ Lệ Giữ Chân Người Xem
            </h3>

            <p className="font-body text-xs text-[#B8C2CC] leading-relaxed">
              Dựng nhanh, tiết tấu dồn dập, sound design giật gân chuẩn thuật toán TikTok, Reels & Shorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/10 font-mono-tech text-xs text-[#00D9FF]">
            <div className="flex items-center justify-between p-2 rounded bg-[#0A0E14]">
              <span>KOL / KOC Commercial</span>
              <span>100% Retain</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#0A0E14]">
              <span>Dynamic Captions</span>
              <span>Sub Tự Động</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#0A0E14]">
              <span>Trend Sound Effects</span>
              <span>SFX Standard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
