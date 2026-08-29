import React from 'react';
import { VideoCard } from './VideoCard';
import { Smartphone, Flame, TrendingUp } from 'lucide-react';

interface S6TikTokProps {
  data: any;
}

export const S6TikTok: React.FC<S6TikTokProps> = ({ data }) => {
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

      {/* Grid 9:16 Vertical Phone Aspect Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto my-auto">
        {data.grid.map((item: any) => (
          <div key={item.id} className="space-y-3">
            <VideoCard
              title={item.title}
              subtitle={item.subtitle}
              videoPath={item.path}
              fallbackUrl={item.fallbackVideoUrl}
              aspectRatio="9:16"
              playMode="click"
            />
          </div>
        ))}

        {/* Feature Highlights Card */}
        <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#141B24] border border-[#FF9F1C]/30 aspect-[9/16]">
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

          <div className="space-y-3 pt-4 border-t border-white/10 font-mono-tech text-xs text-[#00D9FF]">
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
