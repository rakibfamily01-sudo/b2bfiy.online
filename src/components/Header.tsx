import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Menu, X, MessageSquareCode, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const { currentPath, navigateTo, data } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const settings = data?.settings;
  const navItems = data?.navigation_items || [];

  const handleNavClick = (url: string) => {
    navigateTo(url);
    setMobileOpen(false);
  };

  // Safe checks for logo
  const logoText = settings?.name || 'B2bfiy';

  return (
    <header className={`${settings?.enableStickyHeader ? 'sticky top-0' : ''} z-40 bg-brand-pure-white bg-opacity-95 backdrop-blur-md border-b border-brand-border shadow-sm transition-all`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
        {/* LOGO */}
        <div 
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Render image/icon if display is 'logo' or 'both' or undefined */}
          {(settings?.logoDisplayType === 'logo' || settings?.logoDisplayType === 'both' || !settings?.logoDisplayType) && (
            settings?.logo ? (
              <img 
                src={settings.logo} 
                alt={settings?.logoText || settings?.name || 'Logo'} 
                className="h-10 w-auto max-w-[120px] object-contain transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-brand-primary flex justify-center items-center font-extrabold text-brand-pure-white text-xl shadow-md group-hover:bg-brand-coral transition-colors">
                {(settings?.logoText || settings?.name || 'B')[0].toUpperCase()}
              </div>
            )
          )}

          {/* Render text if display is 'text' or 'both' or undefined */}
          {(settings?.logoDisplayType === 'text' || settings?.logoDisplayType === 'both' || !settings?.logoDisplayType) && (
            <span className="font-extrabold text-2xl tracking-tight text-brand-dark group-hover:text-brand-primary transition-colors">
              {settings?.logoText !== undefined ? settings.logoText : (settings?.name || 'B2bfiy')}
            </span>
          )}
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = currentPath === item.url || (item.url !== '/' && currentPath.startsWith(item.url));
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.url)}
                className={`text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'text-brand-primary underline underline-offset-8 decoration-2' 
                    : 'text-brand-secondary hover:text-brand-primary'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* CTAS (DESKTOP) */}
        <div className="hidden lg:flex items-center gap-4">
          {settings?.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20B2bfiy%20team%2C%20I%20would%20like%20to%20inquire%20about%20your%20services%21`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 hover:scale-105 transition-all shadow-sm flex items-center justify-center border border-green-200"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-5 h-5 fill-green-600 text-brand-pure-white" />
            </a>
          )}
          <button
            onClick={() => handleNavClick('/free-audit')}
            className="px-5 py-2.5 bg-brand-primary text-brand-pure-white text-sm font-bold rounded-full shadow-md hover:bg-brand-coral hover:-translate-y-0.5 hover:shadow-soft-hover transition-all cursor-pointer"
          >
            Get a Free Audit
          </button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex lg:hidden items-center gap-3">
          {settings?.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-green-50 text-green-600 rounded-full border border-green-200"
            >
              <MessageCircle className="w-5 h-5 fill-green-600 text-brand-pure-white" />
            </a>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-brand-dark hover:text-brand-primary hover:bg-brand-soft-red rounded-lg transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-brand-border bg-brand-pure-white shadow-lg overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = currentPath === item.url;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.url)}
                    className={`text-left py-2 px-4 rounded-xl text-base font-bold transition-all ${
                      isActive 
                        ? 'bg-brand-soft-red text-brand-primary' 
                        : 'text-brand-secondary hover:text-brand-primary hover:bg-brand-warm-bg'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <div className="h-px bg-brand-border my-2"></div>
              <button
                onClick={() => handleNavClick('/free-audit')}
                className="w-full py-3 bg-brand-primary text-brand-pure-white text-center font-bold rounded-xl shadow-md hover:bg-brand-coral transition-colors"
              >
                Get a Free Audit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
