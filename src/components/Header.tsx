import React, { useEffect, useId, useRef, useState } from 'react';
import { Menu, X, Send, Film } from 'lucide-react';
import { NavigationItem } from '../types/portfolio';
import { getFocusTrapTargetIndex } from '../lib/portfolioUi';

interface HeaderProps {
  navItems: NavigationItem[];
  currentSlide: number;
  onNavigateToSlide: (index: number) => void;
  onDrawerOpenChange?: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  navItems,
  currentSlide,
  onNavigateToSlide,
  onDrawerOpenChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const drawerId = useId();
  const drawerTitleId = useId();

  const leftNav = navItems.slice(0, 4);
  const rightNav = navItems.slice(4);

  const setDrawerOpen = (nextOpen: boolean) => {
    if (nextOpen && document.activeElement instanceof HTMLElement) {
      previousFocusRef.current = document.activeElement;
    }

    setMobileMenuOpen(nextOpen);
  };

  const getFocusableElements = (): HTMLElement[] => {
    const drawer = drawerRef.current;
    if (!drawer) return [];

    return Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  };

  useEffect(() => {
    onDrawerOpenChange?.(mobileMenuOpen);
  }, [mobileMenuOpen, onDrawerOpenChange]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [currentSlide]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      if (!previousFocusRef.current) return;

      const restoreTarget =
        previousFocusRef.current && previousFocusRef.current.isConnected
          ? previousFocusRef.current
          : mobileToggleRef.current;
      previousFocusRef.current = null;
      restoreTarget?.focus();
      return;
    }

    const focusableElements = getFocusableElements();
    const initialFocusTarget = focusableElements[0] ?? drawerRef.current;
    initialFocusTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const currentFocusable = getFocusableElements();
      if (currentFocusable.length === 0) {
        event.preventDefault();
        drawerRef.current?.focus();
        return;
      }

      const activeElement = document.activeElement;
      const activeIndex = currentFocusable.findIndex((element) => element === activeElement);
      const targetIndex = getFocusTrapTargetIndex({
        activeIndex,
        count: currentFocusable.length,
        shiftKey: event.shiftKey,
      });

      if (targetIndex !== null) {
        event.preventDefault();
        currentFocusable[targetIndex].focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const activeScrollEl = document.querySelector<HTMLElement>('[data-portfolio-scroll]');
    const previousBodyOverflow = document.body.style.overflow;
    const previousScrollOverflow = activeScrollEl?.style.overflow ?? '';
    const previousScrollTouchAction = activeScrollEl?.style.touchAction ?? '';

    document.body.style.overflow = 'hidden';
    if (activeScrollEl) {
      activeScrollEl.style.overflow = 'hidden';
      activeScrollEl.style.touchAction = 'none';
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      if (activeScrollEl) {
        activeScrollEl.style.overflow = previousScrollOverflow;
        activeScrollEl.style.touchAction = previousScrollTouchAction;
      }
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav
        ref={headerRef}
        className="sticky top-0 z-50 w-full pointer-events-none xl:relative xl:top-auto"
      >
        <div className="liquid-glass w-full px-5 sm:px-8 py-3 flex items-center justify-between border-b border-white/10 pointer-events-auto backdrop-blur-md">
          {/* Left Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-6">
            {leftNav.map((item) => {
              const isActive = currentSlide === item.targetSlide;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateToSlide(item.targetSlide)}
                  data-cursor-tone="light"
                  className={`text-xs font-sans tracking-wide transition-all duration-300 relative py-1 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Center Logo: TRẦN ANH ĐỨC */}
          <button
            onClick={() => onNavigateToSlide(0)}
            data-cursor-tone="accent"
            className="group my-0 mx-auto flex cursor-pointer flex-col items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B860] focus-visible:ring-offset-4 focus-visible:ring-offset-black/80 xl:mx-0"
          >
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-white/90 group-hover:scale-110 transition-transform" />
              <span className="font-instrument text-xl sm:text-2xl font-bold tracking-wider text-white group-hover:opacity-90 transition-opacity">
                TRẦN ANH ĐỨC
              </span>
            </div>
            <span className="font-mono-tech text-[9px] text-white/60 tracking-[0.2em] uppercase font-medium">
              EDITOR • FILMMAKER
            </span>
          </button>

          {/* Right Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-6">
            {rightNav.map((item) => {
              const isActive = currentSlide === item.targetSlide;
              const isContactCta = item.targetSlide === 8;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateToSlide(item.targetSlide)}
                  data-cursor-tone={isContactCta ? 'accent' : 'light'}
                  className={
                    isContactCta
                      ? `liquid-glass rounded-full px-5 py-1.5 text-xs font-medium text-white transition-all flex items-center gap-2 cursor-pointer ${
                          isActive ? 'ring-1 ring-white/40' : 'hover:opacity-90'
                        }`
                      : `text-xs font-sans tracking-wide transition-all duration-300 relative py-1 flex items-center gap-2 cursor-pointer ${
                          isActive
                            ? 'text-white font-semibold'
                            : 'text-white/70 hover:text-white'
                        }`
                  }
                >
                  {!isContactCta && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                  <span>{item.label}</span>
                  {isContactCta && <Send className="w-3 h-3 text-white/80" />}
                </button>
              );
            })}
          </div>

          {/* Mobile Toggle */}
          <button
            ref={mobileToggleRef}
            type="button"
            onClick={() => setDrawerOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls={drawerId}
            aria-haspopup="dialog"
            data-cursor-tone="accent"
            className="xl:hidden p-2 text-white/90 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          ref={drawerRef}
          id={drawerId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawerTitleId}
          tabIndex={-1}
          className="fixed inset-0 z-40 xl:hidden pt-24 pb-8 px-8 bg-black/95 text-white flex flex-col justify-between backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-4 overflow-y-auto">
            <p
              id={drawerTitleId}
              className="font-mono-tech text-xs text-white/50 uppercase tracking-widest mb-2 border-b border-white/10 pb-2"
            >
              DANH MỤC TRUY CẬP
            </p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setDrawerOpen(false);
                  window.setTimeout(() => onNavigateToSlide(item.targetSlide), 0);
                }}
                data-cursor-tone={item.targetSlide === 8 ? 'accent' : 'light'}
                className={`text-left font-instrument text-2xl tracking-wide transition-colors py-1 flex items-center justify-between ${
                  currentSlide === item.targetSlide
                    ? 'text-white font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {currentSlide === item.targetSlide && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10">
            <span className="font-mono-tech text-xs text-white/80 block">
              SĐT: 0964221467
            </span>
            <span className="font-mono-tech text-xs text-white/50 block mt-1">
              ductran.artist2306@gmail.com
            </span>
          </div>
        </div>
      )}
    </>
  );
};
