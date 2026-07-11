import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { VideoCategory, VideoPortfolio as VideoItem } from '../types';

interface VideoPortfolioProps {
  categories: VideoCategory[];
  videos: VideoItem[];
}

export default function VideoPortfolio({ categories, videos }: VideoPortfolioProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Fallback category selection if categories update
  const currentCategory = categories.find(c => c.id === activeCategory) || categories[0];
  const selectedCategoryId = currentCategory?.id || '';

  const filteredVideos = videos.filter(
    (v) => v.category_id === selectedCategoryId
  );

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;

    // YouTube watch URLs
    const youtubeReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = url.match(youtubeReg);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1`;
    }

    // Vimeo support
    const vimeoReg = /vimeo\.com\/([0-9]+)/;
    const vimMatch = url.match(vimeoReg);
    if (vimMatch) {
      return `https://player.vimeo.com/video/${vimMatch[1]}?autoplay=1`;
    }

    return url;
  };

  return (
    <section id="video-portfolio" className="relative py-24 bg-[#030408] overflow-hidden">
      {/* Visual neon background decors */}
      <div className="absolute top-10 left-10 w-[250px] h-[250px] bg-pink-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-pink-400 text-xs font-bold tracking-widest uppercase font-mono mb-3"
          >
            PORTFOLIO - VIDEO EDITING
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-6"
          >
            Our Video Editing Works
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-gradient-to-r from-pink-500 to-indigo-500 mx-auto rounded-full mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base leading-relaxed"
          >
            With cinematic transitions, sound effects, dramatic color grading, and high-energy hooks, we have created extraordinary videos for various brands and creators.
          </motion.p>
        </div>

        {/* Category Tabs/Pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                  selectedCategoryId === category.id
                    ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Videos Display Grid/Carousel */}
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategoryId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredVideos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setActiveVideo(video)}
                  className="group relative rounded-2xl overflow-hidden glass-card border border-white/5 hover:border-pink-500/20 cursor-pointer shadow-xl flex flex-col justify-between"
                >
                  {/* Thumbnail and play button overlay */}
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title || 'Video Portfolio Thumbnail'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-pink-500 text-white flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-pink-500/35">
                        <Play className="w-6 h-6 fill-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Info block */}
                  <div className="p-6 bg-[#0a0b12] border-t border-white/5">
                    <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-1">
                      {video.title || 'Cinematic Video Project'}
                    </h3>
                    <p className="text-gray-500 text-xs font-mono mt-1">
                      Category: {currentCategory?.name}
                    </p>
                  </div>
                </motion.div>
              ))}

              {filteredVideos.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center text-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                  <Video className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-400 font-medium">No video portfolio found in this category.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Video Player Overlay Modal */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />

            {/* Video Iframe Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl z-10"
            >
              {/* Close Button overlay */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white transition-all duration-200 cursor-pointer"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>

              <iframe
                src={getEmbedUrl(activeVideo.video_url)}
                title={activeVideo.title || 'Video Player'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
