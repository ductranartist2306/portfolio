import React, { useState } from 'react';
import { Briefcase, Calendar, ChevronRight, Building, CheckCircle2 } from 'lucide-react';
import { VideoCard } from './VideoCard';

interface S3ExperienceProps {
  data: any;
  isActive?: boolean;
  reducedMotion?: boolean;
}

export const S3Experience: React.FC<S3ExperienceProps> = ({
  data,
  isActive = true,
  reducedMotion = false,
}) => {
  const [activeExp, setActiveExp] = useState(data.timeline.length - 1); // Default to Carnow (2024-2026)

  return (
    <div
      className="portal-section relative h-full min-h-screen w-full overflow-y-auto px-6 pb-16 pt-32 text-white lg:px-16"
      data-slide-scroll
    >
      {/* Header Eyebrow */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
        <div>
          <span className="font-mono-tech text-xs text-[#00D9FF] tracking-widest uppercase block">
            {data.index} // {data.title}
          </span>
          <h2 className="font-title text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white mt-1">
            {data.subtitle}
          </h2>
        </div>
        <span className="font-mono-tech text-xs text-[#FF9F1C] uppercase tracking-wider hidden sm:block">
          2019 — 2026
        </span>
      </div>

      {/* Grid 2 Column Layout (5:7 ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (5 cols): BTS Video + Company Showcase */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div className="rounded-2xl overflow-hidden bg-[#141B24] border border-[#00D9FF]/20">
            <VideoCard
              title="BEHIND THE SCENES — ON SET"
              subtitle="Hậu trường quay phim & điều hành sản xuất"
              videoPath={data.media?.behindTheScenes?.path}
              fallbackUrl={data.media?.behindTheScenes?.fallbackVideoUrl}
              youtubeUrl={data.media?.behindTheScenes?.youtubeUrl || "https://www.youtube.com/embed/t2MhC7DhrPc?autoplay=1&mute=1&loop=1&controls=0&rel=0&playsinline=1&playlist=t2MhC7DhrPc"}
              sourceAspectRatio="16:9"
              playMode="autoplay"
              isActive={isActive}
              reducedMotion={reducedMotion}
            />
          </div>

          <div className="p-6 rounded-2xl bg-[#141B24] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-xs text-[#00D9FF] uppercase tracking-wider">
                ĐƠN VỊ ĐÃ CÔNG TÁC
              </span>
              <span className="font-mono-tech text-[10px] text-[#B8C2CC]">6 TẬP ĐOÀN & MEDIA</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 font-mono-tech text-xs text-[#B8C2CC]">
              <div className="p-2.5 rounded-lg bg-[#0A0E14] border border-white/5 hover:border-[#00D9FF] transition-colors">
                GAPO Social
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0E14] border border-white/5 hover:border-[#00D9FF] transition-colors">
                VOV World
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0E14] border border-white/5 hover:border-[#00D9FF] transition-colors">
                Bazic Ent.
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0E14] border border-white/5 hover:border-[#00D9FF] transition-colors">
                Baliogo Group
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0E14] border border-white/5 hover:border-[#00D9FF] transition-colors">
                Govi Việt Nam
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0E14] border border-white/5 hover:border-[#00D9FF] transition-colors">
                Carnow
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Interactive Timeline List */}
        <div className="lg:col-span-7 relative pl-8">
          {/* Connecting spine so this reads as a progression, not equal cards */}
          <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gradient-to-b from-[#00D9FF]/50 via-white/10 to-transparent" />

          <div className="space-y-4">
            {data.timeline.map((item: any, idx: number) => {
              const isSelected = activeExp === idx;
              return (
                <div key={idx} className="relative">
                  <span
                    className={`absolute -left-8 top-7 w-[15px] h-[15px] rounded-full border-2 transition-colors ${
                      isSelected
                        ? 'bg-[#00D9FF] border-[#00D9FF] shadow-cyan-glow'
                        : 'bg-[#0A0E14] border-white/20'
                    }`}
                  />
                  <div
                    className={`rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#141B24] border-[#00D9FF] shadow-cyan-glow'
                        : 'bg-[#141B24]/60 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <button
                      type="button"
                      aria-controls={`experience-details-${idx}`}
                      aria-expanded={isSelected}
                      onClick={() => setActiveExp(idx)}
                      data-cursor-tone="light"
                      className="w-full cursor-pointer rounded-2xl p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B860] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E14]"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Building className={`w-4 h-4 ${isSelected ? 'text-[#00D9FF]' : 'text-[#6B7480]'}`} />
                          <h3 className="font-title text-base font-bold uppercase tracking-wider text-white sm:text-lg">
                            {item.company}
                          </h3>
                        </div>

                        <span className={`font-mono-tech text-xs px-3 py-1 rounded-full border ${
                          isSelected
                            ? 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/40'
                            : 'bg-white/5 text-[#B8C2CC] border-white/10'
                        }`}>
                          {item.period}
                        </span>
                      </div>

                      <p className="font-title text-sm font-semibold text-[#FF9F1C]">
                        {item.role}
                      </p>
                    </button>

                    {isSelected && (
                      <ul
                        id={`experience-details-${idx}`}
                        className="mx-6 mb-6 space-y-2 border-t border-white/10 pt-4 font-body text-xs text-[#B8C2CC] sm:text-sm"
                      >
                        {item.highlights.map((h: string, hIdx: number) => (
                          <li key={hIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#00D9FF] shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
