import { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../types';

interface FloatingButtonsProps {
  settings: SiteSettings;
}

export default function FloatingButtons({ settings }: FloatingButtonsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappMessage = encodeURIComponent("Hi, I want to inquire about B2Ofiy Institute's digital services.");
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4 items-center">
      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={handleBackToTop}
          className="p-3.5 rounded-full bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-white/10 text-white transition-all duration-300 shadow-xl cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* WhatsApp Floating Pulse Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-xl animate-whatsapp hover:scale-110 transition-transform cursor-pointer"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white text-[#25d366]" />
      </a>
    </div>
  );
}
