import { useEffect, useState, useRef, ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { CheckCircle2, Users, Award, Smile } from 'lucide-react';
import { SiteSettings } from '../types';

interface StatItemProps {
  key?: number | string;
  value: number;
  suffix: string;
  label: string;
  icon: ReactNode;
  delay: number;
}

function StatCounter({ value, suffix, label, icon, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    if (start === end) return;

    // Set duration based on target value
    const totalDuration = 2000; // 2 seconds
    const incrementTime = Math.max(Math.floor(totalDuration / end), 10);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalDuration / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group p-8 rounded-3xl bg-[#090a10]/60 border border-white/5 hover:border-indigo-500/30 backdrop-blur-xl transition-all duration-300 overflow-hidden flex flex-col items-center justify-center text-center"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Circular Icon Container */}
      <div className="relative mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 group-hover:border-indigo-500/40 transition-all duration-300">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative z-10">{icon}</span>
      </div>

      {/* Number Display */}
      <div className="text-4xl sm:text-5xl font-extrabold font-display text-white mb-2 flex items-baseline gap-0.5 tracking-tight">
        <span>{count}</span>
        <span className="text-indigo-400 font-bold">{suffix}</span>
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors tracking-wide">
        {label}
      </p>
    </motion.div>
  );
}

export default function Stats({ settings }: { settings?: SiteSettings }) {
  const statsData = [
    {
      value: settings?.stat_projects_value !== undefined ? Number(settings.stat_projects_value) : 250,
      suffix: "+",
      label: settings?.stat_projects_label || "Projects Completed",
      icon: <CheckCircle2 className="w-7 h-7" />,
      delay: 0.1,
    },
    {
      value: settings?.stat_clients_value !== undefined ? Number(settings.stat_clients_value) : 65,
      suffix: "+",
      label: settings?.stat_clients_label || "Happy Clients",
      icon: <Users className="w-7 h-7" />,
      delay: 0.2,
    },
    {
      value: settings?.stat_experience_value !== undefined ? Number(settings.stat_experience_value) : 8,
      suffix: "+",
      label: settings?.stat_experience_label || "Years Experience",
      icon: <Award className="w-7 h-7" />,
      delay: 0.3,
    },
    {
      value: settings?.stat_success_value !== undefined ? Number(settings.stat_success_value) : 100,
      suffix: "%",
      label: settings?.stat_success_label || "Success Rate",
      icon: <Smile className="w-7 h-7" />,
      delay: 0.4,
    },
  ];

  return (
    <section className="relative py-20 bg-[#030408] overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {statsData.map((stat, index) => (
            <StatCounter
              key={index}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              icon={stat.icon}
              delay={stat.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
