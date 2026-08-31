import React from 'react';
import { getPortalAssetSources } from '../lib/portfolioUi';

interface GoldenPortalBackgroundProps {
  reducedMotion: boolean;
}

export const GoldenPortalBackground: React.FC<GoldenPortalBackgroundProps> = ({
  reducedMotion,
}) => {
  const assets = getPortalAssetSources(import.meta.env.BASE_URL);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#130c08]"
      data-testid="golden-portal-background"
    >
      <div
        className={`absolute -inset-[3%] opacity-90 ${
          reducedMotion ? '' : 'animate-portal-drift'
        }`}
      >
        <picture className="block h-full w-full">
          <source
            media="(max-width: 767px)"
            srcSet={assets.mobileAvif}
            type="image/avif"
          />
          <source
            media="(max-width: 767px)"
            srcSet={assets.mobileWebp}
            type="image/webp"
          />
          <source srcSet={assets.desktopAvif} type="image/avif" />
          <img
            alt=""
            className="h-full w-full object-cover object-center"
            decoding="async"
            fetchPriority="high"
            loading="eager"
            src={assets.desktopWebp}
          />
        </picture>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(255,201,103,0.03),rgba(12,7,5,0.14)_48%,rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-[#160d08]/10 to-black/55" />
      <div
        className="absolute inset-0 opacity-[0.13] mix-blend-soft-light"
        style={{
          backgroundImage:
            'repeating-radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18) 0 0.7px, transparent 0.8px 3px)',
        }}
      />
    </div>
  );
};
