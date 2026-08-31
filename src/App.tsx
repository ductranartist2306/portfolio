import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
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
import {
  canNavigateSlides,
  getElementOffsetTop,
  getShowcaseScrollTop,
  getWheelDeltaPixels,
  getWheelGestureAction,
  shouldHoldTransitionInput,
  shouldNavigateFromScroll,
  WHEEL_GESTURE_IDLE_MS,
} from './lib/portfolioUi';

type ScrollDirection = 'up' | 'down';

interface WheelGestureSession {
  direction: ScrollDirection;
  startedAtBoundary: boolean;
  accumulatedDelta: number;
  lastEventAt: number;
}

interface WheelHandoff {
  direction: ScrollDirection;
  lastEventAt: number;
}

interface TouchGestureSession {
  startY: number;
  atTop: boolean;
  atBottom: boolean;
}

export function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimating = useRef(false);
  const wheelGestureRef = useRef<WheelGestureSession | null>(null);
  const wheelHandoffRef = useRef<WheelHandoff | null>(null);
  const touchGestureRef = useRef<TouchGestureSession | null>(null);

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

  const getSlideScrollElement = useCallback((slideIndex: number) => {
    return (
      slidesRef.current[slideIndex]?.querySelector<HTMLElement>('[data-slide-scroll]') ??
      null
    );
  }, []);

  const isScrollBoundary = useCallback(
    (scrollElement: HTMLElement | null, direction: ScrollDirection) => {
      if (!scrollElement) return true;

      return shouldNavigateFromScroll({
        direction,
        scrollTop: scrollElement.scrollTop,
        scrollHeight: scrollElement.scrollHeight,
        clientHeight: scrollElement.clientHeight,
      });
    },
    []
  );

  const prepareSlideFocus = useCallback(
    (slideIndex: number) => {
      const slide = slidesRef.current[slideIndex];
      const scrollElement = getSlideScrollElement(slideIndex);
      if (!slide || !scrollElement) return;

      const showcase = slide.querySelector<HTMLElement>('[data-showcase-focus]');
      if (!showcase) {
        scrollElement.scrollTop = 0;
        return;
      }

      const showcaseAnchor =
        slide.querySelector<HTMLElement>('[data-showcase-anchor]') ?? showcase;
      const showcaseRect = showcase.getBoundingClientRect();
      const anchorRect = showcaseAnchor.getBoundingClientRect();
      const headerHeight =
        document.querySelector<HTMLElement>('nav')?.getBoundingClientRect().height ?? 0;
      const layoutOffsetTop = getElementOffsetTop(showcaseAnchor, scrollElement);
      const fallbackOffsetTop =
        anchorRect.top - scrollElement.getBoundingClientRect().top + scrollElement.scrollTop;
      const targetOffsetTop = layoutOffsetTop ?? fallbackOffsetTop;

      scrollElement.scrollTop = getShowcaseScrollTop({
        scrollHeight: scrollElement.scrollHeight,
        clientHeight: scrollElement.clientHeight,
        targetOffsetTop,
        targetHeight: showcaseRect.height,
        safeInset: headerHeight,
      });
    },
    [getSlideScrollElement]
  );

  const goToSlide = useCallback(
    (targetIndex: number, wheelHandoff?: WheelHandoff) => {
      if (targetIndex < 0 || targetIndex >= totalSlides || isAnimating.current) return;

      const currentElement = slidesRef.current[currentSlide];
      const nextElement = slidesRef.current[targetIndex];
      if (!currentElement || !nextElement) return;

      if (targetIndex === currentSlide) {
        prepareSlideFocus(targetIndex);
        return;
      }

      isAnimating.current = true;
      wheelGestureRef.current = null;
      wheelHandoffRef.current = wheelHandoff ?? null;

      const direction = targetIndex > currentSlide ? 1 : -1;
      const exitDuration = reducedMotion ? 0.01 : 0.46;
      const enterDuration = reducedMotion ? 0.01 : 0.78;
      const enterOffset = reducedMotion ? 0 : 18;
      const exitOffset = reducedMotion ? 0 : 10;

      gsap.killTweensOf([currentElement, nextElement]);
      gsap.set(nextElement, {
        display: 'block',
        visibility: 'hidden',
        pointerEvents: 'none',
      });
      prepareSlideFocus(targetIndex);
      gsap.set(nextElement, {
        yPercent: direction * enterOffset,
        opacity: 0,
        scale: reducedMotion ? 1 : 0.992,
        visibility: 'visible',
        pointerEvents: 'none',
      });

      const timeline = gsap.timeline({
        onComplete: () => {
          gsap.set(currentElement, { display: 'none' });
          setCurrentSlide(targetIndex);
          gsap.set(currentElement, { clearProps: 'transform,opacity,scale,pointerEvents' });
          gsap.set(nextElement, {
            clearProps: 'transform,opacity,scale,visibility,pointerEvents',
          });
          isAnimating.current = false;
        },
      });

      timeline
        .to(
          currentElement,
          {
            yPercent: -direction * exitOffset,
            opacity: 0,
            scale: reducedMotion ? 1 : 0.996,
            duration: exitDuration,
            ease: 'power2.in',
          },
          0
        )
        .to(
          nextElement,
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            duration: enterDuration,
            ease: 'power3.out',
          },
          reducedMotion ? 0 : 0.08
        );
    },
    [currentSlide, prepareSlideFocus, reducedMotion, totalSlides]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      if (
        event.deltaY === 0 ||
        !canNavigateSlides({ drawerOpen, interactiveTarget: false })
      ) {
        return;
      }

      const now = performance.now();
      const scrollElement = getSlideScrollElement(currentSlide);
      const lineHeight = Number.parseFloat(
        getComputedStyle(scrollElement ?? container).lineHeight
      );
      const normalizedDeltaY = getWheelDeltaPixels({
        deltaY: event.deltaY,
        deltaMode: event.deltaMode,
        lineHeight: Number.isFinite(lineHeight) ? lineHeight : 16,
        pageHeight: scrollElement?.clientHeight ?? container.clientHeight,
      });
      const direction: ScrollDirection = normalizedDeltaY > 0 ? 'down' : 'up';
      const activeHandoff = wheelHandoffRef.current;
      const continuesHandoff = shouldHoldTransitionInput({
        isAnimating: false,
        handoff: activeHandoff,
        direction,
        now,
      });

      if (continuesHandoff) {
        wheelHandoffRef.current = { direction, lastEventAt: now };
        event.preventDefault();
        return;
      }

      wheelHandoffRef.current = null;
      if (shouldHoldTransitionInput({ isAnimating: isAnimating.current })) {
        event.preventDefault();
        return;
      }

      const atBoundary = isScrollBoundary(scrollElement, direction);
      const previousGesture = wheelGestureRef.current;
      const startsNewGesture =
        !previousGesture ||
        previousGesture.direction !== direction ||
        now - previousGesture.lastEventAt >= WHEEL_GESTURE_IDLE_MS;

      const gesture: WheelGestureSession = startsNewGesture
        ? {
            direction,
            startedAtBoundary: atBoundary,
            accumulatedDelta: Math.abs(normalizedDeltaY),
            lastEventAt: now,
          }
        : {
            ...previousGesture,
            accumulatedDelta:
              previousGesture.accumulatedDelta + Math.abs(normalizedDeltaY),
            lastEventAt: now,
          };

      wheelGestureRef.current = gesture;
      const action = getWheelGestureAction({
        atBoundary,
        startedAtBoundary: gesture.startedAtBoundary,
        accumulatedDelta: gesture.accumulatedDelta,
      });

      if (action === 'scroll-section') return;

      event.preventDefault();
      if (action === 'navigate-slide') {
        wheelGestureRef.current = null;
        goToSlide(currentSlide + (direction === 'down' ? 1 : -1), {
          direction,
          lastEventAt: now,
        });
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const scrollElement = getSlideScrollElement(currentSlide);
      touchGestureRef.current = {
        startY: event.touches[0].clientY,
        atTop: isScrollBoundary(scrollElement, 'up'),
        atBottom: isScrollBoundary(scrollElement, 'down'),
      };
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const gesture = touchGestureRef.current;
      touchGestureRef.current = null;
      if (!gesture || drawerOpen || isAnimating.current) return;

      const distance = gesture.startY - event.changedTouches[0].clientY;
      if (Math.abs(distance) < 50) return;

      if (distance > 0 && gesture.atBottom) {
        goToSlide(currentSlide + 1);
      } else if (distance < 0 && gesture.atTop) {
        goToSlide(currentSlide - 1);
      }
    };

    const handleTouchCancel = () => {
      touchGestureRef.current = null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const interactiveTarget =
        target instanceof Element &&
        Boolean(
          target.closest(
            'input, textarea, select, button, a, iframe, [contenteditable="true"]'
          )
        );

      if (!canNavigateSlides({ drawerOpen, interactiveTarget })) return;

      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        goToSlide(event.key === 'Home' ? 0 : totalSlides - 1);
        return;
      }

      const direction: ScrollDirection | null =
        event.key === 'ArrowDown' || event.key === 'PageDown'
          ? 'down'
          : event.key === 'ArrowUp' || event.key === 'PageUp'
          ? 'up'
          : null;
      if (!direction) return;

      event.preventDefault();
      const scrollElement = getSlideScrollElement(currentSlide);
      if (scrollElement && !isScrollBoundary(scrollElement, direction)) {
        const distance = event.key.startsWith('Page') ? scrollElement.clientHeight * 0.85 : 80;
        scrollElement.scrollBy({
          top: direction === 'down' ? distance : -distance,
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
        return;
      }

      goToSlide(currentSlide + (direction === 'down' ? 1 : -1));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    currentSlide,
    drawerOpen,
    getSlideScrollElement,
    goToSlide,
    isScrollBoundary,
    reducedMotion,
    totalSlides,
  ]);

  useEffect(() => {
    return () => {
      gsap.killTweensOf(slidesRef.current.filter(Boolean));
    };
  }, []);

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-[#130c08] font-body text-white">
      <CustomCursor reducedMotion={reducedMotion} />
      <GoldenPortalBackground reducedMotion={reducedMotion} />

      <Header
        navItems={navItems}
        currentSlide={currentSlide}
        onNavigateToSlide={goToSlide}
        onDrawerOpenChange={setDrawerOpen}
        reducedMotion={reducedMotion}
      />

      <main
        ref={containerRef}
        aria-hidden={drawerOpen || undefined}
        className="absolute inset-0 z-10 h-full w-full"
        inert={drawerOpen || undefined}
      >
        <div
          ref={(element) => { slidesRef.current[0] = element; }}
          id="slide-s1"
          className="magazine-slide absolute inset-0 h-full w-full"
          style={{ display: currentSlide === 0 ? 'block' : 'none' }}
        >
          <S1Hero data={slidesData.s1} onExploreClick={() => goToSlide(1)} />
        </div>

        <div
          ref={(element) => { slidesRef.current[1] = element; }}
          id="slide-s2"
          className="magazine-slide absolute inset-0 h-full w-full"
          style={{ display: currentSlide === 1 ? 'block' : 'none' }}
        >
          <S2About data={slidesData.s2} brand={contentData.brand} />
        </div>

        <div
          ref={(element) => { slidesRef.current[2] = element; }}
          id="slide-s3"
          className="magazine-slide absolute inset-0 h-full w-full"
          style={{ display: currentSlide === 2 ? 'block' : 'none' }}
        >
          <S3Experience
            data={slidesData.s3}
            isActive={currentSlide === 2}
            reducedMotion={reducedMotion}
          />
        </div>

        <div
          ref={(element) => { slidesRef.current[3] = element; }}
          id="slide-s4"
          className="magazine-slide absolute inset-0 h-full w-full"
          style={{ display: currentSlide === 3 ? 'block' : 'none' }}
        >
          <S4Commercials
            data={slidesData.s4}
            isActive={currentSlide === 3}
            reducedMotion={reducedMotion}
          />
        </div>

        <div
          ref={(element) => { slidesRef.current[4] = element; }}
          id="slide-s5"
          className="magazine-slide absolute inset-0 h-full w-full"
          style={{ display: currentSlide === 4 ? 'block' : 'none' }}
        >
          <S5Animation
            data={slidesData.s5}
            isActive={currentSlide === 4}
            reducedMotion={reducedMotion}
          />
        </div>

        <div
          ref={(element) => { slidesRef.current[5] = element; }}
          id="slide-s6"
          className="magazine-slide absolute inset-0 h-full w-full"
          style={{ display: currentSlide === 5 ? 'block' : 'none' }}
        >
          <S6TikTok
            data={slidesData.s6}
            isActive={currentSlide === 5}
            reducedMotion={reducedMotion}
          />
        </div>

        <div
          ref={(element) => { slidesRef.current[6] = element; }}
          id="slide-s7"
          className="magazine-slide absolute inset-0 h-full w-full"
          style={{ display: currentSlide === 6 ? 'block' : 'none' }}
        >
          <S7Reviews
            data={slidesData.s7}
            isActive={currentSlide === 6}
            reducedMotion={reducedMotion}
          />
        </div>

        <div
          ref={(element) => { slidesRef.current[7] = element; }}
          id="slide-s8"
          className="magazine-slide absolute inset-0 h-full w-full"
          style={{ display: currentSlide === 7 ? 'block' : 'none' }}
        >
          <S8Events
            data={slidesData.s8}
            isActive={currentSlide === 7}
            reducedMotion={reducedMotion}
          />
        </div>

        <div
          ref={(element) => { slidesRef.current[8] = element; }}
          id="slide-s9"
          className="magazine-slide absolute inset-0 h-full w-full"
          style={{ display: currentSlide === 8 ? 'block' : 'none' }}
        >
          <S9Contact data={slidesData.s9} brand={contentData.brand} />
        </div>
      </main>

      <div
        aria-hidden={drawerOpen || undefined}
        className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex"
        inert={drawerOpen || undefined}
      >
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          disabled={currentSlide === 0}
          aria-label="Slide trước"
          className="cursor-pointer rounded-full p-2 text-white transition-all liquid-glass hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronUp className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-2 py-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Đi tới slide ${index + 1}`}
              aria-current={currentSlide === index}
              className={`w-2 cursor-pointer rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'h-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                  : 'h-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => goToSlide(currentSlide + 1)}
          disabled={currentSlide === totalSlides - 1}
          aria-label="Slide tiếp theo"
          className="cursor-pointer rounded-full p-2 text-white transition-all liquid-glass hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        <span className="mt-2 font-mono-tech text-[10px] font-medium tracking-widest text-white/80">
          0{currentSlide + 1} / 0{totalSlides}
        </span>
      </div>
    </div>
  );
}

export default App;
