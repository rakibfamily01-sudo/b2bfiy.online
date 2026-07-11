import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Review } from '../types';

interface ReviewsProps {
  reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  const currentReview = reviews[activeIndex];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`w-5 h-5 ${
          idx < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <section id="reviews" className="relative py-24 bg-[#05060b] overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase font-mono mb-3">
            TESTIMONIALS
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-6">
            What Our Clients Say
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
        </div>

        {/* Big Cinematic Testimonial Block */}
        <div className="relative p-8 sm:p-12 md:p-16 rounded-3xl glass-card border border-white/5 shadow-2xl bg-[#0d0f19]/30">
          <Quote className="absolute top-6 left-6 sm:top-10 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 text-indigo-500/5 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentReview.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="relative flex flex-col items-center text-center space-y-6"
            >
              {/* Client Avatar with glowing border */}
              {currentReview.client_photo_url && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-50 scale-105" />
                  <img
                    src={currentReview.client_photo_url}
                    alt={currentReview.client_name}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/10"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Star Rating Display */}
              <div className="flex gap-1 items-center justify-center">
                {renderStars(currentReview.rating)}
              </div>

              {/* Review Text block */}
              <blockquote className="text-lg sm:text-xl md:text-2xl text-gray-200 font-sans italic leading-relaxed max-w-2xl">
                " {currentReview.review_text} "
              </blockquote>

              {/* Reviewer Meta Details */}
              <div className="pt-4">
                <cite className="not-italic text-lg font-bold text-white block">
                  {currentReview.client_name}
                </cite>
                <span className="text-xs font-mono font-medium text-indigo-400 block mt-1 uppercase tracking-wider">
                  {currentReview.designation}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left/Right manual sliders arrows */}
          {reviews.length > 1 && (
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/5">
              <button
                onClick={handlePrev}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer shadow-md"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Pagination indicators Dots */}
              <div className="flex items-center gap-2">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activeIndex === idx ? 'bg-indigo-500 w-5' : 'bg-white/20 hover:bg-white/35'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer shadow-md"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
