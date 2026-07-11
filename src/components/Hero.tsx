import { motion } from 'motion/react';
import { Palette, Video, Code, TrendingUp, ChevronDown } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
}

export default function Hero({ settings }: HeroProps) {
  const whatsappMessage = encodeURIComponent("Hi, I want to hire B2Ofiy Institute for a project!");
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  // Split title to animate word by word
  const words = settings.hero_title.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030408] bg-grid-pattern pt-24"
    >
      {/* Background Animated Neon Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] md:w-[550px] h-[350px] md:h-[550px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Background Floating Particles (Aesthetics of Digital Agency) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
        <motion.div
          animate={{
            y: [0, -25, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[20%] left-[10%] text-indigo-500/20 p-4 border border-indigo-500/5 bg-indigo-950/5 rounded-2xl backdrop-blur-3xl"
        >
          <Code className="w-10 h-10" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-[25%] left-[15%] text-purple-500/20 p-4 border border-purple-500/5 bg-purple-950/5 rounded-2xl backdrop-blur-3xl"
        >
          <Palette className="w-8 h-8" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -35, 0],
            rotate: [0, 25, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
          className="absolute top-[30%] right-[10%] text-pink-500/20 p-4 border border-pink-500/5 bg-pink-950/5 rounded-2xl backdrop-blur-3xl"
        >
          <Video className="w-9 h-9" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute bottom-[20%] right-[15%] text-cyan-500/20 p-4 border border-cyan-500/5 bg-cyan-950/5 rounded-2xl backdrop-blur-3xl"
        >
          <TrendingUp className="w-8 h-8" />
        </motion.div>
      </div>

      {/* Main Hero Content */}
      <div className="relative max-w-5xl mx-auto px-6 text-center z-10 flex flex-col items-center">
        {/* Subtle Pill Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-sm"
        >
          ✨ Premium Creative Digital Agency
        </motion.div>

        {/* Cinematic Headline - Animate word by word */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-tight sm:leading-none text-white max-w-4xl"
        >
          {words.map((word, index) => (
            <motion.span
              key={index}
              variants={wordVariants}
              className="inline-block mr-2 md:mr-4 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed font-sans"
        >
          {settings.hero_subtitle}
        </motion.p>

        {/* Call To Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row gap-5 items-center justify-center w-full sm:w-auto"
        >
          <motion.a
            href="#services"
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/95 transition-all flex items-center justify-center gap-2 font-display cursor-pointer"
          >
            {settings.hero_cta_text}
          </motion.a>
          <motion.a
            href="#video-portfolio"
            animate={{
              scale: [1, 1.04, 1],
              boxShadow: [
                "0 0 0 0 rgba(163, 29, 29, 0)",
                "0 0 20px 4px rgba(163, 29, 29, 0.5)",
                "0 0 0 0 rgba(163, 29, 29, 0)"
              ]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.08, y: -2, border: "1px solid rgba(255, 255, 255, 0.3)", bg: "rgba(255, 255, 255, 0.15)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold border border-[#a31d1d]/40 bg-gradient-to-r from-[#a31d1d]/25 to-transparent text-white transition-all flex items-center justify-center gap-2 font-display cursor-pointer"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            Our Portfolio
          </motion.a>
        </motion.div>

        {/* Animated Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer pointer-events-none"
        >
          <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Scroll Down</span>
          <ChevronDown className="w-4 h-4 text-gray-500 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
