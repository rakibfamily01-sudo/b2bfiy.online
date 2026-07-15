import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../components/AppContext';
import { CheckCircle2, ArrowRight, Sparkles, HelpCircle, ShieldAlert } from 'lucide-react';

export default function FreeAudit() {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
    email: '',
    whatsapp: '',
    websiteUrl: '',
    serviceNeeded: 'Complete Digital Solution',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.whatsapp) {
      showToast('Please fill out all required fields (*)', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/public/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const resData = await res.json();
      if (res.ok) {
        showToast(resData.message || 'Audit request registered!', 'success');
        setSubmitted(true);
      } else {
        showToast(resData.error || 'Failed to submit request', 'error');
      }
    } catch (err) {
      showToast('Network error, please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Free Digital Audit" description="Not sure where to start? Request our complete Free Digital Presence Audit and receive personalized reports on your website and social content.">
      {/* 1. HERO SECTION */}
      <section className="py-16 md:py-24 bg-brand-light-bg border-b border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 bg-brand-soft-red text-brand-primary text-xs font-bold uppercase rounded-full mb-4">
            Grow Your Presence
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight mb-6">
            Get a Personalized Free Digital Audit
          </h1>
          <p className="text-brand-secondary text-sm md:text-base leading-relaxed max-w-2xl">
            Our expert developers and marketers will personally review your existing web page, visual styling templates, and video reel strategies, delivering a detailed actionable improvement roadmap 100% free.
          </p>
        </div>
      </section>

      {/* 2. FORM OR SUCCESS BLOCK */}
      <section className="py-20 bg-brand-pure-white px-4 md:px-8 text-left">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Interactive Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-brand-success mb-6" />
                <h3 className="text-2xl font-black text-brand-dark mb-3">Audit Requested!</h3>
                <p className="text-brand-secondary text-xs md:text-sm leading-relaxed max-w-sm mb-6">
                  Thank you, {form.fullName}. Our strategy team has received your details and we will contact you on WhatsApp or email inside 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-brand-primary text-brand-pure-white text-xs font-bold rounded-full"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-brand-warm-bg rounded-3xl p-6 md:p-10 border border-brand-border shadow-soft-card">
                <h4 className="font-extrabold text-lg text-brand-dark mb-6">Tell Us About Your Brand</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-2">Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Dhaka Bakers"
                      className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none"
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
                      className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-2">WhatsApp Number *</label>
                    <input
                      type="text"
                      name="whatsapp"
                      required
                      value={form.whatsapp}
                      onChange={handleChange}
                      placeholder="e.g. 01712345678"
                      className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-brand-dark mb-2">Existing Page / Website Link</label>
                  <input
                    type="text"
                    name="websiteUrl"
                    value={form.websiteUrl}
                    onChange={handleChange}
                    placeholder="e.g. facebook.com/dhakabakers"
                    className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-brand-dark mb-2">I am interested in...</label>
                  <select
                    name="serviceNeeded"
                    value={form.serviceNeeded}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none font-semibold"
                  >
                    <option>Website Development</option>
                    <option>Graphic Design</option>
                    <option>Video Editing</option>
                    <option>Social Media Management</option>
                    <option>Complete Digital Solution</option>
                    <option>Not Sure</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-bold text-brand-dark mb-2">Main Challenges or Goals</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Please outline any specific issues you are facing (e.g. low facebook response, high bounce rate, empty page...)"
                    rows={4}
                    className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand-primary text-brand-pure-white font-bold rounded-xl shadow-lg hover:bg-brand-coral transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs md:text-sm uppercase tracking-wider"
                >
                  {loading ? 'Submitting details...' : 'Request Free Audit Report'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right: What you get */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-brand-light-bg rounded-3xl p-6 border border-brand-border">
              <h5 className="font-extrabold text-sm text-brand-dark flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                What's Included in the Audit?
              </h5>
              
              <ul className="flex flex-col gap-4 text-xs text-brand-secondary">
                {[
                  { title: 'Performance Review', desc: 'Speed validation on mobile and laptops.' },
                  { title: 'UX & Typography Check', desc: 'Spacing hierarchy and custom layout guidelines.' },
                  { title: 'Visual Contrast Report', desc: 'Post styling comparison against competitors.' },
                  { title: 'Clips Engagement Hints', desc: 'Analysis of reels caption spacing and hooks.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-soft-red text-brand-primary font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">{i+1}</span>
                    <div>
                      <strong className="block text-brand-dark font-bold">{item.title}</strong>
                      <span className="text-[11px] mt-0.5 leading-normal block">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-brand-warm-bg rounded-3xl border border-brand-border flex gap-3">
              <ShieldAlert className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-brand-secondary leading-relaxed">
                <strong>No obligations & No SPAM:</strong> Your files and contact credentials are strictly private. We will never share or publish your business materials.
              </p>
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
}
