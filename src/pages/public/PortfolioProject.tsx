import React from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../components/AppContext';
import { Calendar, Briefcase, Globe, Video, List, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';

export default function PortfolioProject() {
  const { data, routeParams, navigateTo } = useApp();
  const slug = routeParams.slug;
  const projects = data?.portfolio_projects || [];
  
  // Find project matching active slug
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    return (
      <Layout title="Project Not Found">
        <div className="py-24 text-center">
          <h2 className="text-2xl font-extrabold text-brand-dark mb-4">Case Study Not Found</h2>
          <p className="text-brand-secondary text-sm mb-6">The project slug you requested does not exist or may have been unpublished by our admin.</p>
          <button 
            onClick={() => navigateTo('/portfolio')}
            className="px-6 py-2.5 bg-brand-primary text-brand-pure-white text-xs font-bold rounded-full"
          >
            Back to Portfolio
          </button>
        </div>
      </Layout>
    );
  }

  // YouTube / Vimeo embed URL extractor helper
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('vimeo.com/')) {
      videoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getEmbedUrl(project.videoUrl);

  return (
    <Layout title={project.title} description={project.description}>
      {/* HEADER SECTION */}
      <section className="py-16 md:py-24 bg-brand-light-bg border-b border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigateTo('/portfolio')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary mb-6 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <span className="text-xs font-bold text-brand-primary bg-brand-soft-red px-3 py-1 rounded-full border border-brand-border">
                {project.serviceType}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight mt-4 mb-6">
                {project.title}
              </h1>
              <p className="text-brand-secondary text-sm md:text-base leading-relaxed max-w-2xl">
                {project.description}
              </p>
            </div>

            {/* Quick Specs card */}
            <div className="lg:col-span-4 bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card w-full">
              <h4 className="font-bold text-sm text-brand-dark border-b border-brand-warm-bg pb-3 mb-4">Project Overview</h4>
              <ul className="flex flex-col gap-4 text-xs">
                <li className="flex items-center gap-3">
                  <Briefcase className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                  <div>
                    <span className="block text-[10px] text-brand-secondary font-semibold">Client Name</span>
                    <span className="font-bold text-brand-dark">{project.clientName}</span>
                  </div>
                </li>
                {project.date && (
                  <li className="flex items-center gap-3">
                    <Calendar className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] text-brand-secondary font-semibold">Launch Date</span>
                      <span className="font-bold text-brand-dark">{new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </li>
                )}
                {project.websiteUrl && (
                  <li className="flex items-center gap-3">
                    <Globe className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] text-brand-secondary font-semibold">Live Project</span>
                      <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-primary hover:underline flex items-center gap-1">
                        Visit Website <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CORE DISPLAY (VIDEO EMBED OR HERO IMAGE) */}
      <section className="py-12 bg-brand-warm-bg px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {embedUrl ? (
            <div className="w-full aspect-video rounded-[32px] overflow-hidden border border-brand-border shadow-lg bg-brand-dark">
              <iframe
                src={embedUrl}
                title="Project Video Presentation"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="w-full rounded-[32px] overflow-hidden border border-brand-border shadow-lg aspect-[21/9] max-h-[500px] bg-brand-light-bg">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      </section>

      {/* CASE STUDY NARRATIVE DETAILS */}
      <section className="py-16 bg-brand-pure-white px-4 md:px-8 text-left">
        <div className="max-w-4xl mx-auto">
          {/* Challenge and Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-extrabold text-brand-dark border-l-4 border-brand-primary pl-3 mb-4">
                The Client Challenge
              </h3>
              <p className="text-brand-secondary text-xs md:text-sm leading-relaxed whitespace-pre-line">
                {project.challenge || 'No challenge description was provided for this case study.'}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-brand-dark border-l-4 border-brand-success pl-3 mb-4">
                Our Solution
              </h3>
              <p className="text-brand-secondary text-xs md:text-sm leading-relaxed whitespace-pre-line">
                {project.solution || 'No solution description was provided for this case study.'}
              </p>
            </div>
          </div>

          {/* Process and Results */}
          <div className="grid grid-cols-1 gap-12 mb-12">
            {project.process && (
              <div>
                <h3 className="text-xl font-extrabold text-brand-dark border-l-4 border-brand-coral pl-3 mb-4">
                  The Creative Process
                </h3>
                <p className="text-brand-secondary text-xs md:text-sm leading-relaxed whitespace-pre-line bg-brand-warm-bg rounded-2xl p-6 border border-brand-border">
                  {project.process}
                </p>
              </div>
            )}

            {project.result && (
              <div>
                <h3 className="text-xl font-extrabold text-brand-dark border-l-4 border-brand-success pl-3 mb-4">
                  The End Outcome & Results
                </h3>
                <p className="text-brand-secondary text-xs md:text-sm leading-relaxed whitespace-pre-line bg-green-50 text-green-900 rounded-2xl p-6 border border-green-200">
                  {project.result}
                </p>
              </div>
            )}
          </div>

          {/* Stacks and Tags */}
          <div className="border-t border-brand-border pt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {project.technologies.length > 0 && (
              <div>
                <h5 className="font-bold text-xs text-brand-dark uppercase tracking-wider mb-3">Technologies / Tools</h5>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="text-xs px-3.5 py-1.5 bg-brand-light-bg border border-brand-border text-brand-primary rounded-xl font-bold">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.tags.length > 0 && (
              <div>
                <h5 className="font-bold text-xs text-brand-dark uppercase tracking-wider mb-3">Target Tags</h5>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-3.5 py-1.5 bg-brand-warm-bg border border-brand-border text-brand-secondary rounded-xl font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Secondary Gallery Images */}
          {project.images.length > 1 && (
            <div className="border-t border-brand-border pt-12 mt-12">
              <h3 className="text-xl font-extrabold text-brand-dark mb-6">Additional Project Previews</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {project.images.map((img, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-brand-border shadow-sm aspect-[4/3] bg-brand-warm-bg">
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* NEXT STEP CTA */}
      <section className="py-16 bg-brand-light-bg text-center px-4 border-t border-brand-border">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-black text-brand-dark mb-3">Inspired by this Case Study?</h3>
          <p className="text-brand-secondary text-xs md:text-sm mb-6 leading-relaxed">Let's build a powerful online presence tailored specifically to grow your business prospects today.</p>
          <button
            onClick={() => navigateTo('/free-audit')}
            className="px-8 py-3.5 bg-brand-primary text-brand-pure-white font-bold rounded-full shadow-md hover:bg-brand-coral hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Get a Free Digital Audit
          </button>
        </div>
      </section>
    </Layout>
  );
}
