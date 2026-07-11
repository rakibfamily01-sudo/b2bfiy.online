import { Facebook, Instagram, Linkedin, Youtube, ArrowUp } from 'lucide-react';
import { SiteSettings } from '../types';
import Logo from './Logo';

interface FooterProps {
  settings: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Video Portfolio', href: '#video-portfolio' },
    { label: 'Graphics Portfolio', href: '#graphics' },
    { label: 'Web Projects', href: '#web-portfolio' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-[#06070c] border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 pb-12 border-b border-white/5">
          
          {/* Logo & Bio (5cols) */}
          <div className="lg:col-span-5 space-y-6">
            <a href="#home" className="inline-block group">
              <Logo settings={settings} className="h-9 sm:h-10 transition-transform group-hover:scale-105" />
            </a>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {settings.footer_text || 'B2Ofiy Institute - Your Trusted Digital Agency Partner.'}
            </p>
            <div className="flex items-center gap-4">
              {settings.social_links.facebook && (
                <a href={settings.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.social_links.instagram && (
                <a href={settings.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.social_links.linkedin && (
                <a href={settings.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {settings.social_links.youtube && (
                <a href={settings.social_links.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links (3cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              QUICK NAVIGATION
            </h4>
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Contacts (4cols) */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              OUR OFFICE
            </h4>
            <div className="space-y-3.5 text-sm text-gray-400">
              {settings.footer_address && <p>{settings.footer_address}</p>}
              {settings.footer_email && (
                <p>
                  Email:{' '}
                  <a href={`mailto:${settings.footer_email}`} className="text-white hover:text-indigo-400 transition-colors">
                    {settings.footer_email}
                  </a>
                </p>
              )}
              {settings.whatsapp_number && (
                <p>
                  WhatsApp:{' '}
                  <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-400 transition-colors">
                    {settings.whatsapp_number}
                  </a>
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Bottom copy row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-gray-500">
            © {currentYear} {settings.site_name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={handleBackToTop}
              className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer group"
            >
              Back to Top
              <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
            </button>
            <p className="text-xs font-mono text-gray-500">
              Made with ❤️ by <span className="text-indigo-400">{settings.site_name}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
