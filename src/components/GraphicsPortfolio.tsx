import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { GraphicsPortfolio as GraphicsItem, GraphicsSettings } from '../types';

interface GraphicsPortfolioProps {
  graphics: GraphicsItem[];
  settings: GraphicsSettings;
}

export default function GraphicsPortfolio({ graphics, settings }: GraphicsPortfolioProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (graphics.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % graphics.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [graphics.length]);

  if (graphics.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + graphics.length) % graphics.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % graphics.length);
  };

  const currentItem = graphics[currentIndex];

  return (
    <section id="graphics" className="relative py-24 bg-[#05060b] overflow-hidden">
      {/* Decorative colored glow grids */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-purple-400 text-xs font-bold tracking-widest uppercase font-mono mb-3">
            PORTFOLIO - GRAPHICS DESIGN
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-6">
            Our Creative Graphic Designs
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full mb-6" />
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            We give brands a fresh and modern visual identity through brand identity, poster artwork, social media design, and promotional content.
          </p>
        </div>

        {/* Master Showcase Slideshow Layout (Cinematic Card style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Slider Image Visual (8cols) */}
          <div className="lg:col-span-8 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] w-full rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentItem.id}
                src={currentItem.image_url}
                alt={currentItem.title || 'Graphics Portfolio Image'}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Dark Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Left/Right Click Navigations */}
            {graphics.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-indigo-600/80 hover:scale-105 border border-white/5 hover:border-indigo-400/20 text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 shadow-md"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-indigo-600/80 hover:scale-105 border border-white/5 hover:border-indigo-400/20 text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 shadow-md"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Pagination dots underlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/35 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
              {graphics.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'bg-indigo-500 w-6' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide Description & CTA (4cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-md">
                  🎨 Featured Design {currentIndex + 1} of {graphics.length}
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-tight">
                  {currentItem.title || 'Creative Design Concept'}
                </h3>

                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  In this design project, we utilized premium visual themes, perfect color balance, and branding structures that captivate users.
                </p>
              </motion.div>
            </AnimatePresence>

            {/* External Gallery Gallery "View All" Button */}
            {settings.view_all_link && (
              <div className="mt-8 border-t border-white/5 pt-8">
                <a
                  href={settings.view_all_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-95 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all group w-full sm:w-auto"
                >
                  View All Graphics Design
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
