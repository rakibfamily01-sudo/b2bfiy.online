import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, MapPin, Mail, Phone, CheckCircle2, Loader2, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Service, SiteSettings } from '../types';

interface ContactProps {
  settings: SiteSettings;
  services: Service[];
}

export default function Contact({ settings, services }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_interested: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Your name is required.';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (formData.phone.trim() && !/^[0-9+\s-]{6,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message.');
      }

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_interested: '',
        message: '',
      });
      
      // Reset success notification after 5 seconds
      setTimeout(() => setIsSuccess(false), 6000);
    } catch (err: any) {
      setServerError(err.message || 'Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 bg-[#030408] bg-grid-pattern overflow-hidden">
      {/* Decorative neon spots */}
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase font-mono mb-3">
            GET IN TOUCH
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-6">
            Start Your Project Today
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
        </div>

        {/* Form & Info Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Form (7cols) */}
          <div className="lg:col-span-7 rounded-3xl glass-card border border-white/5 p-6 sm:p-10 shadow-2xl relative bg-[#0a0b12]/40">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/15">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-display font-extrabold text-white mb-4">
                  Message Sent Successfully!
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md">
                  Thank you! We have received your submission. Our project manager will contact you very soon.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-8 px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wider font-mono uppercase bg-white/5 border border-white/10 hover:border-indigo-500/20 text-indigo-400 hover:text-white transition-all cursor-pointer"
                >
                  [ Send Another Message ]
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-6">
                  Send Us a Message
                </h3>

                {serverError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {serverError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                      Your Name <span className="text-indigo-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Shakib Hasan"
                      className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all ${
                        errors.name ? 'border-red-500/40' : 'border-white/5'
                      }`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +8801700000000"
                      className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all ${
                        errors.phone ? 'border-red-500/40' : 'border-white/5'
                      }`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. shakib@example.com"
                      className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all ${
                        errors.email ? 'border-red-500/40' : 'border-white/5'
                      }`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                  </div>

                  {/* Dropdown service options */}
                  <div>
                    <label htmlFor="service_interested" className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                      Which service are you interested in?
                    </label>
                    <select
                      id="service_interested"
                      name="service_interested"
                      value={formData.service_interested}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all"
                    >
                      <option value="" className="bg-[#0c0d15] text-gray-400">Select...</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.title} className="bg-[#0c0d15] text-white">
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <label htmlFor="message" className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                    Write Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your project details here..."
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Info Frame (5cols) */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-tight">
                Let's Talk <br />
                About Your Next Venture!
              </h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                We have a dedicated team to turn your business into a digital brand. For any discussion or questions, visit our office or email us.
              </p>
            </div>

            {/* Quick Contacts lists */}
            <div className="space-y-6">
              {/* Address info block */}
              {settings.footer_address && (
                <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 items-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-gray-500 block uppercase tracking-widest">ADDRESS</span>
                    <span className="text-base font-semibold text-white mt-0.5 block">{settings.footer_address}</span>
                  </div>
                </div>
              )}

              {/* Email info block */}
              {settings.footer_email && (
                <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 items-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-gray-500 block uppercase tracking-widest">EMAIL SUPPORT</span>
                    <a href={`mailto:${settings.footer_email}`} className="text-base font-semibold text-white mt-0.5 block hover:text-indigo-400 transition-colors">
                      {settings.footer_email}
                    </a>
                  </div>
                </div>
              )}

              {/* Whatsapp info block */}
              {settings.whatsapp_number && (
                <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-gray-500 block uppercase tracking-widest">WHATSAPP DIRECT</span>
                    <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-white mt-0.5 block hover:text-indigo-400 transition-colors">
                      {settings.whatsapp_number}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Social handles links */}
            <div className="border-t border-white/5 pt-8 space-y-4">
              <span className="text-xs font-mono text-gray-500 block uppercase tracking-widest">FIND US ON SOCIALS</span>
              <div className="flex items-center gap-4">
                {settings.social_links.facebook && (
                  <a href={settings.social_links.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-indigo-600 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {settings.social_links.instagram && (
                  <a href={settings.social_links.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-pink-600 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings.social_links.linkedin && (
                  <a href={settings.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-indigo-700 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {settings.social_links.youtube && (
                  <a href={settings.social_links.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-600 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
