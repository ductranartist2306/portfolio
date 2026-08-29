import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Send, Film } from 'lucide-react';
import { NavigationItem } from '../types/portfolio';

interface HeaderProps {
  navItems: NavigationItem[];
  currentSlide: number;
  onNavigateToSlide: (index: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  navItems,
  currentSlide,
  onNavigateToSlide,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const leftNav = navItems.slice(0, 4);
  const rightNav = navItems.slice(4);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 w-full pointer-events-none"
      >
        <div className="liquid-glass rounded-full px-5 sm:px-8 py-3 flex items-center justify-between max-w-6xl mx-auto pointer-events-auto backdrop-blur-md">
          {/* Left Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-6">
            {leftNav.map((item) => {
              const isActive = currentSlide === item.targetSlide;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateToSlide(item.targetSlide)}
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
            className="group flex flex-col items-center focus:outline-none cursor-pointer my-0 mx-auto xl:mx-0"
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
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateToSlide(item.targetSlide)}
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

            {/* Contact Glass Button */}
            <button
              onClick={() => onNavigateToSlide(8)}
              className="liquid-glass rounded-full px-5 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>LIÊN HỆ</span>
              <Send className="w-3 h-3 text-white/80" />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-white/90 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden pt-24 pb-8 px-8 bg-black/95 text-white flex flex-col justify-between backdrop-blur-2xl">
          <div className="flex flex-col gap-4 overflow-y-auto">
            <p className="font-mono-tech text-xs text-white/50 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">
              DANH MỤC TRUY CẬP
            </p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigateToSlide(item.targetSlide);
                  setMobileMenuOpen(false);
                }}
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
