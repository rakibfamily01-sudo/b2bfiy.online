import React from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../components/AppContext';
import { Sparkles, Trophy, Lightbulb, UserCheck, ShieldCheck } from 'lucide-react';

export default function About() {
  const { navigateTo } = useApp();

  return (
    <Layout title="About Us" description="Learn about B2bfiy - who we are, our core creative vision, and how we help local and international brands grow.">
      {/* 1. HERO HEADER */}
      <section className="py-20 bg-brand-light-bg border-b border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 bg-brand-soft-red text-brand-primary text-xs font-bold uppercase rounded-full mb-4">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight mb-6">
            We Build Highly Strategic, Creative Digital Infrastructure
          </h1>
          <p className="text-brand-secondary text-sm md:text-base leading-relaxed max-w-2xl">
            Founded with a vision to streamline digital transformation, B2bfiy removes the complexity of managing creative assets. We fuse advanced web development, high-end design, engaging cuts, and direct monthly campaigns to skyrocket your growth.
          </p>
        </div>
      </section>

      {/* 2. VISION & MISSION */}
      <section className="py-20 bg-brand-pure-white px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-8 md:p-12 rounded-3xl bg-brand-warm-bg border border-brand-border flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-soft-red flex justify-center items-center mb-6">
                <Lightbulb className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-extrabold text-brand-dark mb-4">Our Vision</h3>
              <p className="text-brand-secondary text-sm leading-relaxed">
                To become the global creative and technical standard partner for small businesses, local retail owners, restaurants, e-commerce stores, and clinics, helping them scale without needing large corporate budgets.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12 rounded-3xl bg-brand-warm-bg border border-brand-border flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-soft-red flex justify-center items-center mb-6">
                <Trophy className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-extrabold text-brand-dark mb-4">Our Mission</h3>
              <p className="text-brand-secondary text-sm leading-relaxed">
                To build high-converting web portals, high-quality post graphics, and viral video reels, delivering consistent, reliable execution daily and handling all marketing bottlenecks so business owners can focus purely on operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE PRINCIPLES */}
      <section className="py-20 bg-brand-warm-bg border-t border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
              Beliefs & Anchors
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4">
              The Principles That Drive Our Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Client-Centered Focus',
                desc: 'We never larp with vanity metrics. We measure our agency success based on the incoming leads, bookings, and revenue growth of our clients.',
                icon: UserCheck
              },
              {
                title: 'Extreme Quality Standards',
                desc: 'Whether it is clean semantic code structures, responsive layouts, high-fidelity Photoshop files, or engaging cuts — our deliverables are top-tier.',
                icon: Sparkles
              },
              {
                title: 'Zero Overhead Honesty',
                desc: 'No hidden bills, no fake timelines, no broken promises. We communicate in real-time, delivering complete creative transparency over WhatsApp.',
                icon: ShieldCheck
              }
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="p-8 bg-brand-pure-white rounded-3xl border border-brand-border shadow-soft-card">
                  <div className="w-10 h-10 rounded-xl bg-brand-soft-red flex justify-center items-center mb-6">
                    <Icon className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h4 className="font-extrabold text-base text-brand-dark mb-3">{p.title}</h4>
                  <p className="text-brand-secondary text-xs leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="py-20 bg-brand-primary text-brand-pure-white text-center px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Let's Create Something Extraordinary</h2>
          <p className="text-brand-soft-red text-xs md:text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            Ready to partner with B2bfiy? Give your brand the premium digital boost it deserves. Request your free presence audit today.
          </p>
          <button
            onClick={() => navigateTo('/free-audit')}
            className="px-8 py-3.5 bg-brand-pure-white text-brand-primary font-bold rounded-full hover:scale-105 transition-transform cursor-pointer shadow-md"
          >
            Get My Free Audit
          </button>
        </div>
      </section>
    </Layout>
  );
}
