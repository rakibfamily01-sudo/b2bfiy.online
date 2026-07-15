import React, { useEffect } from 'react';
import { useApp } from './AppContext';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Layout({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) {
  const { toast, data } = useApp();
  const settings = data?.settings;

  // Sync document meta tags dynamically
  useEffect(() => {
    const finalTitle = title 
      ? `${title} | ${settings?.name || 'B2bfiy'}` 
      : (settings?.defaultSeoTitle || 'B2bfiy - Digital Creative & Growth Agency');
    
    document.title = finalTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || settings?.defaultMetaDescription || '');
    }
  }, [title, description, settings]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-warm-bg overflow-x-hidden relative">
      <TopBar />
      <Header />
      
      {/* Animated view entrance */}
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      <Footer />

      {/* Floating System Notification Toast */}
      <AnimatePresence>
        {toast.type && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-brand-pure-white rounded-2xl shadow-xl border border-brand-border p-4 flex items-start gap-3.5"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-brand-success shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-brand-primary shrink-0 mt-0.5" />
            )}
            <div className="flex-grow">
              <h5 className="font-bold text-sm text-brand-dark">
                {toast.type === 'success' ? 'Success' : 'Notification'}
              </h5>
              <p className="text-xs text-brand-secondary leading-relaxed mt-0.5">
                {toast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
