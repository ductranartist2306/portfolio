import React, { useState } from 'react';
import { Building, CheckCircle2, ImageIcon } from 'lucide-react';
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
  const [activeExp, setActiveExp] = useState(data.timeline.length - 1);
  const startYear = data.timeline[0]?.period.split(' - ')[0]?.trim() ?? '';
  const endYear = data.timeline.at(-1)?.period.split(' - ')[1]?.trim() ?? '';

  return (
    <div
      data-s3-root
      data-slide-scroll
      className="portal-section relative h-full min-h-screen w-full overflow-y-auto px-6 pb-16 pt-32 text-white lg:px-16"
    >
      <div
        data-s3-header
        className="mb-6 flex items-center justify-between border-b border-white/10 pb-4"
      >
        <div>
          <span className="block font-mono-tech text-xs uppercase tracking-widest text-[#00D9FF]">
            {data.title}
          </span>
          <h2 className="mt-1 font-title text-2xl font-bold uppercase tracking-tight text-white sm:text-4xl">
            {data.subtitle}
          </h2>
        </div>
        <span className="hidden font-mono-tech text-xs uppercase tracking-wider text-[#FF9F1C] sm:block">
          {startYear} — {endYear}
        </span>
      </div>

      <div
        data-s3-grid
        data-showcase-anchor
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
      >
        <div data-s3-left className="space-y-6 lg:col-span-5">
          <div
            data-showcase-focus
            className="overflow-hidden rounded-2xl border border-[#00D9FF]/20 bg-[#141B24]"
          >
            <VideoCard
              title="BEHIND THE SCENES — ON SET"
              subtitle="Hậu trường quay phim & điều hành sản xuất"
              videoPath={data.media?.behindTheScenes?.path}
              fallbackUrl={data.media?.behindTheScenes?.fallbackVideoUrl}
              youtubeUrl={data.media?.behindTheScenes?.youtubeUrl}
              sourceAspectRatio={data.media?.behindTheScenes?.aspectRatio ?? '16:9'}
              playMode="click"
              isActive={isActive}
              reducedMotion={reducedMotion}
            />
          </div>

          {data.media?.supplementaryImage?.path ? (
            <div className="overflow-hidden rounded-2xl border border-[#00D9FF]/20 bg-[#141B24]">
              <img
                src={data.media.supplementaryImage.path}
                alt={data.media.supplementaryImage.caption ?? ''}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(244,184,96,0.2),_transparent_55%),linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(10,14,20,0.96))] px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30">
                <ImageIcon className="h-5 w-5 text-white/60" />
              </div>
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
                Ảnh sắp cập nhật
              </p>
            </div>
          )}
        </div>

        <div className="relative pl-8 lg:col-span-7">
          <div className="absolute bottom-3 left-[7px] top-3 w-px bg-gradient-to-b from-[#00D9FF]/50 via-white/10 to-transparent" />

          <div data-s3-timeline className="space-y-3">
            {data.timeline.map((item: any, idx: number) => {
              const isSelected = activeExp === idx;

              return (
                <div key={item.company} className="relative">
                  <span
                    className={`absolute -left-8 top-5 h-[15px] w-[15px] rounded-full border-2 transition-colors ${
                      isSelected
                        ? 'border-[#00D9FF] bg-[#00D9FF] shadow-cyan-glow'
                        : 'border-white/20 bg-[#0A0E14]'
                    }`}
                  />
                  <div
                    className={`rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? 'border-[#00D9FF] bg-[#141B24] shadow-cyan-glow'
                        : 'border-white/10 bg-[#141B24]/60 hover:border-white/30'
                    }`}
                  >
                    <button
                      type="button"
                      aria-controls={`experience-details-${idx}`}
                      aria-expanded={isSelected}
                      onClick={() => setActiveExp(idx)}
                      data-cursor-tone="light"
                      className="w-full cursor-pointer rounded-2xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B860] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E14]"
                    >
                      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Building
                            className={`h-4 w-4 ${
                              isSelected ? 'text-[#00D9FF]' : 'text-[#6B7480]'
                            }`}
                          />
                          <h3 className="font-title text-sm font-bold uppercase tracking-wider text-white sm:text-base">
                            {item.company}
                          </h3>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 font-mono-tech text-[10px] ${
                            isSelected
                              ? 'border-[#00D9FF]/40 bg-[#00D9FF]/10 text-[#00D9FF]'
                              : 'border-white/10 bg-white/5 text-[#B8C2CC]'
                          }`}
                        >
                          {item.period}
                        </span>
                      </div>

                      <p className="font-title text-xs font-semibold text-[#FF9F1C] sm:text-sm">
                        {item.role}
                      </p>
                    </button>

                    {isSelected && (
                      <ul
                        id={`experience-details-${idx}`}
                        className="mx-4 mb-4 space-y-1.5 border-t border-white/10 pt-3 font-body text-xs text-[#B8C2CC]"
                      >
                        {item.highlights.map((highlight: string) => (
                          <li key={highlight} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00D9FF]" />
                            <span>{highlight}</span>
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
