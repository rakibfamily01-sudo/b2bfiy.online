import React from 'react';
import { useApp } from './AppContext';
import { Phone, Mail, Facebook, Instagram, Linkedin, Youtube, MessageCircle } from 'lucide-react';

export default function TopBar() {
  const { data } = useApp();
  const settings = data?.settings;

  if (!settings || !settings.enableTopBar) return null;

  return (
    <div className="bg-brand-primary text-brand-pure-white text-xs py-2 px-4 md:px-8 border-b border-brand-coral border-opacity-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Left Hand: Contact credentials */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:text-brand-soft-red transition-colors font-medium">
              <Phone className="w-3.5 h-3.5" />
              <span>{settings.phone}</span>
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:text-brand-soft-red transition-colors font-medium">
              <Mail className="w-3.5 h-3.5" />
              <span>{settings.email}</span>
            </a>
          )}
        </div>

        {/* Right Hand: Social networks */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-wider text-brand-soft-red opacity-80 hidden md:inline">Connect with us:</span>
          <div className="flex items-center gap-3">
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 hover:text-brand-soft-red transition-all">
                <Facebook className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 hover:text-brand-soft-red transition-all">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.linkedin && (
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="hover:scale-110 hover:text-brand-soft-red transition-all">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.youtube && (
              <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="hover:scale-110 hover:text-brand-soft-red transition-all">
                <Youtube className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:scale-110 hover:text-brand-soft-red transition-all flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-green-300 fill-green-300" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
