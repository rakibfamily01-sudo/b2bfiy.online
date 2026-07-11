import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sun, Moon, ChevronDown, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteSettings } from '../types';
import Logo from './Logo';

interface HeaderProps {
  settings: SiteSettings;
  onNavigateToAdmin: () => void;
  theme: string;
  onToggleTheme: () => void;
}

export default function Header({ settings, onNavigateToAdmin, theme, onToggleTheme }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappMessage = encodeURIComponent("Hi, I want to hire B2Ofiy Institute for a project!");
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    {
      label: 'Portfolio',
      href: '#portfolio',
      subItems: [
        { label: 'Video Editing', href: '#video-portfolio' },
        { label: 'Graphics Design', href: '#graphics' },
        { label: 'Web Development', href: '#web-portfolio' }
      ]
    },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#06070c]/90 border-b border-white/5 backdrop-blur-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-3 group">
          <Logo settings={settings} className="h-9 sm:h-10 transition-transform group-hover:scale-105" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            if (item.subItems) {
              return (
                <div key={item.label} className="relative group py-2">
                  <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer">
                    {item.label}
                    <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-xl bg-[#0b0c15] border border-white/5 p-2 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                    <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#0b0c15] border-t border-l border-white/5 rotate-45" />
                    <div className="relative z-10 flex flex-col gap-0.5">
                      {item.subItems.map((sub) => (
                        <a
                          key={sub.href}
                          href={sub.href}
                          className="px-4 py-2.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-indigo-500 hover:after:w-full after:transition-all after:duration-300"
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Call To Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <motion.button
            onClick={onToggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title={theme === 'midnight' ? "Switch to Clean Light" : "Switch to Midnight"}
            aria-label="Toggle theme"
          >
            {theme === 'midnight' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </motion.button>
          <motion.button
            onClick={onNavigateToAdmin}
            whileHover={{ scale: 1.1, y: -1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Admin Console"
            aria-label="Admin Console"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
          </motion.button>
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 4px 6px -1px rgba(163, 29, 29, 0.1), 0 2px 4px -1px rgba(163, 29, 29, 0.06)",
                "0 4px 20px 4px rgba(163, 29, 29, 0.5)",
                "0 4px 6px -1px rgba(163, 29, 29, 0.1), 0 2px 4px -1px rgba(163, 29, 29, 0.06)"
              ]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white transition-all flex items-center gap-2 group shadow-lg cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Hire Us
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.a>
        </div>

        {/* Mobile Hamburguer Menu */}
        <div className="flex lg:hidden items-center gap-3">
          <motion.button
            onClick={onToggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title={theme === 'midnight' ? "Switch to Clean Light" : "Switch to Midnight"}
            aria-label="Toggle theme"
          >
            {theme === 'midnight' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </motion.button>
          <motion.button
            onClick={onNavigateToAdmin}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            title="Admin Console"
            aria-label="Admin Console"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
          </motion.button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 top-[72px] bg-[#06070c]/98 backdrop-blur-xl z-40 transition-all duration-500 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-autoTranslate' : 'opacity-0 pointer-events-none translate-y-4'
        }`}
        style={{
          transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-20px)',
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
        }}
      >
        <div className="flex flex-col h-[calc(100vh-72px)] justify-between p-8 overflow-y-auto">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              if (item.subItems) {
                return (
                  <div key={item.label} className="flex flex-col py-2 border-b border-white/5">
                    <span className="text-sm font-mono font-bold text-gray-500 uppercase tracking-wider mb-3">
                      {item.label}
                    </span>
                    <div className="flex flex-col gap-3 pl-4 border-l border-indigo-500/20">
                      {item.subItems.map((sub) => (
                        <a
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xl font-display font-medium text-gray-300 hover:text-indigo-400 transition-colors py-1"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-medium text-gray-300 hover:text-indigo-400 transition-colors py-2 border-b border-white/5 text-left"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 mt-8">
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              animate={{
                scale: [1, 1.02, 1],
                boxShadow: [
                  "0 4px 6px -1px rgba(163, 29, 29, 0.1)",
                  "0 4px 15px 2px rgba(163, 29, 29, 0.4)",
                  "0 4px 6px -1px rgba(163, 29, 29, 0.1)"
                ]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl text-center font-semibold bg-gradient-to-r from-red-600 via-orange-600 to-[#a31d1d] text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Hire Us
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </header>
  );
}
