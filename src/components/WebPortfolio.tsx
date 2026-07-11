import { motion } from 'motion/react';
import { ExternalLink, Code } from 'lucide-react';
import { WebPortfolio as WebItem } from '../types';

interface WebPortfolioProps {
  webItems: WebItem[];
}

export default function WebPortfolio({ webItems }: WebPortfolioProps) {
  if (webItems.length === 0) return null;

  return (
    <section id="web-portfolio" className="relative py-24 bg-[#030408] overflow-hidden">
      {/* Dynamic graphic glow decors */}
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[250px] h-[250px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase font-mono mb-3">
            PORTFOLIO - WEB DEVELOPMENT
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-6">
            Our Outstanding Web Projects
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 mx-auto rounded-full mb-6" />
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            We build fast, fully responsive, and modern websites that deliver an outstanding user experience.
          </p>
        </div>

        {/* Web Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {webItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -10,
                boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.2)',
              }}
              className="group relative rounded-2xl overflow-hidden glass-card border border-white/5 hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-full bg-[#0d0f19]/40"
            >
              {/* Screenshot Display Frame */}
              <div className="relative aspect-video w-full overflow-hidden bg-black border-b border-white/5">
                <img
                  src={item.image_url}
                  alt={item.title || 'Web Project Screenshot'}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Glass Blur Backdrop on Hover */}
                <div className="absolute inset-0 bg-[#030408]/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
                  <a
                    href={item.demo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-full bg-indigo-500 text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-indigo-500/40"
                  >
                    <ExternalLink className="w-6 h-6" />
                  </a>
                </div>
              </div>

              {/* Info Frame & Details */}
              <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 mb-3">
                    <Code className="w-3.5 h-3.5" />
                    <span>PRODUCTION READY</span>
                  </div>
                  
                  <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                    {item.title || 'Modern Web App'}
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-sans">
                    We ensured modern responsive layouts, fast load times, and an immersive user experience for this platform.
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <a
                    href={item.demo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 group-hover:text-white group/btn transition-colors"
                  >
                    View Demo
                    <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
