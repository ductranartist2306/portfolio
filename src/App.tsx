import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import contentData from './data/contentData.json';
import { Header } from './components/Header';
import { CustomCursor } from './components/CustomCursor';
import { GoldenPortalBackground } from './components/GoldenPortalBackground';
import { S1Hero } from './components/S1Hero';
import { S2About } from './components/S2About';
import { S3Experience } from './components/S3Experience';
import { S4Commercials } from './components/S4Commercials';
import { S5Animation } from './components/S5Animation';
import { S6TikTok } from './components/S6TikTok';
import { S7Reviews } from './components/S7Reviews';
import { S8Events } from './components/S8Events';
import { S9Contact } from './components/S9Contact';

export function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLElement | null)[]>([]);

  const navItems = contentData.navigation;
  const slidesData = contentData.slides;
  const totalSlides = navItems.length;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const centeredEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const rootCenter = root.getBoundingClientRect().top + root.clientHeight / 2;
            const aCenter = a.boundingClientRect.top + a.boundingClientRect.height / 2;
            const bCenter = b.boundingClientRect.top + b.boundingClientRect.height / 2;
            return Math.abs(aCenter - rootCenter) - Math.abs(bCenter - rootCenter);
          })[0];

        if (!centeredEntry) return;
        const nextIndex = slidesRef.current.indexOf(centeredEntry.target as HTMLElement);
        if (nextIndex >= 0) setCurrentSlide(nextIndex);
      },
      {
        root,
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
      }
    );

    slidesRef.current.forEach((slide) => slide && observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  const goToSlide = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= totalSlides) return;

      const slide = slidesRef.current[targetIndex];
      if (!slide) return;

      if (targetIndex === 0) {
        setCurrentSlide(0);
        scrollContainerRef.current?.scrollTo({
          top: 0,
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
        return;
      }

      const videoFocus = slide.querySelector<HTMLElement>('[data-scroll-focus]');
      setCurrentSlide(targetIndex);
      (videoFocus ?? slide).scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: videoFocus ? 'center' : 'start',
        inline: 'nearest',
      });
    },
    [reducedMotion, totalSlides]
  );

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (drawerOpen) return;

      const target = event.target;
      const isEditing =
        target instanceof Element &&
        Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
      if (isEditing) return;

      if (event.key === 'PageDown' || event.key === 'PageUp') {
        event.preventDefault();
        goToSlide(currentSlide + (event.key === 'PageDown' ? 1 : -1));
        return;
      }

      const scrollAmount =
        event.key === 'ArrowDown'
          ? 80
          : event.key === 'ArrowUp'
          ? -80
          : null;

      if (scrollAmount !== null) {
        event.preventDefault();
        root.scrollBy({
          top: scrollAmount,
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
        return;
      }

      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        goToSlide(event.key === 'Home' ? 0 : totalSlides - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, drawerOpen, goToSlide, reducedMotion, totalSlides]);

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-[#130c08] font-body text-white">
      <CustomCursor reducedMotion={reducedMotion} />
      <GoldenPortalBackground reducedMotion={reducedMotion} />

      <div
        ref={scrollContainerRef}
        data-portfolio-scroll
        className="relative z-10 h-dvh w-full overflow-x-hidden overflow-y-auto scroll-smooth"
      >
        <Header
          navItems={navItems}
          currentSlide={currentSlide}
          onNavigateToSlide={goToSlide}
          onDrawerOpenChange={setDrawerOpen}
        />

        <main aria-hidden={drawerOpen || undefined} inert={drawerOpen || undefined}>
          <section ref={(element) => { slidesRef.current[0] = element; }} id="slide-s1" className="magazine-slide relative min-h-dvh w-full">
            <S1Hero data={slidesData.s1} onExploreClick={() => goToSlide(1)} />
          </section>

          <section ref={(element) => { slidesRef.current[1] = element; }} id="slide-s2" className="magazine-slide relative min-h-dvh w-full [scroll-snap-align:start]">
            <S2About data={slidesData.s2} brand={contentData.brand} />
          </section>

          <section ref={(element) => { slidesRef.current[2] = element; }} id="slide-s3" className="magazine-slide relative min-h-dvh w-full">
            <S3Experience data={slidesData.s3} isActive={currentSlide === 2} reducedMotion={reducedMotion} />
          </section>

          <section ref={(element) => { slidesRef.current[3] = element; }} id="slide-s4" className="magazine-slide relative min-h-dvh w-full">
            <S4Commercials data={slidesData.s4} isActive={currentSlide === 3} reducedMotion={reducedMotion} />
          </section>

          <section ref={(element) => { slidesRef.current[4] = element; }} id="slide-s5" className="magazine-slide relative min-h-dvh w-full">
            <S5Animation data={slidesData.s5} isActive={currentSlide === 4} reducedMotion={reducedMotion} />
          </section>

          <section ref={(element) => { slidesRef.current[5] = element; }} id="slide-s6" className="magazine-slide relative min-h-dvh w-full">
            <S6TikTok data={slidesData.s6} isActive={currentSlide === 5} reducedMotion={reducedMotion} />
          </section>

          <section ref={(element) => { slidesRef.current[6] = element; }} id="slide-s7" className="magazine-slide relative min-h-dvh w-full">
            <S7Reviews data={slidesData.s7} isActive={currentSlide === 6} reducedMotion={reducedMotion} />
          </section>

          <section ref={(element) => { slidesRef.current[7] = element; }} id="slide-s8" className="magazine-slide relative min-h-dvh w-full">
            <S8Events data={slidesData.s8} isActive={currentSlide === 7} reducedMotion={reducedMotion} />
          </section>

          <section ref={(element) => { slidesRef.current[8] = element; }} id="slide-s9" className="magazine-slide relative min-h-dvh w-full [scroll-snap-align:start]">
            <S9Contact data={slidesData.s9} brand={contentData.brand} />
          </section>
        </main>

        <div aria-hidden={drawerOpen || undefined} className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex" inert={drawerOpen || undefined}>
          <button onClick={() => goToSlide(currentSlide - 1)} disabled={currentSlide === 0} aria-label="Slide trước" className="cursor-pointer rounded-full p-2 text-white transition-all liquid-glass hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronUp className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-2 py-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button key={index} onClick={() => goToSlide(index)} aria-label={`Đi tới slide ${index + 1}`} aria-current={currentSlide === index} className={`w-2 cursor-pointer rounded-full transition-all duration-300 ${currentSlide === index ? 'h-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'h-2 bg-white/30 hover:bg-white/60'}`} />
            ))}
          </div>

          <button onClick={() => goToSlide(currentSlide + 1)} disabled={currentSlide === totalSlides - 1} aria-label="Slide tiếp theo" className="cursor-pointer rounded-full p-2 text-white transition-all liquid-glass hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronDown className="h-4 w-4" />
          </button>

          <span className="mt-2 font-mono-tech text-[10px] font-medium tracking-widest text-white/80">0{currentSlide + 1} / 0{totalSlides}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
