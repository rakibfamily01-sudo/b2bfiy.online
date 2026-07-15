import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useApp } from '../../components/AppContext';
import { Search, ChevronRight, LayoutGrid, Calendar, SlidersHorizontal } from 'lucide-react';

export default function Portfolio() {
  const { data, navigateTo } = useApp();
  const projects = data?.portfolio_projects || [];
  const categories = data?.portfolio_categories || [];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const settings = data?.settings;
  const isGraphicsSelected = selectedCategory === 'cat2' || 
    categories.find(c => c.id === selectedCategory)?.slug?.includes('graphic') ||
    categories.find(c => c.id === selectedCategory)?.name?.toLowerCase()?.includes('graphic');

  // Client-side dynamic search and tag filtering
  const filteredProjects = projects.filter((project) => {
    const matchesCategory = selectedCategory === 'all' || project.categoryId === selectedCategory;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchLower) ||
      project.clientName.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      project.tags.some(t => t.toLowerCase().includes(searchLower)) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  return (
    <Layout title="Creative Portfolio" description="Browse the B2bfiy portfolio showcase of recent high-converting websites, creative post designs, short videos, and complete client marketing projects.">
      {/* HERO SECTION */}
      <section className="py-20 bg-brand-light-bg border-b border-brand-border px-4 md:px-8 text-left">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 bg-brand-soft-red text-brand-primary text-xs font-bold uppercase rounded-full mb-4">
            Our Case Studies
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight mb-6">
            Real Creative Work. Real Business Growth.
          </h1>
          <p className="text-brand-secondary text-sm md:text-base leading-relaxed max-w-2xl">
            Explore our curated portfolio of designs, clips, and web applications. We treat every project as a growth campaign designed to look premium and drive real revenue.
          </p>
        </div>
      </section>

      {/* FILTER & SEARCH CONTROL BLOCK */}
      <section className="py-10 bg-brand-warm-bg border-b border-brand-border px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
          
          {/* Categories select pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-brand-primary text-brand-pure-white shadow-md'
                  : 'bg-brand-pure-white text-brand-secondary border border-brand-border hover:bg-brand-soft-red hover:text-brand-primary'
              }`}
            >
              All Works ({projects.length})
            </button>
            {categories.map((cat) => {
              const count = projects.filter(p => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-brand-primary text-brand-pure-white shadow-md'
                      : 'bg-brand-pure-white text-brand-secondary border border-brand-border hover:bg-brand-soft-red hover:text-brand-primary'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search box input */}
          <div className="relative max-w-md w-full shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary opacity-70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, title, technology..."
              className="w-full pl-11 pr-4 py-3 bg-brand-pure-white border border-brand-border rounded-full text-xs focus:border-brand-primary outline-none transition-colors shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* PORTFOLIO GRID CASE STUDIES */}
      <section className="py-20 bg-brand-pure-white px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length > 0 ? (
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
                      <span className="absolute top-4 left-4 bg-brand-primary text-brand-pure-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow border border-brand-primary">
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

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] px-2.5 py-0.5 bg-brand-warm-bg border border-brand-border text-brand-secondary rounded-full font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="h-px bg-brand-border my-4"></div>

                    <span className="text-xs font-bold text-brand-primary flex items-center gap-1 group-hover:underline">
                      View Project Case Study <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-brand-warm-bg rounded-3xl border border-brand-border max-w-md mx-auto">
              <p className="text-sm font-bold text-brand-dark mb-1">No Case Studies Found</p>
              <p className="text-xs text-brand-secondary">Try searching with a different keyword or selecting a different category.</p>
            </div>
          )}

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
    </Layout>
  );
}
