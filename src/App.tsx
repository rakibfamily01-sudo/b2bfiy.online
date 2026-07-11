import { useState, useEffect } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { SiteData } from './types';

// Importing landing page sections
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import ClientLogos from './components/ClientLogos';
import Stats from './components/Stats';
import VideoPortfolio from './components/VideoPortfolio';
import GraphicsPortfolio from './components/GraphicsPortfolio';
import WebPortfolio from './components/WebPortfolio';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Admin Panel
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'midnight' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'midnight') ? saved : 'midnight';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-midnight');
      body.classList.add('theme-light');
      body.classList.remove('theme-midnight');
    } else {
      root.classList.add('theme-midnight');
      root.classList.remove('theme-light');
      body.classList.add('theme-midnight');
      body.classList.remove('theme-light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'midnight' ? 'light' : 'midnight');
  };

  // Check route on load & hash changes
  useEffect(() => {
    const handleRouteCheck = () => {
      const isConsolePath = window.location.pathname === '/admin' || window.location.hash === '#admin';
      setIsAdminMode(isConsolePath);
    };

    handleRouteCheck();
    window.addEventListener('popstate', handleRouteCheck);
    window.addEventListener('hashchange', handleRouteCheck);

    return () => {
      window.removeEventListener('popstate', handleRouteCheck);
      window.removeEventListener('hashchange', handleRouteCheck);
    };
  }, []);

  // Fetch all database site content dynamically from our API proxy
  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const response = await fetch('/api/site-data');
        if (response.ok) {
          const data = await response.json();
          setSiteData(data);
          
          // Set favicon dynamically
          if (data.site_settings?.favicon_url) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = data.site_settings.favicon_url;
          }
          
          // Set site title dynamically
          if (data.site_settings?.site_name) {
            document.title = `${data.site_settings.site_name} | Top Digital Agency`;
          }
        }
      } catch (err) {
        console.error('Error fetching site data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteData();
  }, []);

  const navigateToHome = () => {
    window.history.pushState(null, '', '/');
    setIsAdminMode(false);
  };

  // 1. Loader visual state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030408] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <span className="text-sm font-mono text-gray-500 tracking-widest uppercase animate-pulse">
          Loading B2Ofiy Digital Assets...
        </span>
      </div>
    );
  }

  // Fallback default state just in case
  if (!siteData) {
    return (
      <div className="min-h-screen bg-[#030408] flex items-center justify-center text-red-400">
        Database connection failed. Please restart the dev server.
      </div>
    );
  }

  // 2. Admin mode views
  if (isAdminMode) {
    return (
      <AdminPanel onBackToHome={navigateToHome} />
    );
  }

  // 3. Immersive Agency homepage landing layout
  return (
    <div className={`min-h-screen bg-[#030408] text-white selection:bg-indigo-500/30 selection:text-white ${theme === 'light' ? 'theme-light' : 'theme-midnight'}`}>
      {/* Dynamic Header navbar */}
      <Header 
        settings={siteData.site_settings} 
        onNavigateToAdmin={() => { window.location.hash = '#admin'; }} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main visual layouts */}
      <main>
        {/* Dynamic Hero Banner */}
        <Hero settings={siteData.site_settings} />

        {/* Infinite Marquee partner client list */}
        <ClientLogos logos={siteData.client_logos} />

        {/* Counter Stats Section */}
        <Stats settings={siteData.site_settings} />

        {/* Dynamic Interactive Services & Modal sub-tasks */}
        <Services services={siteData.services} details={siteData.service_details} />

        {/* High-end cinematic video categories and portfolios */}
        <VideoPortfolio categories={siteData.video_categories} videos={siteData.video_portfolio} />

        {/* Dynamic graphics slideshow and view-all externals */}
        <GraphicsPortfolio graphics={siteData.graphics_portfolio} settings={siteData.graphics_settings} />

        {/* Dynamic Web Development Project screens */}
        <WebPortfolio webItems={siteData.web_portfolio} />

        {/* Customer reviews dynamic carousel */}
        <Reviews reviews={siteData.reviews} />

        {/* Contact Submission & dynamic office settings */}
        <Contact settings={siteData.site_settings} services={siteData.services} />
      </main>

      {/* Footer copyright row and quick links */}
      <Footer settings={siteData.site_settings} />

      {/* Floating Action WhatsApp with auto-linking and back to top */}
      <WhatsAppButton settings={siteData.site_settings} />
    </div>
  );
}
