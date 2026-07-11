import { ClientLogo } from '../types';

interface ClientLogosProps {
  logos: ClientLogo[];
}

export default function ClientLogos({ logos }: ClientLogosProps) {
  if (logos.length === 0) return null;

  // Duplicate items several times to ensure continuous marquee effect
  const marqueeItems = [...logos, ...logos, ...logos, ...logos, ...logos];

  return (
    <section className="py-16 bg-[#030408] border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#030408] via-transparent to-[#030408] z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-xs font-mono font-bold tracking-widest text-gray-500 uppercase">
          TRUSTED BY BRANDS ACROSS THE GLOBE
        </p>
      </div>

      {/* Scrolling Marquee Container */}
      <div className="flex overflow-hidden relative w-full py-4">
        <div className="animate-marquee flex gap-12 sm:gap-20 items-center justify-start flex-nowrap">
          {marqueeItems.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="flex-shrink-0 w-32 sm:w-40 h-16 sm:h-20 flex items-center justify-center transition-all duration-300"
            >
              <img
                src={logo.logo_url}
                alt={logo.company_name || 'Partner Logo'}
                className="max-w-full max-h-full object-contain filter grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer scale-95 hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
