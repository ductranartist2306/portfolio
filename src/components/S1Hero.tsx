import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight, Sparkles, Send, Check } from 'lucide-react';

interface S1HeroProps {
  data: any;
  onExploreClick: () => void;
}

export const S1Hero: React.FC<S1HeroProps> = ({ data, onExploreClick }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setEmail('');
    }
  };

  return (
    <div
      className="portal-section relative flex h-full min-h-screen w-full flex-col justify-between overflow-x-hidden overflow-y-auto px-6 pb-12 pt-32 text-white lg:px-16"
      data-slide-scroll
    >
      {/* Top Glass Pill Status Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4"
      >
        <div className="glass-pill px-4 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_white]" />
          <span className="font-mono-tech text-xs tracking-wider text-white/90 uppercase">
            {data.tagline || 'SẴN SÀNG NHẬN DỰ ÁN MỚI'}
          </span>
        </div>
        <div className="glass-pill px-4 py-1.5 text-xs text-white/70 tracking-wider uppercase font-mono-tech">
          {data.locationTag || 'HÀ NỘI, VIỆT NAM'}
        </div>
      </motion.div>

      {/* Main Hero Visual Center */}
      <div className="relative z-10 my-auto py-8 flex flex-col justify-center items-start space-y-6 max-w-5xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="glass-pill px-4 py-1.5 text-xs text-white/80 uppercase tracking-widest flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-white/90" />
          <span>{data.index || '01'} — {data.subtitle || 'EDITOR & FILMMAKER'}</span>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-mono-tech text-xs sm:text-sm text-white/60 uppercase tracking-[0.3em]"
        >
          {data.title || 'PORTFOLIO'}
        </motion.p>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="font-instrument text-6xl sm:text-8xl lg:text-9xl font-normal tracking-tight leading-none bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent"
        >
          {data.author || 'TRAN ANH DUC'}
        </motion.h1>

        {/* Email Consultation Form & Portfolio Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 w-full max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex w-full flex-col gap-2 sm:block">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn để nhận báo giá..."
                className="liquid-glass w-full rounded-full border-none px-5 py-3 pr-5 text-xs text-white placeholder-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B860] focus-visible:ring-offset-2 focus-visible:ring-offset-black/70 sm:pr-32"
              />
              <button
                type="submit"
                data-cursor-tone="accent"
                className="liquid-glass static flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-3 text-xs font-medium text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B860] focus-visible:ring-offset-2 focus-visible:ring-offset-black/70 sm:absolute sm:bottom-1 sm:right-1 sm:top-1 sm:py-0"
              >
                {submitted ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>ĐÃ GỬI</span>
                  </>
                ) : (
                  <>
                    <span>NHẬN BÁO GIÁ</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </form>

          <button
            onClick={onExploreClick}
            data-cursor-tone="accent"
            className="liquid-glass flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-medium uppercase text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B860] focus-visible:ring-offset-2 focus-visible:ring-offset-black/70"
          >
            <span>DỰ ÁN NỔI BẬT</span>
            <ArrowDownRight className="w-4 h-4 text-white/80" />
          </button>
        </motion.div>
      </div>

      {/* Bottom Liquid Glass Grid Cards */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4"
      >
        <div className="liquid-glass rounded-2xl p-4">
          <span className="font-mono-tech text-[10px] text-white/50 uppercase tracking-wider block mb-1">CHUYÊN MÔN</span>
          <span className="font-sans text-sm text-white font-medium">Quay Phim & Edit Video</span>
        </div>
        <div className="liquid-glass rounded-2xl p-4">
          <span className="font-mono-tech text-[10px] text-white/50 uppercase tracking-wider block mb-1">KINH NGHIỆM</span>
          <span className="font-sans text-sm text-white font-medium">Hơn 5 Năm Chuyên Nghiệp</span>
        </div>
        <div className="liquid-glass rounded-2xl p-4">
          <span className="font-mono-tech text-[10px] text-white/50 uppercase tracking-wider block mb-1">PHẦN MỀM</span>
          <span className="font-sans text-sm text-white font-medium">Premiere, AE, PTS, CapCut</span>
        </div>
        <div className="liquid-glass rounded-2xl p-4">
          <span className="font-mono-tech text-[10px] text-white/50 uppercase tracking-wider block mb-1">ĐỊA BÀN</span>
          <span className="font-sans text-sm text-white font-medium">Hà Nội / Toàn Quốc</span>
        </div>
      </motion.div>
    </div>
  );
};
