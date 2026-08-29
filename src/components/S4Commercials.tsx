import React from 'react';
import { VideoCard } from './VideoCard';
import { Film, Car, Sparkles } from 'lucide-react';

interface S4CommercialsProps {
  data: any;
}

export const S4Commercials: React.FC<S4CommercialsProps> = ({ data }) => {
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

      {/* Asymmetric Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 my-auto">
        {data.bentoGrid.map((item: any) => (
          <div key={item.id} className={item.gridSpan}>
            <VideoCard
              title={item.title}
              subtitle={item.subtitle}
              videoPath={item.path}
              fallbackUrl={item.fallbackVideoUrl}
              aspectRatio={item.aspectRatio as any}
              playMode={item.id === 's4_bento_1' ? 'click' : 'hover'}
            />
          </div>
        ))}
      </div>

      {/* Commercial Highlights Footer Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
        <div className="p-4 rounded-xl bg-[#141B24] border border-white/5">
          <span className="font-mono-tech text-[10px] text-[#00D9FF] uppercase block">DỰ ÁN ĐIỂN HÌNH</span>
          <span className="font-title text-sm font-semibold text-white mt-1 block">Wuling Bingo 2026 & Mini EV</span>
        </div>
        <div className="p-4 rounded-xl bg-[#141B24] border border-white/5">
          <span className="font-mono-tech text-[10px] text-[#FF9F1C] uppercase block">KỸ THUẬT NỔI BẬT</span>
          <span className="font-title text-sm font-semibold text-white mt-1 block">Cinematic Lighting & Color Grading</span>
        </div>
        <div className="p-4 rounded-xl bg-[#141B24] border border-white/5">
          <span className="font-mono-tech text-[10px] text-[#00D9FF] uppercase block">SẢN PHẨM KHÁC</span>
          <span className="font-title text-sm font-semibold text-white mt-1 block">Thời Trang, Bất Động Sản, Trang Sức</span>
        </div>
      </div>
    </div>
  );
};
