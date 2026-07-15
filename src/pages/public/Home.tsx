import React, { useState } from 'react';
import { useApp } from '../../components/AppContext';
import Layout from '../../components/Layout';
import { 
  Laptop, Palette, Video, Share2, Award, Users, Calendar, CheckCircle, 
  TrendingUp, MessageSquareCode, ShieldCheck, Sparkles, BadgePercent, 
  ArrowRight, ChevronRight, Star, Check, ChevronDown, Zap, Phone, Mail, MapPin, MessageCircle
} from 'lucide-react';

// Dynamic icon mapper helper
export function renderLucideIcon(iconName: string, className = "w-6 h-6 text-brand-primary") {
  const icons: Record<string, any> = {
    Laptop, Palette, Video, Share2, Award, Users, Calendar, CheckCircle, 
    TrendingUp, MessageSquareCode, ShieldCheck, Sparkles, BadgePercent, Zap, Phone, Mail, MapPin, MessageCircle
  };
  const IconComponent = icons[iconName] || Sparkles;
  return <IconComponent className={className} />;
}

export default function Home() {
  const { data, navigateTo, showToast } = useApp();

  // CMS Content
  const hero = data?.hero_content;
  const stats = data?.statistics || [];
  const logos = data?.client_logos || [];
  const services = data?.services || [];
  const whyUs = data?.why_choose_us || [];
  const projects = data?.portfolio_projects || [];
  const categories = data?.portfolio_categories || [];
  const processSteps = data?.work_process || [];
  const packages = data?.packages || [];
  const testimonials = data?.testimonials || [];
  const faqs = data?.faqs || [];
  const settings = data?.settings;

  // Local Page State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const isGraphicsSelected = selectedCategory === 'cat2' || 
    categories.find(c => c.id === selectedCategory)?.slug?.includes('graphic') ||
    categories.find(c => c.id === selectedCategory)?.name?.toLowerCase()?.includes('graphic');
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  // Free Audit Form State
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditForm, setAuditForm] = useState({
    fullName: '',
    businessName: '',
    email: '',
    whatsapp: '',
    websiteUrl: '',
    serviceNeeded: 'Website Development',
    message: ''
  });

  const handleAuditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAuditForm({ ...auditForm, [e.target.name]: e.target.value });
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditForm.fullName || !auditForm.email || !auditForm.whatsapp) {
      showToast('Please fill out all required fields (*)', 'error');
      return;
    }

    try {
      setAuditLoading(true);
      const res = await fetch('/api/public/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditForm)
      });
      const resData = await res.json();
      if (res.ok) {
        showToast(resData.message || 'Your audit request has been sent!', 'success');
        setAuditForm({
          fullName: '',
          businessName: '',
          email: '',
          whatsapp: '',
          websiteUrl: '',
          serviceNeeded: 'Website Development',
          message: ''
        });
      } else {
        showToast(resData.error || 'Submission failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error, please try again later.', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  const filteredProjects = selectedCategory === 'all'
    ? projects.slice(0, 6)
    : projects.filter(p => p.categoryId === selectedCategory).slice(0, 6);

  // Group packages by type to show only "monthly" (Growth Plans) in the main hero packages section
  const monthlyPlans = packages.filter(p => p.type === 'monthly');

  return (
    <Layout>
      {/* 1. HERO SECTION */}
      {hero && hero.isVisible && (
        <section className="relative overflow-hidden pt-12 pb-24 md:py-32 px-4 md:px-8 bg-gradient-to-b from-brand-light-bg via-brand-warm-bg to-brand-warm-bg">
          {/* Subtle background graphics */}
          <div className="hidden md:block absolute top-1/4 left-10 w-96 h-96 bg-brand-soft-red rounded-full filter blur-3xl opacity-40 -z-10"></div>
          <div className="hidden md:block absolute bottom-10 right-10 w-80 h-80 bg-orange-100 rounded-full filter blur-3xl opacity-30 -z-10"></div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side info */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-soft-red text-brand-primary text-xs font-bold uppercase tracking-wider rounded-full mb-6 shadow-sm border border-brand-border">
                <Sparkles className="w-3.5 h-3.5" />
                {hero.badge}
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tight leading-[1.1] mb-6">
                {/* Dynamically highlight matching text with red gradients */}
                {hero.heading.includes(hero.highlightText) ? (
                  <>
                    {hero.heading.split(hero.highlightText)[0]}
                    <span className="text-gradient font-black">{hero.highlightText}</span>
                    {hero.heading.split(hero.highlightText)[1]}
                  </>
                ) : (
                  hero.heading
                )}
              </h1>

              <p className="text-brand-secondary text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                {hero.description}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => navigateTo(hero.primaryCtaUrl)}
                  className="px-8 py-4 bg-brand-primary text-brand-pure-white font-bold rounded-full shadow-lg hover:bg-brand-coral hover:-translate-y-0.5 hover:shadow-soft-hover transition-all text-center cursor-pointer"
                >
                  {hero.primaryCtaText}
                </button>
                <button
                  onClick={() => navigateTo(hero.secondaryCtaUrl)}
                  className="px-8 py-4 bg-brand-pure-white text-brand-dark hover:text-brand-primary border border-brand-border font-bold rounded-full hover:bg-brand-soft-red hover:-translate-y-0.5 transition-all text-center cursor-pointer"
                >
                  {hero.secondaryCtaText}
                </button>
              </div>

              {hero.trustText && (
                <p className="text-xs text-brand-secondary font-medium mt-6 flex items-center gap-1.5 opacity-80">
                  <span className="w-2 h-2 rounded-full bg-brand-success inline-block animate-pulse"></span>
                  {hero.trustText}
                </p>
              )}
            </div>

            {/* Right side interactive mockups */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-brand-soft-red to-orange-50 rounded-[40px] p-6 shadow-xl border border-brand-border flex items-center justify-center overflow-hidden">
                {/* Real-time floating assets mockups */}
                <img
                  src={hero.imagePath}
                  alt="B2bfiy Creative Presentation"
                  className="w-full h-full object-cover rounded-[30px] shadow-md border border-brand-border"
                  referrerPolicy="no-referrer"
                />

                {/* Service Tag overlays */}
                <div className="absolute top-8 left-8 bg-brand-pure-white bg-opacity-90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-brand-border flex items-center gap-2 animate-bounce" style={{ animationDuration: '3s' }}>
                  <Laptop className="w-4 h-4 text-brand-primary" />
                  <span className="text-xs font-bold text-brand-dark">Web Design</span>
                </div>

                <div className="absolute bottom-12 right-6 bg-brand-pure-white bg-opacity-90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-brand-border flex items-center gap-2 animate-bounce" style={{ animationDuration: '4.5s' }}>
                  <Palette className="w-4 h-4 text-brand-coral" />
                  <span className="text-xs font-bold text-brand-dark">Graphic Brand</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. SERVICE CATEGORY FLOATING CARDS */}
      <section className="relative px-4 md:px-8 -mt-10 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map((srv) => (
            <div
              key={srv.id}
              onClick={() => navigateTo('/services')}
              className="bg-brand-pure-white rounded-3xl p-6 border border-brand-border shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all group cursor-pointer flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-soft-red flex justify-center items-center mb-5 group-hover:bg-brand-primary group-hover:scale-110 transition-all">
                {renderLucideIcon(srv.iconName, "w-6 h-6 text-brand-primary group-hover:text-brand-pure-white transition-colors")}
              </div>
              <h3 className="font-extrabold text-lg text-brand-dark mb-2.5 group-hover:text-brand-primary transition-colors">
                {srv.title}
              </h3>
              <p className="text-brand-secondary text-xs leading-relaxed mb-4 flex-grow">
                {srv.description}
              </p>
              <span className="text-xs font-bold text-brand-primary flex items-center gap-1 group-hover:underline">
                Explore plans <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRUST & CLIENTS CAROUSEL */}
      {logos.length > 0 && (
        <section className="py-16 bg-brand-warm-bg overflow-hidden px-4 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-secondary opacity-70 mb-8">
              Trusted by Businesses We’ve Worked With
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75">
              {logos.map((logo) => (
                <div key={logo.id} className="h-10 w-28 md:w-36 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <img
                    src={logo.imagePath}
                    alt={logo.name}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. STATISTICS CARDS */}
      {stats.length > 0 && (
        <section className="py-12 bg-brand-light-bg px-4 md:px-8 border-y border-brand-border">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center p-4">
                <div className="flex justify-center mb-2.5">
                  {renderLucideIcon(stat.iconName, "w-8 h-8 text-brand-primary opacity-80")}
                </div>
                <h4 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-1">{stat.value}</h4>
                <p className="text-xs md:text-sm font-semibold text-brand-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. PROBLEM & SOLUTION */}
      <section className="py-20 md:py-28 px-4 md:px-8 bg-brand-pure-white text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Problems */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
              The Digital Friction
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4 mb-6">
              Is Your Business Struggling to Stand Out Online?
            </h2>
            <p className="text-brand-secondary text-sm md:text-base leading-relaxed mb-8">
              Managing a modern business is stressful enough without also having to write social copy, render daily vector graphics, optimize search parameters, and cut marketing clips. Here are the symptoms of outdated presence:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Outdated, Slow Website', desc: 'No mobile responsiveness or modern appointment funnels.' },
                { title: 'Inconsistent Post Feeds', desc: 'Empty social calendars that turn prospective clients cold.' },
                { title: 'Unprofessional Graphics', desc: 'Sloppy templates undermining your corporate authority.' },
                { title: 'Low-engagement Videos', desc: 'Missing the dynamic trend transitions that pull leads.' },
              ].map((p, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-brand-warm-bg border border-brand-border flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-primary bg-opacity-10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">!</div>
                  <div>
                    <h5 className="font-bold text-xs text-brand-dark mb-1">{p.title}</h5>
                    <p className="text-[10px] text-brand-secondary leading-normal">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions / CTA */}
          <div className="lg:pl-8">
            <div className="p-8 md:p-12 bg-gradient-to-br from-brand-dark to-gray-900 text-brand-pure-white rounded-[32px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-10 rounded-full filter blur-xl"></div>
              
              <span className="text-xs font-bold uppercase tracking-widest text-brand-coral">
                The B2bfiy Cure
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3 mb-4">
                You Focus on Your Business. We Handle Your Complete Digital Presence.
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                B2bfiy serves as your personal creative, technology, and marketing department. We deploy skilled designers, responsive developers, and video editors directly onto your brand.
              </p>

              <div className="flex flex-col gap-3.5 mb-8">
                {[
                  '100% original, premium designs made from scratch',
                  'Ultra-fast website development loaded with features',
                  'Complete content strategic planning and monthly calendar',
                  'No overheads of managing multiple unreliable freelancers',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigateTo('/free-audit')}
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-primary text-brand-pure-white font-bold rounded-full hover:bg-brand-coral transition-all text-center flex items-center justify-center gap-2 group cursor-pointer"
              >
                Let's Grow Your Business
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DETAILED SERVICES SUMMARY */}
      <section className="py-20 bg-brand-warm-bg border-t border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
              Professional Capabilities
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4">
              Everything Your Business Needs to Grow Online
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((srv) => (
              <div key={srv.id} className="p-8 bg-brand-pure-white rounded-3xl border border-brand-border shadow-soft-card hover:shadow-soft-hover hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-brand-soft-red flex justify-center items-center mb-6">
                    {renderLucideIcon(srv.iconName, "w-7 h-7 text-brand-primary")}
                  </div>
                  <h3 className="text-xl font-extrabold text-brand-dark mb-3">{srv.title}</h3>
                  <p className="text-brand-secondary text-sm leading-relaxed mb-6">{srv.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {srv.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-brand-secondary font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0"></span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigateTo('/packages')}
                  className="w-full py-3 bg-brand-soft-red text-brand-primary font-bold text-sm rounded-2xl hover:bg-brand-primary hover:text-brand-pure-white transition-all cursor-pointer text-center"
                >
                  View Packages & Pricing
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE B2BFIY (BENTO GRID) */}
      {whyUs.length > 0 && (
        <section className="py-20 md:py-28 bg-brand-light-bg px-4 md:px-8 border-y border-brand-border text-left">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full">
                The B2bfiy Difference
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4">
                Why Businesses Partner With Us
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyUs.map((item) => (
                <div key={item.id} className="p-7 bg-brand-pure-white rounded-3xl border border-brand-border shadow-soft-card hover:shadow-soft-hover transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-soft-red flex justify-center items-center mb-5">
                    {renderLucideIcon(item.iconName, "w-5 h-5 text-brand-primary")}
                  </div>
                  <h4 className="font-extrabold text-base text-brand-dark mb-2">{item.title}</h4>
                  <p className="text-brand-secondary text-xs leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. COMPLETE PORTFOLIO PREVIEW */}
      <section className="py-20 bg-brand-pure-white px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
                Our Showcase
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4">
                Explore Our Recent Creative Works
              </h2>
            </div>
            <button
              onClick={() => navigateTo('/portfolio')}
              className="text-sm font-bold text-brand-primary flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              See complete portfolio <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Categories Tab Selector */}
          <div className="flex flex-wrap gap-2.5 mb-10 border-b border-brand-border pb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-brand-primary text-brand-pure-white shadow-md'
                  : 'bg-brand-warm-bg text-brand-secondary hover:bg-brand-soft-red hover:text-brand-primary'
              }`}
            >
              All Works
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-brand-primary text-brand-pure-white shadow-md'
                    : 'bg-brand-warm-bg text-brand-secondary hover:bg-brand-soft-red hover:text-brand-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigateTo(`/portfolio/${project.slug}`)}
                className="group cursor-pointer bg-brand-pure-white rounded-3xl overflow-hidden border border-brand-border shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 transition-all"
              >
                <div className="aspect-[4/3] bg-brand-warm-bg relative overflow-hidden">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {project.featured && (
                    <span className="absolute top-4 left-4 bg-brand-primary text-brand-pure-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      Featured
                    </span>
                  )}
                  <span className="absolute bottom-4 right-4 bg-brand-pure-white bg-opacity-90 backdrop-blur-md text-brand-dark text-[10px] font-bold px-2.5 py-1 rounded-full shadow border border-brand-border">
                    {project.serviceType}
                  </span>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-semibold text-brand-secondary uppercase tracking-widest">{project.clientName}</span>
                  <h4 className="font-extrabold text-base text-brand-dark group-hover:text-brand-primary transition-colors mt-1 mb-2.5 line-clamp-1">
                    {project.title}
                  </h4>
                  <p className="text-brand-secondary text-xs leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  <span className="text-xs font-bold text-brand-primary flex items-center gap-1 group-hover:underline">
                    View Project Case Study <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="col-span-full py-16 text-center text-brand-secondary bg-brand-warm-bg rounded-3xl border border-brand-border">
                <p className="text-sm font-semibold">No published projects found in this category.</p>
              </div>
            )}
          </div>

          {/* VIEW ALL GRAPHICS DESIGN DYNAMIC CTA */}
          {isGraphicsSelected && settings?.viewAllGraphicsDesignUrl && (
            <div className="mt-16 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-brand-warm-bg to-brand-light-bg rounded-[32px] border border-brand-border max-w-2xl mx-auto shadow-sm">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full mb-3">
                More Designs Available
              </span>
              <h3 className="text-xl font-black text-brand-dark mb-2">Want to see more of our graphic design work?</h3>
              <p className="text-brand-secondary text-xs leading-relaxed max-w-md mb-6">
                We have extensive libraries of premium posts, high-converting banner designs, and dynamic templates in our global showcase.
              </p>
              <a
                href={settings.viewAllGraphicsDesignUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-brand-primary text-brand-pure-white font-bold text-xs rounded-full hover:bg-brand-coral transition-all shadow-md inline-flex items-center gap-2"
              >
                View All Graphics Design <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 9. HOW WE WORK (TIMELINE) */}
      {processSteps.length > 0 && (
        <section className="py-20 bg-brand-light-bg border-y border-brand-border px-4 md:px-8 text-left overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
                Working Pipeline
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4">
                Our Proven Content & Dev Pipeline
              </h2>
            </div>

            <div className="relative border-l-2 border-brand-border md:border-l-0 md:grid md:grid-cols-5 md:gap-6 pl-8 md:pl-0 ml-4 md:ml-0">
              {processSteps.map((step, idx) => (
                <div key={step.id} className="relative mb-12 md:mb-0">
                  {/* Circle Indicator */}
                  <div className="absolute -left-[49px] md:left-0 top-0 w-8 h-8 rounded-full bg-brand-primary text-brand-pure-white font-extrabold text-xs flex justify-center items-center shadow-md md:relative md:mb-4">
                    {step.stepNumber}
                  </div>
                  <h4 className="font-extrabold text-base text-brand-dark mb-2.5 mt-1 md:mt-0">{step.title}</h4>
                  <p className="text-brand-secondary text-xs leading-relaxed max-w-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. MONTHLY GROWTH PACKAGES */}
      {monthlyPlans.length > 0 && (
        <section className="py-20 bg-brand-pure-white px-4 md:px-8 text-left">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
                Flexible Subscriptions
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4">
                Choose the Right Monthly Growth Plan
              </h2>
              <p className="text-brand-secondary text-xs md:text-sm mt-3 leading-relaxed">
                Streamlined professional graphics and dynamic reels tailored to build authority and drive leads daily.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {monthlyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-8 rounded-3xl border flex flex-col justify-between h-full relative ${
                    plan.mostPopular
                      ? 'border-2 border-brand-primary bg-brand-pure-white shadow-lg scale-105'
                      : 'border-brand-border bg-brand-pure-white shadow-soft-card'
                  }`}
                >
                  {plan.mostPopular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-pure-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark uppercase tracking-wide mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1.5 mb-6">
                      <span className="text-3xl md:text-4xl font-extrabold text-brand-dark">{plan.currency}{plan.price}</span>
                      <span className="text-xs font-semibold text-brand-secondary">/ {plan.period}</span>
                    </div>

                    <div className="h-px bg-brand-border mb-6"></div>

                    <ul className="flex flex-col gap-3.5 mb-8">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-brand-secondary">
                          <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigateTo('/free-audit')}
                    className={`w-full py-3 rounded-full font-bold text-sm tracking-wide transition-all text-center cursor-pointer ${
                      plan.mostPopular
                        ? 'bg-brand-primary text-brand-pure-white hover:bg-brand-coral shadow-md'
                        : 'bg-brand-soft-red text-brand-primary hover:bg-brand-primary hover:text-brand-pure-white'
                    }`}
                  >
                    {plan.mostPopular ? 'Grow Your Business' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigateTo('/packages')}
                className="px-6 py-3 bg-brand-warm-bg hover:bg-brand-soft-red border border-brand-border text-brand-primary text-xs font-bold rounded-full transition-all cursor-pointer"
              >
                Browse Website, Graphic & Video packages <ArrowRight className="w-3.5 h-3.5 inline-block ml-1" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 11. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-brand-warm-bg px-4 md:px-8 border-t border-brand-border text-left">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
                Client Reviews
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4">
                What Growing Businesses Say About Us
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((test) => (
                <div key={test.id} className="p-7 bg-brand-pure-white rounded-3xl border border-brand-border shadow-soft-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-5 text-amber-400">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-brand-secondary text-xs leading-relaxed italic mb-6">
                      "{test.review}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border-t border-brand-border pt-4 mt-2">
                    <img
                      src={test.photoPath}
                      alt={test.name}
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-extrabold text-xs text-brand-dark">{test.name}</h5>
                      <span className="text-[10px] text-brand-secondary font-semibold">{test.company}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12. FREE DIGITAL AUDIT SECTION & FORM */}
      <section id="audit-form-section" className="py-20 md:py-28 bg-brand-pure-white px-4 md:px-8 text-left border-t border-brand-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
              Audit Opportunity
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4 mb-4">
              Get a Free Digital Presence Audit
            </h2>
            <p className="text-brand-secondary text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              We will personally audit your business website, graphics consistency, page speed, and social reels to identify exactly where you are losing customers.
            </p>
          </div>

          <form onSubmit={handleAuditSubmit} className="bg-brand-warm-bg rounded-3xl p-6 md:p-10 border border-brand-border shadow-soft-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={auditForm.fullName}
                  onChange={handleAuditChange}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={auditForm.businessName}
                  onChange={handleAuditChange}
                  placeholder="e.g. Pizza House BD"
                  className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={auditForm.email}
                  onChange={handleAuditChange}
                  placeholder="e.g. tanvir@gmail.com"
                  className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">WhatsApp Number *</label>
                <input
                  type="text"
                  name="whatsapp"
                  required
                  value={auditForm.whatsapp}
                  onChange={handleAuditChange}
                  placeholder="e.g. 01712345678"
                  className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">Website URL or Facebook Page</label>
                <input
                  type="text"
                  name="websiteUrl"
                  value={auditForm.websiteUrl}
                  onChange={handleAuditChange}
                  placeholder="e.g. facebook.com/pizzahouse"
                  className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">Service You Need Most</label>
                <select
                  name="serviceNeeded"
                  value={auditForm.serviceNeeded}
                  onChange={handleAuditChange}
                  className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none transition-colors font-medium"
                >
                  <option>Website Development</option>
                  <option>Graphic Design</option>
                  <option>Video Editing</option>
                  <option>Social Media Management</option>
                  <option>Complete Digital Solution</option>
                  <option>Not Sure</option>
                </select>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-brand-dark mb-2">Your Business Message / Goals</label>
              <textarea
                name="message"
                value={auditForm.message}
                onChange={handleAuditChange}
                placeholder="Tell us briefly about your business goals or main pain points..."
                rows={4}
                className="w-full px-4 py-3 text-xs bg-brand-pure-white rounded-xl border border-brand-border focus:border-brand-primary outline-none transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={auditLoading}
              className="w-full py-4 bg-brand-primary text-brand-pure-white font-bold rounded-xl shadow-lg hover:bg-brand-coral transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {auditLoading ? 'Processing your request...' : 'Get My Free Audit'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 13. FAQ ACCORDION */}
      {faqs.length > 0 && (
        <section className="py-20 bg-brand-warm-bg px-4 md:px-8 border-t border-brand-border text-left">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
                Common Questions
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mt-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {faqs.map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-brand-pure-white rounded-2xl border border-brand-border overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                      className="w-full p-5 flex justify-between items-center text-left font-bold text-sm text-brand-dark hover:text-brand-primary transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-brand-primary' : 'text-brand-secondary'}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-brand-secondary leading-relaxed border-t border-brand-warm-bg">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 14. FINAL CTA */}
      <section className="py-20 bg-gradient-to-tr from-brand-primary to-brand-coral text-brand-pure-white text-center relative overflow-hidden px-4 md:px-8">
        <div className="hidden md:block absolute top-0 left-0 w-64 h-64 bg-brand-pure-white opacity-5 rounded-full filter blur-xl -translate-x-1/2"></div>
        <div className="hidden md:block absolute bottom-0 right-0 w-80 h-80 bg-brand-pure-white opacity-5 rounded-full filter blur-2xl translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Ready to Build a Stronger Digital Presence?
          </h2>
          <p className="text-brand-soft-red text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Tell us about your business today and let’s create professional websites, layouts, and reels that help your brand stand out and scale up.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigateTo('/free-audit')}
              className="w-full sm:w-auto px-8 py-4 bg-brand-pure-white text-brand-primary font-bold rounded-full shadow-lg hover:scale-105 transition-all cursor-pointer text-center"
            >
              Book a Free Consultation
            </button>
            {data?.settings?.whatsapp && (
              <a
                href={`https://wa.me/${data.settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-brand-dark bg-opacity-35 text-brand-pure-white hover:bg-opacity-50 border border-brand-pure-white border-opacity-3 bg-opacity-20 font-bold rounded-full transition-all text-center flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-brand-pure-white fill-brand-pure-white" />
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
