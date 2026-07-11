import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { Service, ServiceDetail } from '../types';

interface ServicesProps {
  services: Service[];
  details: ServiceDetail[];
}

export default function Services({ services, details }: ServicesProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const getIcon = (iconName: string, className = 'w-8 h-8') => {
    const IconComponent = (Lucide as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <Lucide.Palette className={className} />;
  };

  return (
    <section id="services" className="relative py-24 bg-[#05060b] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-indigo-400 text-xs font-bold tracking-widest uppercase font-mono mb-3"
          >
            OUR EXPERTISE
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-6"
          >
            Our Premium Services
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base leading-relaxed"
          >
            We provide highly skilled and international-standard services to boost your business growth. Each service includes specialized sub-tasks that will elevate your business.
          </motion.p>
        </div>

        {/* Services Grid with scroll-triggered stagger reveal animation */}
        <motion.div 
          variants={{
            hidden: { opacity: 1 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.12,
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={{
                hidden: { opacity: 0, y: 45 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 70,
                    damping: 14,
                    duration: 0.7,
                  }
                }
              }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={() => setSelectedService(service)}
              className="group relative h-full flex flex-col justify-between p-8 rounded-2xl glass-card hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer overflow-hidden shadow-xl"
            >
              {/* Cover image underlay with subtle hover scale */}
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
                <img
                  src={service.cover_image_url}
                  alt={service.title}
                  className="w-full h-full object-cover grayscale"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[#05060b] mix-blend-multiply" />
              </div>

              {/* Dynamic light glow effect */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-md">
                  {getIcon(service.icon)}
                </div>

                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">
                  {service.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-sans">
                  {service.short_description}
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider group-hover:text-indigo-300">
                View Details
                <Lucide.ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modal - Service sub-tasks detailed view */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Cover Image Header */}
              <div className="relative h-48 sm:h-56 w-full flex-shrink-0">
                <img
                  src={selectedService.cover_image_url}
                  alt={selectedService.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b12] via-[#0a0b12]/60 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 text-white transition-all duration-200 cursor-pointer"
                >
                  <Lucide.X className="w-5 h-5" />
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                    {getIcon(selectedService.icon, 'w-6 h-6')}
                  </div>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                      {selectedService.title}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Sub-tasks lists (Scrollable body) */}
              <div className="p-6 sm:p-8 overflow-y-auto bg-[#0a0b12] flex-grow">
                <p className="text-gray-300 text-sm leading-relaxed mb-6 border-b border-white/5 pb-4">
                  {selectedService.short_description}
                </p>

                <h5 className="text-xs font-mono font-bold text-indigo-400 tracking-wider uppercase mb-4">
                  Our Specialized Sub-tasks:
                </h5>

                <div className="space-y-4">
                  {details
                    .filter((sd) => sd.service_id === selectedService.id)
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((detail, idx) => (
                      <motion.div
                        key={detail.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <Lucide.Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div>
                          <h6 className="text-base font-semibold text-white">
                            {detail.title}
                          </h6>
                          {detail.description && (
                            <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                              {detail.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}

                  {details.filter((sd) => sd.service_id === selectedService.id).length === 0 && (
                    <p className="text-gray-500 text-sm italic py-4">
                      No sub-tasks have been added for this service yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-4 sm:p-6 bg-[#08090f] border-t border-white/5 flex-shrink-0 flex items-center justify-end">
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-white/10 hover:border-white/20 bg-white/5 text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
