import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import contentData from './data/contentData.json';
import { Header } from './components/Header';
import { BackgroundVideo } from './components/BackgroundVideo';
import { S1Hero } from './components/S1Hero';
import { S2About } from './components/S2About';
import { S3Experience } from './components/S3Experience';
import { S4Commercials } from './components/S4Commercials';
import { S5Animation } from './components/S5Animation';
import { S6TikTok } from './components/S6TikTok';
import { S7Reviews } from './components/S7Reviews';
import { S8Events } from './components/S8Events';
import { S9Contact } from './components/S9Contact';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 9;
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimating = useRef(false);

  const navItems = contentData.navigation;
  const slidesData = contentData.slides;

  // GSAP Smooth Slide Transition
  const goToSlide = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= totalSlides || isAnimating.current) return;
    if (targetIndex === currentSlide) return;

    isAnimating.current = true;
    const direction = targetIndex > currentSlide ? 1 : -1;
    const currentEl = slidesRef.current[currentSlide];
    const nextEl = slidesRef.current[targetIndex];

    if (currentEl && nextEl) {
      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentSlide(targetIndex);
          isAnimating.current = false;
        },
      });

      // Prepare next slide position
      gsap.set(nextEl, {
        yPercent: direction * 100,
        opacity: 0,
        display: 'block',
      });

      // Animate current out and next in
      tl.to(currentEl, {
        yPercent: -direction * 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.inOut',
      }).to(
        nextEl,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.inOut',
        },
        '<=0.1'
      );
    } else {
      setCurrentSlide(targetIndex);
      isAnimating.current = false;
    }
  };

  // Wheel listener for slide scrolling
  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimating.current) return;

      if (e.deltaY > 30) {
        goToSlide(currentSlide + 1);
      } else if (e.deltaY < -30) {
        goToSlide(currentSlide - 1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (diff > 50) {
        goToSlide(currentSlide + 1);
      } else if (diff < -50) {
        goToSlide(currentSlide - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        goToSlide(currentSlide - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-body select-none">
      {/* Mux HLS Background Video Stream */}
      <BackgroundVideo opacity={0.4} />

      {/* Top Fixed Header */}
      <Header
        navItems={navItems}
        currentSlide={currentSlide}
        onNavigateToSlide={goToSlide}
      />

      {/* Main Slides Stack Container */}
      <div ref={containerRef} className="relative z-10 w-full h-full">
        {/* Slide 01 — Hero */}
        <div
          ref={(el) => (slidesRef.current[0] = el)}
          className="absolute inset-0 w-full h-full magazine-slide"
          style={{ display: currentSlide === 0 ? 'block' : 'none' }}
        >
          <S1Hero data={slidesData.s1} onExploreClick={() => goToSlide(1)} />
        </div>

        {/* Slide 02 — About */}
        <div
          ref={(el) => (slidesRef.current[1] = el)}
          className="absolute inset-0 w-full h-full magazine-slide"
          style={{ display: currentSlide === 1 ? 'block' : 'none' }}
        >
          <S2About data={slidesData.s2} brand={contentData.brand} />
        </div>

        {/* Slide 03 — Experience */}
        <div
          ref={(el) => (slidesRef.current[2] = el)}
          className="absolute inset-0 w-full h-full magazine-slide"
          style={{ display: currentSlide === 2 ? 'block' : 'none' }}
        >
          <S3Experience data={slidesData.s3} />
        </div>

        {/* Slide 04 — Commercials */}
        <div
          ref={(el) => (slidesRef.current[3] = el)}
          className="absolute inset-0 w-full h-full magazine-slide"
          style={{ display: currentSlide === 3 ? 'block' : 'none' }}
        >
          <S4Commercials data={slidesData.s4} />
        </div>

        {/* Slide 05 — 2D Animation & App */}
        <div
          ref={(el) => (slidesRef.current[4] = el)}
          className="absolute inset-0 w-full h-full magazine-slide"
          style={{ display: currentSlide === 4 ? 'block' : 'none' }}
        >
          <S5Animation data={slidesData.s5} />
        </div>

        {/* Slide 06 — TikTok & Social */}
        <div
          ref={(el) => (slidesRef.current[5] = el)}
          className="absolute inset-0 w-full h-full magazine-slide"
          style={{ display: currentSlide === 5 ? 'block' : 'none' }}
        >
          <S6TikTok data={slidesData.s6} />
        </div>

        {/* Slide 07 — Reviews */}
        <div
          ref={(el) => (slidesRef.current[6] = el)}
          className="absolute inset-0 w-full h-full magazine-slide"
          style={{ display: currentSlide === 6 ? 'block' : 'none' }}
        >
          <S7Reviews data={slidesData.s7} />
        </div>

        {/* Slide 08 — Events */}
        <div
          ref={(el) => (slidesRef.current[7] = el)}
          className="absolute inset-0 w-full h-full magazine-slide"
          style={{ display: currentSlide === 7 ? 'block' : 'none' }}
        >
          <S8Events data={slidesData.s8} />
        </div>

        {/* Slide 09 — Contact */}
        <div
          ref={(el) => (slidesRef.current[8] = el)}
          className="absolute inset-0 w-full h-full magazine-slide"
          style={{ display: currentSlide === 8 ? 'block' : 'none' }}
        >
          <S9Contact data={slidesData.s9} brand={contentData.brand} />
        </div>
      </div>

      {/* Right Fixed Slide Controls & Counter */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-4">
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          disabled={currentSlide === 0}
          className="p-2 rounded-full liquid-glass text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* Slide Progress Indicator */}
        <div className="flex flex-col gap-2 py-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-2 transition-all duration-300 rounded-full cursor-pointer ${
                currentSlide === idx
                  ? 'h-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                  : 'h-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => goToSlide(currentSlide + 1)}
          disabled={currentSlide === totalSlides - 1}
          className="p-2 rounded-full liquid-glass text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Numerical Counter */}
        <span className="font-mono-tech text-[10px] text-white/80 font-medium mt-2 tracking-widest">
          0{currentSlide + 1} / 0{totalSlides}
        </span>
      </div>
    </div>
  );
}

export default App;
