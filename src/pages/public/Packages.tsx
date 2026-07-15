import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../components/AppContext';
import { Check, Info, ShieldCheck, Zap, ArrowRight, Star } from 'lucide-react';

export default function Packages() {
  const { data, navigateTo } = useApp();
  const packages = data?.packages || [];

  // Group packages by category type
  const monthlyPlans = packages.filter(p => p.type === 'monthly');
  const websitePlans = packages.filter(p => p.type === 'website');
  const graphicPlans = packages.filter(p => p.type === 'graphic');
  const videoPlans = packages.filter(p => p.type === 'video');
  const launchBundles = packages.filter(p => p.type === 'bundle');

  const [activeTab, setActiveTab] = useState<'all' | 'monthly' | 'website' | 'graphic' | 'video' | 'bundle'>('all');

  const tabs = [
    { key: 'all', label: 'All Packages' },
    { key: 'monthly', label: 'Monthly SMM Plans' },
    { key: 'website', label: 'Web Development' },
    { key: 'graphic', label: 'Graphic Design' },
    { key: 'video', label: 'Video Editing' },
    { key: 'bundle', label: 'Business Launch' },
  ] as const;

  const renderPlanCard = (plan: typeof packages[0]) => (
    <div
      key={plan.id}
      className={`bg-brand-pure-white rounded-3xl p-8 border flex flex-col justify-between h-full relative transition-all duration-300 ${
        plan.mostPopular
          ? 'border-2 border-brand-primary shadow-lg scale-[1.01]'
          : 'border-brand-border shadow-soft-card hover:shadow-soft-hover hover:-translate-y-0.5'
      }`}
    >
      {plan.mostPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-pure-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow border border-brand-primary">
          Most Popular Plan
        </span>
      )}

      <div>
        <div className="flex justify-between items-start gap-4 mb-3">
          <h4 className="font-extrabold text-base md:text-lg text-brand-dark uppercase tracking-wide">
            {plan.name}
          </h4>
          {plan.deliveryTime && (
            <span className="text-[10px] bg-brand-soft-red border border-brand-border text-brand-primary font-bold px-2 py-0.5 rounded-full">
              {plan.deliveryTime}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mb-6">
          <span className="text-3xl md:text-4xl font-extrabold text-brand-dark">
            {plan.currency}{plan.price}
          </span>
          <span className="text-xs font-semibold text-brand-secondary">
            / {plan.period}
          </span>
        </div>

        <div className="h-px bg-brand-border mb-6"></div>

        <ul className="flex flex-col gap-4 mb-8">
          {plan.features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-brand-secondary font-medium">
              <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5 animate-pulse" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => navigateTo('/free-audit')}
        className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide transition-all text-center cursor-pointer ${
          plan.mostPopular
            ? 'bg-brand-primary text-brand-pure-white hover:bg-brand-coral shadow-md'
            : 'bg-brand-soft-red text-brand-primary hover:bg-brand-primary hover:text-brand-pure-white'
        }`}
      >
        {plan.mostPopular ? 'Grow My Business' : 'Get Started Now'}
      </button>
    </div>
  );

  return (
    <Layout title="Growth Packages" description="Explore affordable, transparent B2bfiy agency pricing packages for websites development, custom social post designs, video editing clips, and full-scale business marketing campaigns.">
      {/* HERO BANNER */}
      <section className="py-20 bg-brand-light-bg border-b border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 bg-brand-soft-red text-brand-primary text-xs font-bold uppercase rounded-full mb-4">
            Pricing Plans
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight mb-6">
            Transparent Pricing Built for Growing Brands
          </h1>
          <p className="text-brand-secondary text-sm md:text-base leading-relaxed max-w-2xl">
            No long term commitments or surprise agency fees. Choose an pre-made plan or contact us for custom bulk orders.
          </p>
        </div>
      </section>

      {/* TABS CONTROLLERS */}
      <section className="py-8 bg-brand-warm-bg border-b border-brand-border sticky top-20 z-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2.5 justify-center">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === t.key
                  ? 'bg-brand-primary text-brand-pure-white shadow-md'
                  : 'bg-brand-pure-white text-brand-secondary border border-brand-border hover:bg-brand-soft-red hover:text-brand-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* DISPLAY GRIDS */}
      <section className="py-20 bg-brand-pure-white px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto flex flex-col gap-24">
          
          {/* Section 1: Monthly SMM */}
          {(activeTab === 'all' || activeTab === 'monthly') && monthlyPlans.length > 0 && (
            <div>
              <div className="mb-10 border-b border-brand-border pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Subscription Models</span>
                <h3 className="text-2xl font-black text-brand-dark mt-1">Monthly Social Media Management Plans</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {monthlyPlans.map(renderPlanCard)}
              </div>
            </div>
          )}

          {/* Section 2: Website */}
          {(activeTab === 'all' || activeTab === 'website') && websitePlans.length > 0 && (
            <div>
              <div className="mb-10 border-b border-brand-border pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Website Development</span>
                <h3 className="text-2xl font-black text-brand-dark mt-1">High-Converting Web Development Projects</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {websitePlans.map(renderPlanCard)}
              </div>
            </div>
          )}

          {/* Section 3: Graphic */}
          {(activeTab === 'all' || activeTab === 'graphic') && graphicPlans.length > 0 && (
            <div>
              <div className="mb-10 border-b border-brand-border pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Graphic Identity</span>
                <h3 className="text-2xl font-black text-brand-dark mt-1">Professional Social Graphic Solutions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {graphicPlans.map(renderPlanCard)}
              </div>
            </div>
          )}

          {/* Section 4: Video */}
          {(activeTab === 'all' || activeTab === 'video') && videoPlans.length > 0 && (
            <div>
              <div className="mb-10 border-b border-brand-border pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Video Creative</span>
                <h3 className="text-2xl font-black text-brand-dark mt-1">Short-Form Video & Reels Editing Packages</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videoPlans.map(renderPlanCard)}
              </div>
            </div>
          )}

          {/* Section 5: Launch Bundles */}
          {(activeTab === 'all' || activeTab === 'bundle') && launchBundles.length > 0 && (
            <div>
              <div className="mb-10 border-b border-brand-border pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Full Business Launch</span>
                <h3 className="text-2xl font-black text-brand-dark mt-1">Complete Digital Storefront Launch Packs</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
                {launchBundles.map(renderPlanCard)}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* TRUST SEAL INFO */}
      <section className="py-16 bg-brand-light-bg px-4 border-t border-brand-border">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <ShieldCheck className="w-8 h-8 text-brand-primary" />
            <h5 className="font-bold text-xs text-brand-dark mt-2">No Contracts</h5>
            <p className="text-[11px] text-brand-secondary leading-relaxed">Cancel or upgrade your SMM subscription plan at any time with a 5-day cycle warning.</p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-2">
            <Info className="w-8 h-8 text-brand-primary" />
            <h5 className="font-bold text-xs text-brand-dark mt-2">Continuous Updates</h5>
            <p className="text-[11px] text-brand-secondary leading-relaxed">View all graphic formats, assets, and clips draft progress online daily over Figma and Drive.</p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-2">
            <Zap className="w-8 h-8 text-brand-primary" />
            <h5 className="font-bold text-xs text-brand-dark mt-2">Custom Adjustments</h5>
            <p className="text-[11px] text-brand-secondary leading-relaxed">Do you have bulk needs? We customize features and delivery ratios specifically for you.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
