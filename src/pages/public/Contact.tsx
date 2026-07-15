import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../components/AppContext';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';

export default function Contact() {
  const { data, showToast } = useApp();
  const settings = data?.settings;

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.message) {
      showToast('Please fill in Name, Email and Message.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const resData = await res.json();
      if (res.ok) {
        showToast(resData.message || 'Your inquiry was received!', 'success');
        setForm({ fullName: '', email: '', subject: '', message: '' });
        setSubmitted(true);
      } else {
        showToast(resData.error || 'Submission failed.', 'error');
      }
    } catch (e) {
      showToast('Network error, please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Contact Us" description="Get in touch with B2bfiy Digital Agency. We are here to answer your questions and help your business build a powerful online brand.">
      {/* HEROHEADER */}
      <section className="py-20 bg-brand-light-bg border-b border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 bg-brand-soft-red text-brand-primary text-xs font-bold uppercase rounded-full mb-4">
            Connect
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight mb-6">
            Let's Start a Digital Partnership
          </h1>
          <p className="text-brand-secondary text-sm md:text-base leading-relaxed max-w-2xl">
            Do you have questions about our packages or need a custom quotation? Fill in our contact sheet below or message our account coordinators on WhatsApp.
          </p>
        </div>
      </section>

      {/* CORE INFO & CONTACT FORM */}
      <section className="py-20 bg-brand-pure-white px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Column 1: Contact Coordinates */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <h3 className="text-2xl font-black text-brand-dark">Our Headquarters</h3>
            
            <ul className="flex flex-col gap-6 text-sm text-brand-secondary">
              {settings?.address && (
                <li className="flex gap-4 p-5 rounded-2xl bg-brand-warm-bg border border-brand-border">
                  <MapPin className="w-6 h-6 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-brand-dark uppercase tracking-wide mb-1">Our Location</h5>
                    <p className="text-xs leading-normal">{settings.address}</p>
                  </div>
                </li>
              )}
              {settings?.phone && (
                <li className="flex gap-4 p-5 rounded-2xl bg-brand-warm-bg border border-brand-border">
                  <Phone className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-brand-dark uppercase tracking-wide mb-1">Call Us</h5>
                    <a href={`tel:${settings.phone}`} className="text-xs font-semibold hover:text-brand-primary block">{settings.phone}</a>
                  </div>
                </li>
              )}
              {settings?.email && (
                <li className="flex gap-4 p-5 rounded-2xl bg-brand-warm-bg border border-brand-border">
                  <Mail className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-brand-dark uppercase tracking-wide mb-1">Email Coordinates</h5>
                    <a href={`mailto:${settings.email}`} className="text-xs font-semibold hover:text-brand-primary block">{settings.email}</a>
                  </div>
                </li>
              )}
              <li className="flex gap-4 p-5 rounded-2xl bg-brand-warm-bg border border-brand-border">
                <Clock className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-xs text-brand-dark uppercase tracking-wide mb-1">Work Hours</h5>
                  <p className="text-xs">Saturday — Thursday: 10:00 AM — 08:00 PM</p>
                </div>
              </li>
            </ul>

            {settings?.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-green-50 hover:bg-green-100 border border-green-200 flex items-center gap-4 text-green-900 font-bold transition-colors shadow-sm"
              >
                <MessageCircle className="w-8 h-8 text-brand-pure-white fill-green-600" />
                <div>
                  <span className="block text-[10px] text-green-700 uppercase tracking-wider font-semibold">Immediate Chat</span>
                  <span className="text-sm">Message on WhatsApp</span>
                </div>
              </a>
            )}
          </div>

          {/* Column 2: Inquiry Form */}
          <div className="lg:col-span-7 bg-brand-warm-bg p-8 md:p-12 rounded-[32px] border border-brand-border shadow-soft-card">
            {submitted ? (
              <div className="text-center py-12 flex flex-col items-center">
                <Send className="w-12 h-12 text-brand-primary mb-4 animate-bounce" />
                <h4 className="font-bold text-lg text-brand-dark mb-2">Message Received</h4>
                <p className="text-xs text-brand-secondary leading-relaxed max-w-sm mb-6">We have received your contact inquiry. A team coordinator will contact you shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 bg-brand-primary text-brand-pure-white text-xs font-bold rounded-full cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h3 className="text-xl font-bold text-brand-dark">Send an Inquiry</h3>
                
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-4 py-3 text-xs bg-brand-pure-white border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. tanvir@gmail.com"
                    className="w-full px-4 py-3 text-xs bg-brand-pure-white border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-2">Inquiry Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Website Pricing Custom Quote"
                    className="w-full px-4 py-3 text-xs bg-brand-pure-white border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-2">Inquiry Message *</label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your project, timeline, or query..."
                    rows={5}
                    className="w-full px-4 py-3 text-xs bg-brand-pure-white border border-brand-border rounded-xl focus:border-brand-primary outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-primary hover:bg-brand-coral text-brand-pure-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Sending message...' : 'Send Inquiry Message'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </Layout>
  );
}
