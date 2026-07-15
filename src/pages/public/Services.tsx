import React from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../components/AppContext';
import { renderLucideIcon } from './Home';
import { Check, ArrowRight } from 'lucide-react';

export default function Services() {
  const { data, navigateTo } = useApp();
  const services = data?.services || [];

  return (
    <Layout title="Our Services" description="B2bfiy helps businesses grow through fast responsive web design, premium brand identity, social video editing, and complete organic social media management.">
      {/* HERO TITLE */}
      <section className="py-20 bg-brand-light-bg border-b border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 bg-brand-soft-red text-brand-primary text-xs font-bold uppercase rounded-full mb-4">
            Our Expertise
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight mb-6">
            Everything Your Business Needs to Grow Online
          </h1>
          <p className="text-brand-secondary text-sm md:text-base leading-relaxed max-w-2xl">
            We offer modular, comprehensive digital options that ensure your company maintains a consistent, professional, high-converting aesthetic across all channels.
          </p>
        </div>
      </section>

      {/* DETAILED SERVICE BOXES */}
      <section className="py-20 bg-brand-pure-white px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          {services.map((srv, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={srv.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-brand-warm-bg rounded-[32px] p-8 md:p-12 border border-brand-border`}
              >
                {/* Content side */}
                <div className={`lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="w-14 h-14 rounded-2xl bg-brand-soft-red flex justify-center items-center mb-6">
                    {renderLucideIcon(srv.iconName, "w-7 h-7 text-brand-primary")}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-brand-dark mb-4">{srv.title}</h3>
                  <p className="text-brand-secondary text-sm md:text-base leading-relaxed mb-6">{srv.description}</p>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                    {srv.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-brand-secondary font-medium">
                        <Check className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigateTo('/packages')}
                    className="px-6 py-3 bg-brand-primary text-brand-pure-white text-xs font-bold rounded-full shadow-md hover:bg-brand-coral transition-all cursor-pointer flex items-center gap-1"
                  >
                    Explore {srv.title} Packages
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Aesthetic Visual Side */}
                <div className={`lg:col-span-5 flex justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border border-brand-border shadow-soft-card relative bg-brand-pure-white">
                    <div className="absolute top-4 left-4 bg-brand-primary text-brand-pure-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow">
                      {srv.title.split(' ')[0]}
                    </div>
                    {srv.id === 'ser1' && (
                      <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80" alt="Dev visual" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    {srv.id === 'ser2' && (
                      <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=500&q=80" alt="Design visual" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    {srv.id === 'ser3' && (
                      <img src="https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&w=500&q=80" alt="Video visual" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    {srv.id === 'ser4' && (
                      <img src="https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=500&q=80" alt="SMM visual" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    {!['ser1','ser2','ser3','ser4'].includes(srv.id) && (
                      <div className="w-full h-full bg-brand-soft-red flex items-center justify-center font-bold text-brand-primary">B2bfiy</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
