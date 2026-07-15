import React from 'react';
import { useApp } from './AppContext';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const { navigateTo, data } = useApp();
  const settings = data?.settings;
  const navItems = data?.navigation_items || [];
  const services = data?.services || [];

  const handleNavClick = (url: string) => {
    navigateTo(url);
  };

  return (
    <footer className="bg-brand-dark text-brand-pure-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Column 1: Brand intro */}
        <div className="flex flex-col gap-4">
          <div 
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 cursor-pointer group w-fit"
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
                <div className="w-10 h-10 rounded-xl bg-brand-primary flex justify-center items-center font-extrabold text-brand-pure-white text-xl">
                  {(settings?.logoText || settings?.name || 'B')[0].toUpperCase()}
                </div>
              )
            )}

            {/* Render text if display is 'text' or 'both' or undefined */}
            {(settings?.logoDisplayType === 'text' || settings?.logoDisplayType === 'both' || !settings?.logoDisplayType) && (
              <span className="font-extrabold text-2xl tracking-tight text-brand-pure-white">
                {settings?.logoText !== undefined ? settings.logoText : (settings?.name || 'B2bfiy')}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mt-2">
            B2bfiy helps businesses build a powerful digital presence through high-converting websites, premium graphics, professional video clips, and comprehensive social media scaling.
          </p>
          {/* Socials Grid */}
          <div className="flex items-center gap-3.5 mt-4">
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-brand-primary text-gray-300 hover:text-brand-pure-white rounded-full transition-all hover:-translate-y-1">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-brand-primary text-gray-300 hover:text-brand-pure-white rounded-full transition-all hover:-translate-y-1">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {settings?.linkedin && (
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-brand-primary text-gray-300 hover:text-brand-pure-white rounded-full transition-all hover:-translate-y-1">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {settings?.youtube && (
              <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-brand-primary text-gray-300 hover:text-brand-pure-white rounded-full transition-all hover:-translate-y-1">
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Column 2: Quick links */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-coral mb-6">Quick Links</h4>
          <ul className="flex flex-col gap-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.url)}
                  className="text-gray-400 hover:text-brand-pure-white text-sm transition-colors flex items-center gap-1 group cursor-pointer text-left"
                >
                  <span className="w-1 h-1 rounded-full bg-brand-coral opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Services */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-coral mb-6">Our Services</h4>
          <ul className="flex flex-col gap-3">
            {services.slice(0, 4).map((srv) => (
              <li key={srv.id}>
                <button
                  onClick={() => handleNavClick('/services')}
                  className="text-gray-400 hover:text-brand-pure-white text-sm transition-colors text-left flex items-center gap-1 group cursor-pointer"
                >
                  <span className="w-1 h-1 rounded-full bg-brand-coral opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {srv.title}
                </button>
              </li>
            ))}
            {services.length === 0 && (
              <>
                <li><button onClick={() => handleNavClick('/services')} className="text-gray-400 hover:text-brand-pure-white text-sm">Website Development</button></li>
                <li><button onClick={() => handleNavClick('/services')} className="text-gray-400 hover:text-brand-pure-white text-sm">Graphic Design</button></li>
                <li><button onClick={() => handleNavClick('/services')} className="text-gray-400 hover:text-brand-pure-white text-sm">Video Editing</button></li>
                <li><button onClick={() => handleNavClick('/services')} className="text-gray-400 hover:text-brand-pure-white text-sm">Social Media Management</button></li>
              </>
            )}
          </ul>
        </div>

        {/* Column 4: Contact info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-coral mb-6">Contact Us</h4>
          <ul className="flex flex-col gap-3.5 text-sm text-gray-400">
            {settings?.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
            )}
            {settings?.phone && (
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-brand-pure-white transition-colors">{settings.phone}</a>
              </li>
            )}
            {settings?.email && (
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-brand-pure-white transition-colors">{settings.email}</a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="h-px bg-gray-800 max-w-7xl mx-auto my-8 px-4 md:px-8"></div>

      {/* Copy & Legal Links */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} B2bfiy. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <button onClick={() => handleNavClick('/privacy-policy')} className="hover:text-brand-pure-white transition-colors cursor-pointer">Privacy Policy</button>
          <button onClick={() => handleNavClick('/terms')} className="hover:text-brand-pure-white transition-colors cursor-pointer">Terms & Conditions</button>
        </div>
      </div>
    </footer>
  );
}
