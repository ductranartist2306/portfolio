import React, { useState } from 'react';
import { Mail, Phone, MapPin, Copy, Check, ExternalLink, Send, Instagram, Facebook, Globe, MessageSquare } from 'lucide-react';

interface S9ContactProps {
  data: any;
  brand: any;
}

export const S9Contact: React.FC<S9ContactProps> = ({ data, brand }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const details = data.contactDetails;

  return (
    <div className="relative w-full h-full min-h-screen pt-28 pb-12 px-6 lg:px-16 bg-[#0A0E14] text-white flex flex-col justify-between overflow-y-auto">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden pointer-events-none">
        <video
          src={data.media.path}
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            (e.target as HTMLVideoElement).src = data.media.fallbackVideoUrl;
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0A0E14]/80" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full my-auto space-y-10">
        {/* Giant Header CTA */}
        <div className="text-center space-y-4">
          <span className="font-mono-tech text-xs text-[#00D9FF] uppercase tracking-[0.3em] font-semibold">
            {data.index} // {data.subtitle}
          </span>

          <h2 className="font-title text-4xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-white leading-none">
            LET'S WORK <span className="text-[#00D9FF]">TOGETHER</span>
          </h2>

          <p className="font-title text-base sm:text-xl text-[#FF9F1C] uppercase tracking-widest font-medium">
            {details.name} — {details.role}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phone Card */}
          <div className="p-6 rounded-2xl bg-[#141B24] border border-[#00D9FF]/20 hover:border-[#00D9FF] transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <button
                onClick={() => handleCopy(details.phone, 'phone')}
                className="p-2 rounded-lg bg-[#0A0E14] text-[#B8C2CC] hover:text-[#00D9FF] transition-colors"
                title="Sao chép SĐT"
              >
                {copiedField === 'phone' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <span className="font-mono-tech text-xs text-[#B8C2CC] block uppercase">HOTLINE / ZALO</span>
              <a
                href={`tel:${details.phone}`}
                className="font-title text-xl font-bold text-white hover:text-[#00D9FF] transition-colors block mt-1"
              >
                {details.phone}
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="p-6 rounded-2xl bg-[#141B24] border border-[#00D9FF]/20 hover:border-[#00D9FF] transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <button
                onClick={() => handleCopy(details.email, 'email')}
                className="p-2 rounded-lg bg-[#0A0E14] text-[#B8C2CC] hover:text-[#00D9FF] transition-colors"
                title="Sao chép Email"
              >
                {copiedField === 'email' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <span className="font-mono-tech text-xs text-[#B8C2CC] block uppercase">GMAIL TƯ VẤN</span>
              <a
                href={`mailto:${details.email}`}
                className="font-title text-base sm:text-lg font-bold text-white hover:text-[#00D9FF] transition-colors block mt-1 truncate"
              >
                {details.email}
              </a>
            </div>
          </div>

          {/* Address Card */}
          <div className="p-6 rounded-2xl bg-[#141B24] border border-[#00D9FF]/20 hover:border-[#00D9FF] transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>

            <div>
              <span className="font-mono-tech text-xs text-[#B8C2CC] block uppercase">ĐỊA CHỈ THƯỜNG TRÚ</span>
              <p className="font-title text-sm font-semibold text-white mt-1">
                {details.address}
              </p>
            </div>
          </div>
        </div>

        {/* Social Links Row */}
        <div className="p-6 rounded-2xl bg-[#141B24] border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono-tech text-xs text-[#00D9FF] uppercase tracking-wider">
            MẠNG XÃ HỘI & KENH MEDIA
          </span>

          <div className="flex flex-wrap items-center gap-4">
            {details.socials.map((s: any, idx: number) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0E14] text-xs font-mono-tech text-[#B8C2CC] hover:text-[#00D9FF] hover:border-[#00D9FF] border border-white/5 transition-all"
              >
                <span>{s.platform}: {s.handle}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="relative z-10 pt-8 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-tech text-[11px] text-[#6B7480]">
        <span>© 2026 TRAN ANH DUC / DO VAN TUNG. ALL RIGHTS RESERVED.</span>
        <span>DESIGN CONCEPT: FINANCE LOGIC + MAGAZINE AESTHETICS</span>
      </div>
    </div>
  );
};
