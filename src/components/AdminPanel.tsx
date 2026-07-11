import React, { useState, useEffect } from 'react';
import {
  LogOut, Settings, Users, Palette, Video, Code, TrendingUp,
  Image as ImageIcon, Layout, FileText, Plus, Trash, Edit, Check,
  Loader2, Upload, Eye, EyeOff, Star, Shield, ArrowLeft, Menu, X, CheckSquare, Square, ChevronDown
} from 'lucide-react';
import {
  SiteSettings, Service, ServiceDetail, ClientLogo,
  VideoCategory, VideoPortfolio as VideoItem, GraphicsPortfolio as GraphicsItem,
  WebPortfolio as WebItem, Review, ContactSubmission, SiteData
} from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import defaultDbData from '../../data/db.json';

interface AdminPanelProps {
  onBackToHome: () => void;
}

type TabType = 'general' | 'services' | 'logos' | 'videos' | 'graphics' | 'web' | 'reviews' | 'contacts' | 'account';

export default function AdminPanel({ onBackToHome }: AdminPanelProps) {
  const [token, setToken] = useState<string>(localStorage.getItem('admin_token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Raw fetched DB structure
  const [allData, setAllData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Status message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Supabase Cloud Sync States
  const [isSyncingPush, setIsSyncingPush] = useState(false);
  const [isSyncingPull, setIsSyncingPull] = useState(false);
  const [serverSupaConfigured, setServerSupaConfigured] = useState(false);
  const [serverSupaUrl, setServerSupaUrl] = useState('');

  const fetchSupabaseServerStatus = async () => {
    if (!token || token === 'supabase-direct-token') return;
    try {
      const response = await fetch('/api/admin/supabase/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const res = await response.json();
        setServerSupaConfigured(res.configured);
        setServerSupaUrl(res.supabaseUrl);
      }
    } catch (err) {
      console.warn('Failed to fetch server-side Supabase status:', err);
    }
  };

  const saveToSupabaseIndividualClient = async (data: any): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      // 1. site_settings (upsert single record)
      await supabase.from('site_settings').upsert({
        id: 1,
        site_name: data.site_settings.site_name,
        logo_url: data.site_settings.logo_url,
        favicon_url: data.site_settings.favicon_url,
        hero_title: data.site_settings.hero_title,
        hero_subtitle: data.site_settings.hero_subtitle,
        hero_cta_text: data.site_settings.hero_cta_text,
        whatsapp_number: data.site_settings.whatsapp_number,
        footer_text: data.site_settings.footer_text,
        footer_address: data.site_settings.footer_address,
        footer_email: data.site_settings.footer_email,
        logo_display_mode: data.site_settings.logo_display_mode || 'both',
        seo_description: data.site_settings.seo_description,
        seo_keywords: data.site_settings.seo_keywords,
        og_title: data.site_settings.og_title,
        og_description: data.site_settings.og_description,
        og_image_url: data.site_settings.og_image_url,
        stat_projects_value: Number(data.site_settings.stat_projects_value || 0),
        stat_projects_label: data.site_settings.stat_projects_label,
        stat_clients_value: Number(data.site_settings.stat_clients_value || 0),
        stat_clients_label: data.site_settings.stat_clients_label,
        stat_experience_value: Number(data.site_settings.stat_experience_value || 0),
        stat_experience_label: data.site_settings.stat_experience_label,
        stat_success_value: Number(data.site_settings.stat_success_value || 0),
        stat_success_label: data.site_settings.stat_success_label,
        social_links: data.site_settings.social_links || {}
      });

      // 2. graphics_settings (upsert single record)
      await supabase.from('graphics_settings').upsert({
        id: 1,
        view_all_link: data.graphics_settings?.view_all_link || 'https://behance.net'
      });

      // Helper to clear table and insert current collection
      const syncTable = async (tableName: string, items: any[]) => {
        try {
          await supabase.from(tableName).delete().neq('id', 'dummy_id_to_clear_table');
          if (items && items.length > 0) {
            await supabase.from(tableName).insert(items);
          }
        } catch (e) {
          console.error(`Client sync table failed: ${tableName}`, e);
        }
      };

      await Promise.all([
        syncTable('admin_users', data.admin_users || []),
        syncTable('services', data.services || []),
        syncTable('service_details', data.service_details || []),
        syncTable('client_logos', data.client_logos || []),
        syncTable('video_categories', data.video_categories || []),
        syncTable('video_portfolio', data.video_portfolio || []),
        syncTable('graphics_portfolio', data.graphics_portfolio || []),
        syncTable('web_portfolio', data.web_portfolio || []),
        syncTable('reviews', data.reviews || []),
        syncTable('contact_submissions', data.contact_submissions || [])
      ]);

      return true;
    } catch (err: any) {
      console.error('Individual table client sync error:', err);
      return false;
    }
  };

  const syncFromSupabaseClient = async (): Promise<any | null> => {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const [
        adminUsersRes,
        siteSettingsRes,
        servicesRes,
        serviceDetailsRes,
        clientLogosRes,
        videoCategoriesRes,
        videoPortfolioRes,
        graphicsPortfolioRes,
        graphicsSettingsRes,
        webPortfolioRes,
        reviewsRes,
        contactSubmissionsRes
      ] = await Promise.all([
        supabase.from('admin_users').select('*'),
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('services').select('*'),
        supabase.from('service_details').select('*'),
        supabase.from('client_logos').select('*'),
        supabase.from('video_categories').select('*'),
        supabase.from('video_portfolio').select('*'),
        supabase.from('graphics_portfolio').select('*'),
        supabase.from('graphics_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('web_portfolio').select('*'),
        supabase.from('reviews').select('*'),
        supabase.from('contact_submissions').select('*')
      ]);

      const errors = [
        adminUsersRes.error,
        siteSettingsRes.error,
        servicesRes.error,
        serviceDetailsRes.error,
        clientLogosRes.error,
        videoCategoriesRes.error,
        videoPortfolioRes.error,
        graphicsPortfolioRes.error,
        graphicsSettingsRes.error,
        webPortfolioRes.error,
        reviewsRes.error,
        contactSubmissionsRes.error
      ].filter(Boolean);

      if (errors.length > 0) {
        const hasTableMissing = errors.some(e => e?.code === 'PGRST114' || e?.message?.includes('does not exist'));
        if (hasTableMissing) {
          console.log('Individual tables are not fully created yet in Supabase. Falling back...');
          return null;
        }
      }

      const site_settings = siteSettingsRes.data;
      const graphics_settings = graphicsSettingsRes.data;

      if (!site_settings && (!servicesRes.data || servicesRes.data.length === 0)) {
        console.log('Individual tables exist but are unseeded.');
        return null;
      }

      const DEFAULT_SITE_SETTINGS = {
        site_name: 'B2Bfiy Institute',
        logo_url: '',
        favicon_url: '',
        hero_title: 'Unleash Your Brand Potential',
        hero_subtitle: 'Premium Digital Agency',
        hero_cta_text: 'Get Started',
        whatsapp_number: '+8801700000000',
        footer_text: '© 2026 B2Bfiy Institute.',
        footer_address: 'Dhaka, Bangladesh',
        footer_email: 'info@b2bfiy.com',
        logo_display_mode: 'both',
        social_links: {}
      };

      const loadedData = {
        admin_users: adminUsersRes.data || [],
        site_settings: site_settings ? {
          ...site_settings,
          social_links: typeof site_settings.social_links === 'string'
            ? JSON.parse(site_settings.social_links)
            : (site_settings.social_links || {})
        } : DEFAULT_SITE_SETTINGS,
        services: servicesRes.data || [],
        service_details: serviceDetailsRes.data || [],
        client_logos: clientLogosRes.data || [],
        video_categories: videoCategoriesRes.data || [],
        video_portfolio: videoPortfolioRes.data || [],
        graphics_portfolio: graphicsPortfolioRes.data || [],
        graphics_settings: graphics_settings || { view_all_link: 'https://behance.net' },
        web_portfolio: webPortfolioRes.data || [],
        reviews: reviewsRes.data || [],
        contact_submissions: contactSubmissionsRes.data || [],
      };

      return loadedData;
    } catch (err: any) {
      console.warn('Error loading from individual Supabase tables on client:', err.message || err);
      return null;
    }
  };

  const handlePushToSupabase = async () => {
    setIsSyncingPush(true);
    try {
      if (token === 'supabase-direct-token' || isSupabaseConfigured) {
        const currentData = allData;
        if (!currentData) {
          showToast('পুশ করার মতো কোনো লোকাল ডাটা পাওয়া যায়নি।', 'error');
          setIsSyncingPush(false);
          return;
        }

        const successConfig = await saveToSupabaseDirect(currentData);
        if (!successConfig) {
          showToast('Supabase site_config টেবিলে ডাটা পুশ করতে ব্যর্থ হয়েছে।', 'error');
          setIsSyncingPush(false);
          return;
        }

        const successIndiv = await saveToSupabaseIndividualClient(currentData);
        if (!successIndiv) {
          showToast('সুপাবেস-এর অন্যান্য ইন্ডিভিজুয়াল টেবিলে ডাটা সেভ করতে ব্যর্থ হয়েছে (দয়া করে SQL স্ক্রিপ্ট রান করুন)।', 'error');
        } else {
          showToast('সরাসরি সফলভাবে Supabase Cloud-এ এবং ইন্ডিভিজুয়াল টেবিলসমূহহে ডাটা সেভ করা হয়েছে!');
        }
        setIsSyncingPush(false);
        return;
      }

      const response = await fetch('/api/admin/supabase/push', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = response.headers.get('content-type');
      if (response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          showToast(result.message || 'ডাটা সফলভাবে Supabase-এ পুশ করা হয়েছে!');
        } else {
          showToast('ডাটা সফলভাবে পুশ করা হয়েছে!');
        }
      } else {
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          showToast(result.error || 'ডাটা পুশ করতে ব্যর্থ হয়েছে।', 'error');
        } else {
          showToast(`ডাটা পুশ করতে ব্যর্থ হয়েছে (Server error: ${response.status}).`, 'error');
        }
      }
    } catch (err: any) {
      showToast('সংযোগ ব্যাহত হয়েছে।', 'error');
    } finally {
      setIsSyncingPush(false);
    }
  };

  const handlePullFromSupabase = async () => {
    if (!confirm('সুপাবেস ক্লাউড থেকে ডাটা পুল করলে লোকাল ডাটা ওভাররাইট হয়ে যাবে। আপনি কি নিশ্চিত?')) return;
    setIsSyncingPull(true);
    try {
      if (token === 'supabase-direct-token' || isSupabaseConfigured) {
        // First try to load from individual tables
        const individualData = await syncFromSupabaseClient();
        if (individualData) {
          setAllData(individualData);
          showToast('সরাসরি সফলভাবে Supabase ইন্ডিভিজুয়াল টেবিল থেকে লেটেস্ট ডাটা পুল করা হয়েছে!');
          setIsSyncingPull(false);
          return;
        }

        // Fallback to site_config
        const { data, error } = await supabase!
          .from('site_config')
          .select('data')
          .eq('id', 1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            showToast('সুপাবেস ক্লাউডে কোনো ডাটা খুঁজে পাওয়া যায়নি। প্রথমে Push Local Data চাপুন।', 'error');
          } else {
            showToast('সুপাবেস থেকে ডাটা পুল করতে ব্যর্থ হয়েছে: ' + error.message, 'error');
          }
          setIsSyncingPull(false);
          return;
        }

        if (data && data.data) {
          setAllData(data.data);
          showToast('সরাসরি সফলভাবে Supabase site_config থেকে ডাটা পুল করা হয়েছে!');
          // Sync to individual tables in background
          saveToSupabaseIndividualClient(data.data).catch(() => {});
          setIsSyncingPull(false);
          return;
        }

        showToast('সুপাবেস থেকে অকার্যকর ডাটা পাওয়া গেছে।', 'error');
        setIsSyncingPull(false);
        return;
      }

      const response = await fetch('/api/admin/supabase/pull', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = response.headers.get('content-type');
      if (response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          showToast(result.message || 'ডাটা সফলভাবে Supabase থেকে পুল করা হয়েছে!');
        } else {
          showToast('ডাটা সফলভাবে পুল করা হয়েছে!');
        }
        fetchAdminData();
      } else {
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          showToast(result.error || 'ডাটা পুল করতে ব্যর্থ হয়েছে।', 'error');
        } else {
          showToast(`ডাটা পুল করতে ব্যর্থ হয়েছে (Server error: ${response.status}).`, 'error');
        }
      }
    } catch (err: any) {
      showToast('সংযোগ ব্যাহত হয়েছে।', 'error');
    } finally {
      setIsSyncingPull(false);
    }
  };

  useEffect(() => {
    if (token && token !== 'supabase-direct-token') {
      fetchSupabaseServerStatus();
    }
  }, [token]);

  // Verification & Authentication checking on load
  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Client-side helper to hash passwords matching Node's pbkdf2Sync using native Web Crypto API
  const hashPasswordClient = async (password: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      const salt = encoder.encode('b2bfiy_secret_salt_123');
      const derivedBits = await window.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 1000,
          hash: 'SHA-512'
        },
        passwordKey,
        64 * 8 // 64 bytes = 512 bits
      );
      return Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (err) {
      console.error('Client-side hash failed, using fallback simple hash:', err);
      // Fallback simple hash just in case Web Crypto is restricted
      return password; 
    }
  };

  const fetchAdminDataDirect = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('data')
        .eq('id', 1)
        .single();
      if (!error && data && data.data) {
        setAllData(data.data);
      } else if (error) {
        if (error.code === 'PGRST116') {
          console.log('Supabase table empty. Seeding defaults...');
          const { error: seedError } = await supabase
            .from('site_config')
            .upsert({ id: 1, data: defaultDbData, updated_at: new Date().toISOString() });
          if (!seedError) {
            setAllData(JSON.parse(JSON.stringify(defaultDbData)));
          }
        } else {
          showToast('Failed to load from Supabase site_config', 'error');
        }
      }
    } catch (err) {
      console.error('Direct Supabase admin fetch error:', err);
    }
  };

  const saveToSupabaseDirect = async (updatedData: any): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert({ id: 1, data: updatedData, updated_at: new Date().toISOString() });
      if (error) {
        showToast('Supabase Save failed: ' + error.message, 'error');
        return false;
      }
      return true;
    } catch (err) {
      showToast('Supabase Connection Error', 'error');
      return false;
    }
  };

  const updateAndSave = async (updater: (draft: any) => void): Promise<boolean> => {
    if (!allData) return false;
    const cloned = JSON.parse(JSON.stringify(allData));
    updater(cloned);
    
    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await saveToSupabaseDirect(cloned);
      if (success) {
        // Run individual tables sync in the background
        saveToSupabaseIndividualClient(cloned).catch((err) => console.error('BG sync to individual tables failed:', err));
        setAllData(cloned);
        return true;
      }
      return false;
    }
    return false;
  };

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken === 'supabase-direct-token' && isSupabaseConfigured) {
      setToken('supabase-direct-token');
      setIsLoggedIn(true);
      fetchAdminDataDirect();
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setIsLoggedIn(true);
        fetchAdminData();
      } else {
        if (isSupabaseConfigured && savedToken) {
          setToken(savedToken);
          setIsLoggedIn(true);
          fetchAdminDataDirect();
        } else {
          handleLogout();
        }
      }
    } catch (err) {
      if (isSupabaseConfigured && savedToken) {
        setToken(savedToken);
        setIsLoggedIn(true);
        fetchAdminDataDirect();
      } else {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    if (token === 'supabase-direct-token' && isSupabaseConfigured) {
      await fetchAdminDataDirect();
      return;
    }

    try {
      const response = await fetch('/api/admin/all-data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAllData(data);
      } else if (isSupabaseConfigured) {
        await fetchAdminDataDirect();
      } else {
        showToast('Failed to load data from API server!', 'error');
      }
    } catch (err) {
      if (isSupabaseConfigured) {
        await fetchAdminDataDirect();
      } else {
        showToast('Failed to load data!', 'error');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    // Try Supabase direct login first if Supabase is configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaRes, error: supaErr } = await supabase
          .from('site_config')
          .select('data')
          .eq('id', 1)
          .single();
          
        let adminUsers = defaultDbData.admin_users;
        if (!supaErr && supaRes && supaRes.data && supaRes.data.admin_users) {
          adminUsers = supaRes.data.admin_users;
        }
        
        const admin = adminUsers.find((u: any) => u.username === loginUsername);
        const hashedPassword = await hashPasswordClient(loginPassword);
        
        if (admin && admin.password_hash === hashedPassword) {
          localStorage.setItem('admin_token', 'supabase-direct-token');
          setToken('supabase-direct-token');
          setIsLoggedIn(true);
          showToast('Logged in successfully (Supabase Direct)!', 'success');
          if (supaRes && supaRes.data) {
            setAllData(supaRes.data);
          } else {
            setAllData(JSON.parse(JSON.stringify(defaultDbData)));
          }
          setIsLoggingIn(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase login check failed, falling back to local server API:', err);
      }
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Login failed.');
      }

      localStorage.setItem('admin_token', result.token);
      setToken(result.token);
      setIsLoggedIn(true);
      showToast('Logged in successfully!', 'success');
      fetchAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'Incorrect username or password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (token !== 'supabase-direct-token') {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {}
    localStorage.removeItem('admin_token');
    setToken('');
    setIsLoggedIn(false);
    setAllData(null);
  };

  // Helper file uploader base64 conversion
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      if (!confirm('This file is quite large. To avoid slowing down the database, we recommend images under 1MB. Do you want to proceed?')) {
        return;
      }
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      // If in Supabase Direct Mode, use the Base64 Data URL directly!
      // This is 100% serverless, works on Vercel instantly with NO storage setup!
      if (token === 'supabase-direct-token' || isSupabaseConfigured) {
        callback(dataUrl);
        showToast('Image loaded successfully (will be saved in Cloud Database)!');
        return;
      }

      try {
        const base64 = dataUrl.split(',')[1];
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: file.name, data: base64 }),
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            callback(result.url);
            showToast('File uploaded successfully!');
          } else {
            callback(dataUrl);
            showToast('Loaded as local image (server non-JSON).');
          }
        } else {
          // Fallback to data URL
          callback(dataUrl);
          showToast('Loaded as local image.');
        }
      } catch (err: any) {
        // Fallback to data URL
        callback(dataUrl);
        showToast('Loaded as local image!');
      }
    };
  };

  // ============ FORM ACTION SUBMITTERS ============

  // 1. General & Footer site settings save
  const handleSaveSiteSettings = async (e: React.FormEvent, formData: any) => {
    e.preventDefault();
    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.site_settings = {
          ...(draft.site_settings || {}),
          ...formData,
          social_links: {
            ...(draft.site_settings?.social_links || {}),
            ...(formData.social_links || {}),
          },
        };
      });
      if (success) {
        showToast('Site settings saved successfully!');
      }
      if (token === 'supabase-direct-token') {
        return; // Always stop here for Supabase Direct mode
      }
    }

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast('Site settings saved successfully!');
        fetchAdminData();
      } else {
        showToast('Failed to update settings.', 'error');
      }
    } catch (err) {
      showToast('Failed to update settings.', 'error');
    }
  };

  // 2. Services Save / Delete
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        if (!draft.services) draft.services = [];
        if (editingService.id) {
          const idx = draft.services.findIndex((s: any) => s.id === editingService.id);
          if (idx !== -1) {
            draft.services[idx] = {
              ...draft.services[idx],
              ...editingService,
              order_index: editingService.order_index !== undefined ? Number(editingService.order_index) : draft.services[idx].order_index,
            };
          }
        } else {
          draft.services.push({
            id: 's-' + Date.now(),
            title: editingService.title,
            icon: editingService.icon || 'Palette',
            short_description: editingService.short_description || '',
            cover_image_url: editingService.cover_image_url || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
            order_index: draft.services.length + 1,
            is_active: true,
            created_at: new Date().toISOString(),
          });
        }
      });
      if (success) {
        showToast('Service saved successfully!');
        setEditingService(null);
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingService),
      });

      if (response.ok) {
        showToast('Service saved successfully!');
        setEditingService(null);
        fetchAdminData();
      } else {
        showToast('Failed to save service.', 'error');
      }
    } catch (err) {
      showToast('Failed to save service.', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service? All connected sub-tasks will be deleted as well.')) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.services = (draft.services || []).filter((s: any) => s.id !== id);
        draft.service_details = (draft.service_details || []).filter((sd: any) => sd.service_id !== id);
      });
      if (success) {
        showToast('Service deleted successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Service deleted successfully!');
        fetchAdminData();
      } else {
        showToast('Could not delete service.', 'error');
      }
    } catch (err) {
      showToast('Could not delete service.', 'error');
    }
  };

  // 2.1 Service details (subtasks) save / delete
  const [editingSubtask, setEditingSubtask] = useState<Partial<ServiceDetail> | null>(null);
  const handleSaveSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubtask?.title || !editingSubtask?.service_id) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        if (!draft.service_details) draft.service_details = [];
        if (editingSubtask.id) {
          const idx = draft.service_details.findIndex((sd: any) => sd.id === editingSubtask.id);
          if (idx !== -1) {
            draft.service_details[idx] = {
              ...draft.service_details[idx],
              ...editingSubtask,
              order_index: editingSubtask.order_index !== undefined ? Number(editingSubtask.order_index) : draft.service_details[idx].order_index,
            };
          }
        } else {
          draft.service_details.push({
            id: 'sd-' + Date.now(),
            service_id: editingSubtask.service_id,
            title: editingSubtask.title,
            description: editingSubtask.description || '',
            order_index: draft.service_details.length + 1,
          });
        }
      });
      if (success) {
        showToast('Sub-task saved successfully!');
        setEditingSubtask(null);
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/service-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingSubtask),
      });
      if (response.ok) {
        showToast('Sub-task saved successfully!');
        setEditingSubtask(null);
        fetchAdminData();
      } else {
        showToast('Failed to save sub-task.', 'error');
      }
    } catch (err) {
      showToast('Failed to save sub-task.', 'error');
    }
  };

  const handleDeleteSubtask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sub-task?')) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.service_details = (draft.service_details || []).filter((sd: any) => sd.id !== id);
      });
      if (success) {
        showToast('Sub-task deleted successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/service-details/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Sub-task deleted successfully!');
        fetchAdminData();
      } else {
        showToast('Delete failed.', 'error');
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  // 3. Client Logos Save / Delete / Toggle
  const [editingLogo, setEditingLogo] = useState<Partial<ClientLogo> | null>(null);
  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLogo?.logo_url) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        if (!draft.client_logos) draft.client_logos = [];
        if (editingLogo.id) {
          const idx = draft.client_logos.findIndex((l: any) => l.id === editingLogo.id);
          if (idx !== -1) {
            draft.client_logos[idx] = {
              ...draft.client_logos[idx],
              ...editingLogo,
            };
          }
        } else {
          draft.client_logos.push({
            id: 'l-' + Date.now(),
            company_name: editingLogo.company_name || '',
            logo_url: editingLogo.logo_url,
            order_index: draft.client_logos.length + 1,
            is_active: true,
          });
        }
      });
      if (success) {
        showToast('Logo saved successfully!');
        setEditingLogo(null);
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/client-logos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingLogo),
      });
      if (response.ok) {
        showToast('Logo saved successfully!');
        setEditingLogo(null);
        fetchAdminData();
      } else {
        showToast('Failed to save logo.', 'error');
      }
    } catch (err) {
      showToast('Failed to save logo.', 'error');
    }
  };

  const handleDeleteLogo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this logo?')) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.client_logos = (draft.client_logos || []).filter((l: any) => l.id !== id);
      });
      if (success) {
        showToast('Logo deleted successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/client-logos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Logo deleted successfully!');
        fetchAdminData();
      } else {
        showToast('Delete failed.', 'error');
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  // 4. Video categories save / delete
  const [editingCategory, setEditingCategory] = useState<Partial<VideoCategory> | null>(null);
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    const slug = editingCategory.name.toLowerCase().replace(/\s+/g, '-');

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        if (!draft.video_categories) draft.video_categories = [];
        if (editingCategory.id) {
          const idx = draft.video_categories.findIndex((c: any) => c.id === editingCategory.id);
          if (idx !== -1) {
            draft.video_categories[idx] = {
              ...draft.video_categories[idx],
              ...editingCategory,
              slug,
            };
          }
        } else {
          draft.video_categories.push({
            id: 'vc-' + Date.now(),
            name: editingCategory.name,
            slug,
            order_index: draft.video_categories.length + 1,
            is_active: true,
          });
        }
      });
      if (success) {
        showToast('Category saved successfully!');
        setEditingCategory(null);
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/video-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...editingCategory, slug }),
      });
      if (response.ok) {
        showToast('Category saved successfully!');
        setEditingCategory(null);
        fetchAdminData();
      } else {
        showToast('Failed to save category.', 'error');
      }
    } catch (err) {
      showToast('Failed to save category.', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deleting this category will delete all video portfolios under it. Are you sure?')) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.video_categories = (draft.video_categories || []).filter((c: any) => c.id !== id);
        draft.video_portfolio = (draft.video_portfolio || []).filter((v: any) => v.category_id !== id);
      });
      if (success) {
        showToast('Category deleted successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/video-categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Category deleted successfully!');
        fetchAdminData();
      } else {
        showToast('Delete failed.', 'error');
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  // 5. Video portfolio save / delete
  const [editingVideo, setEditingVideo] = useState<Partial<VideoItem> | null>(null);
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo?.video_url || !editingVideo?.thumbnail_url || !editingVideo?.category_id) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        if (!draft.video_portfolio) draft.video_portfolio = [];
        if (editingVideo.id) {
          const idx = draft.video_portfolio.findIndex((v: any) => v.id === editingVideo.id);
          if (idx !== -1) {
            draft.video_portfolio[idx] = {
              ...draft.video_portfolio[idx],
              ...editingVideo,
            };
          }
        } else {
          draft.video_portfolio.push({
            id: 'vp-' + Date.now(),
            category_id: editingVideo.category_id,
            title: editingVideo.title || '',
            thumbnail_url: editingVideo.thumbnail_url,
            video_url: editingVideo.video_url,
            order_index: draft.video_portfolio.length + 1,
            is_active: true,
            created_at: new Date().toISOString(),
          });
        }
      });
      if (success) {
        showToast('Video portfolio saved successfully!');
        setEditingVideo(null);
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/video-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingVideo),
      });
      if (response.ok) {
        showToast('Video portfolio saved successfully!');
        setEditingVideo(null);
        fetchAdminData();
      } else {
        showToast('Failed to save video portfolio.', 'error');
      }
    } catch (err) {
      showToast('Failed to save video portfolio.', 'error');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video portfolio?')) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.video_portfolio = (draft.video_portfolio || []).filter((v: any) => v.id !== id);
      });
      if (success) {
        showToast('Video deleted successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/video-portfolio/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Video deleted successfully!');
        fetchAdminData();
      } else {
        showToast('Delete failed.', 'error');
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  // 6. Graphics portfolio single save / settings save / delete
  const [editingGraphics, setEditingGraphics] = useState<Partial<GraphicsItem> | null>(null);
  const [graphicsViewAllLink, setGraphicsViewAllLink] = useState('');

  useEffect(() => {
    if (allData?.graphics_settings?.view_all_link) {
      setGraphicsViewAllLink(allData.graphics_settings.view_all_link);
    }
  }, [allData]);

  const handleSaveGraphicsSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.graphics_settings = {
          view_all_link: graphicsViewAllLink,
        };
      });
      if (success) {
        showToast('Graphics external link updated successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/graphics-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ view_all_link: graphicsViewAllLink }),
      });
      if (response.ok) {
        showToast('Graphics external link updated successfully!');
        fetchAdminData();
      } else {
        showToast('Failed to save link.', 'error');
      }
    } catch (err) {
      showToast('Failed to save link.', 'error');
    }
  };

  const handleSaveGraphicsItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGraphics?.image_url) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        if (!draft.graphics_portfolio) draft.graphics_portfolio = [];
        if (editingGraphics.id) {
          const idx = draft.graphics_portfolio.findIndex((g: any) => g.id === editingGraphics.id);
          if (idx !== -1) {
            draft.graphics_portfolio[idx] = {
              ...draft.graphics_portfolio[idx],
              ...editingGraphics,
            };
          }
        } else {
          draft.graphics_portfolio.push({
            id: 'g-' + Date.now(),
            image_url: editingGraphics.image_url,
            title: editingGraphics.title || '',
            order_index: draft.graphics_portfolio.length + 1,
            is_active: true,
          });
        }
      });
      if (success) {
        showToast('Graphics image saved successfully!');
        setEditingGraphics(null);
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/graphics-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingGraphics),
      });
      if (response.ok) {
        showToast('Graphics image saved successfully!');
        setEditingGraphics(null);
        fetchAdminData();
      } else {
        showToast('Failed to save graphics image.', 'error');
      }
    } catch (err) {
      showToast('Failed to save graphics image.', 'error');
    }
  };

  const handleDeleteGraphicsItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.graphics_portfolio = (draft.graphics_portfolio || []).filter((g: any) => g.id !== id);
      });
      if (success) {
        showToast('Image deleted successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/graphics-portfolio/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Image deleted successfully!');
        fetchAdminData();
      } else {
        showToast('Delete failed.', 'error');
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  // 7. Web Portfolio save / delete
  const [editingWeb, setEditingWeb] = useState<Partial<WebItem> | null>(null);
  const handleSaveWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeb?.image_url || !editingWeb?.demo_link) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        if (!draft.web_portfolio) draft.web_portfolio = [];
        if (editingWeb.id) {
          const idx = draft.web_portfolio.findIndex((w: any) => w.id === editingWeb.id);
          if (idx !== -1) {
            draft.web_portfolio[idx] = {
              ...draft.web_portfolio[idx],
              ...editingWeb,
            };
          }
        } else {
          draft.web_portfolio.push({
            id: 'w-' + Date.now(),
            title: editingWeb.title || '',
            image_url: editingWeb.image_url,
            demo_link: editingWeb.demo_link,
            order_index: draft.web_portfolio.length + 1,
            is_active: true,
          });
        }
      });
      if (success) {
        showToast('Web portfolio saved successfully!');
        setEditingWeb(null);
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/web-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingWeb),
      });
      if (response.ok) {
        showToast('Web portfolio saved successfully!');
        setEditingWeb(null);
        fetchAdminData();
      } else {
        showToast('Failed to save.', 'error');
      }
    } catch (err) {
      showToast('Failed to save.', 'error');
    }
  };

  const handleDeleteWeb = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.web_portfolio = (draft.web_portfolio || []).filter((w: any) => w.id !== id);
      });
      if (success) {
        showToast('Web project deleted successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/web-portfolio/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Web project deleted successfully!');
        fetchAdminData();
      } else {
        showToast('Delete failed.', 'error');
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  // 8. Reviews Save / Delete
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview?.client_name || !editingReview?.review_text) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        if (!draft.reviews) draft.reviews = [];
        if (editingReview.id) {
          const idx = draft.reviews.findIndex((r: any) => r.id === editingReview.id);
          if (idx !== -1) {
            draft.reviews[idx] = {
              ...draft.reviews[idx],
              ...editingReview,
            };
          }
        } else {
          draft.reviews.push({
            id: 'r-' + Date.now(),
            client_name: editingReview.client_name,
            client_role: editingReview.client_role || '',
            review_text: editingReview.review_text,
            rating: editingReview.rating !== undefined ? Number(editingReview.rating) : 5,
            is_active: true,
          });
        }
      });
      if (success) {
        showToast('Review saved successfully!');
        setEditingReview(null);
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingReview),
      });
      if (response.ok) {
        showToast('Review saved successfully!');
        setEditingReview(null);
        fetchAdminData();
      } else {
        showToast('Failed to save.', 'error');
      }
    } catch (err) {
      showToast('Failed to save.', 'error');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.reviews = (draft.reviews || []).filter((r: any) => r.id !== id);
      });
      if (success) {
        showToast('Review deleted successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Review deleted successfully!');
        fetchAdminData();
      } else {
        showToast('Delete failed.', 'error');
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  // 9. Contact submissions Toggle Read / Delete
  const handleToggleContactRead = async (id: string, is_read: boolean) => {
    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        if (!draft.contact_submissions) draft.contact_submissions = [];
        const item = draft.contact_submissions.find((c: any) => c.id === id);
        if (item) {
          item.is_read = !is_read;
        }
      });
      if (success) {
        showToast('Status updated successfully.');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/contacts/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, is_read: !is_read }),
      });
      if (response.ok) {
        showToast('Status updated successfully.');
        fetchAdminData();
      } else {
        showToast('Update failed.', 'error');
      }
    } catch (err) {
      showToast('Update failed.', 'error');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this message?')) return;

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const success = await updateAndSave((draft) => {
        draft.contact_submissions = (draft.contact_submissions || []).filter((c: any) => c.id !== id);
      });
      if (success) {
        showToast('Message deleted successfully!');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast('Message deleted successfully!');
        fetchAdminData();
      } else {
        showToast('Delete failed.', 'error');
      }
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  // 10. Account Security username/password
  const [newUsername, setNewUsername] = useState('b2bfiy');
  const [newPassword, setNewPassword] = useState('');
  const handleSaveAccountSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      showToast('Both username and password are required.', 'error');
      return;
    }

    if (token === 'supabase-direct-token' || isSupabaseConfigured) {
      const hashedPassword = await hashPasswordClient(newPassword);
      const success = await updateAndSave((draft) => {
        if (!draft.admin_users) {
          draft.admin_users = [];
        }
        if (!draft.admin_users[0]) {
          draft.admin_users[0] = { id: 'admin-1' };
        }
        draft.admin_users[0].username = newUsername;
        draft.admin_users[0].password_hash = hashedPassword;
        draft.admin_users[0].updated_at = new Date().toISOString();
      });
      if (success) {
        showToast('Security credentials updated successfully!');
        setNewPassword('');
      }
      if (token === 'supabase-direct-token') {
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/account/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      if (response.ok) {
        showToast('Security credentials updated successfully!');
        setNewPassword('');
        fetchAdminData();
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const res = await response.json();
          showToast(res.error || 'Failed to update credentials.', 'error');
        } else {
          showToast(`Failed to update credentials (Server error: ${response.status}).`, 'error');
        }
      }
    } catch (err) {
      showToast('Failed to save.', 'error');
    }
  };

  // Loader View
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030408] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-gray-400 font-mono text-sm">Validating Admin Credentials...</p>
        </div>
      </div>
    );
  }

  // ============ UNAUTHORIZED LOGIN SCREEN ============
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#030408] bg-grid-pattern flex items-center justify-center px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-white/5 shadow-2xl relative bg-[#0a0b12]/60 backdrop-blur-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/15 shadow-inner">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              B2Ofiy Admin System
            </h2>
            <p className="text-gray-400 text-sm mt-2 font-mono">
              [ SECURE ACCESS PROTOCOL ]
            </p>
          </div>

          {loginError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                ADMIN USERNAME
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  SIGN IN TO CONSOLE
                </>
              )}
            </button>
          </form>

          <button
            onClick={onBackToHome}
            className="w-full mt-6 py-3 border border-white/5 hover:border-white/10 bg-white/5 text-gray-400 hover:text-white transition-colors rounded-xl text-xs font-mono flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO HOMEPAGE
          </button>
        </div>
      </div>
    );
  }

  // Fallback to avoid crashes if raw allData hasn't fetched yet
  if (!allData) {
    return (
      <div className="min-h-screen bg-[#030408] flex items-center justify-center text-gray-400">
        Loading Console Config...
      </div>
    );
  }

  const { site_settings, services, service_details, client_logos, video_categories, video_portfolio, graphics_portfolio, graphics_settings, web_portfolio, reviews, contact_submissions } = allData;

  const sidebarTabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'services', label: 'Services', icon: Layout },
    { id: 'logos', label: 'Client Logos', icon: ImageIcon },
    { id: 'videos', label: 'Video Portfolio', icon: Video },
    { id: 'graphics', label: 'Graphic Designs', icon: Palette },
    { id: 'web', label: 'Web Projects', icon: Code },
    { id: 'reviews', label: 'Client Reviews', icon: Users },
    { id: 'contacts', label: 'Messages', icon: FileText, count: contact_submissions.filter((s: any) => !s.is_read).length },
    { id: 'account', label: 'Account Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#06070c] text-gray-100 flex flex-col">
      
      {/* Toast Alert message banner */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl animate-bounce ${
          toast.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/15 border-red-500/20 text-red-400'
        }`}>
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Admin Dashboard header */}
      <header className="sticky top-0 bg-[#090a10]/80 backdrop-blur-xl border-b border-white/5 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 text-gray-400 hover:text-white lg:hidden border border-white/5 rounded-lg bg-white/5"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-500" />
            <h1 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-tight">
              B2Ofiy Dashboard
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
              CONSOLE v2.4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs rounded-xl cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            VISIT SITE
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 border border-red-500/10 text-red-400 hover:text-white font-mono text-xs rounded-xl cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main dashboard Workspace */}
      <div className="flex flex-1 relative">
        
        {/* Sidebar Nav (Left pane) */}
        <aside className={`fixed inset-y-0 left-0 top-[69px] w-64 bg-[#090a10]/95 border-r border-white/5 z-20 transition-transform duration-300 transform lg:translate-x-0 lg:static ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 flex flex-col h-full justify-between gap-4">
            <nav className="space-y-1">
              {sidebarTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-mono font-bold shadow-lg shadow-indigo-500/25">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-[10px] font-mono text-gray-500">SIGNED IN AS</p>
              <p className="text-xs font-semibold text-white mt-1 font-mono">admin@b2bfiy</p>
            </div>
          </div>
        </aside>

        {/* Dynamic content rendering workspace area */}
        <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
          
          {/* TAB 1: SITE-WIDE GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-white">General Site Settings</h2>
                  <p className="text-gray-400 text-sm mt-1">Site name, logo, hero banner text, and contact configuration.</p>
                </div>
              </div>

              {/* SUPABASE CLOUD DATABASE SYNC CONTROL PANEL */}
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${serverSupaConfigured || isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      Supabase Cloud Database Sync
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {serverSupaConfigured || isSupabaseConfigured 
                        ? `Connected to Supabase project: ${serverSupaUrl || 'Direct Link'}` 
                        : 'সুপাবেস ডাটাবেস এখনও সংযুক্ত নয়। ডাটা ক্লাউডে সেভ করতে .env ফাইলে credentials দিন।'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isSyncingPush || !(serverSupaConfigured || isSupabaseConfigured)}
                      onClick={handlePushToSupabase}
                      className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {isSyncingPush ? 'ডাটা পাঠানো হচ্ছে...' : 'Push Local Data (সুপাবেস-এ সেভ করুন)'}
                    </button>
                    <button
                      type="button"
                      disabled={isSyncingPull || !(serverSupaConfigured || isSupabaseConfigured)}
                      onClick={handlePullFromSupabase}
                      className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {isSyncingPull ? 'ডাটা আনা হচ্ছে...' : 'Pull Cloud Data (সুপাবেস থেকে লোড করুন)'}
                    </button>
                  </div>
                </div>

                {!(serverSupaConfigured || isSupabaseConfigured) && (
                  <div className="rounded-xl bg-black/40 border border-white/5 p-4 space-y-3">
                    <p className="text-xs text-amber-300 leading-relaxed font-mono">
                      ⚠️ Supabase is not connected yet! To persist your data permanently on Supabase, configure your deployment with the following environment variables:
                    </p>
                    <pre className="text-[10px] font-mono text-gray-400 bg-black/50 p-3 rounded border border-white/5 overflow-x-auto select-all">
{`SUPABASE_URL="your-supabase-url"
SUPABASE_KEY="your-supabase-service-role-key"
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"`}
                    </pre>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      এবং নিশ্চিত করুন যে আপনি Supabase SQL Editor-এ <code className="text-indigo-300 bg-white/5 px-1 py-0.5 rounded font-mono">supabase_setup.sql</code> ফাইলের কোডটি রান করেছেন।
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={(e) => handleSaveSiteSettings(e, site_settings)} className="space-y-6 rounded-2xl glass-card border border-white/5 p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Site Name</label>
                    <input
                      type="text"
                      defaultValue={site_settings.site_name}
                      onChange={(e) => { site_settings.site_name = e.target.value; }}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">WhatsApp Number (with country code)</label>
                    <input
                      type="text"
                      defaultValue={site_settings.whatsapp_number}
                      onChange={(e) => { site_settings.whatsapp_number = e.target.value; }}
                      placeholder="+8801700000000"
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                  {/* Logo Upload helper */}
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Site Logo</label>
                    <div className="flex items-center gap-4">
                      {site_settings.logo_url && (
                        <div className="w-16 h-12 bg-[#0c0e17] rounded-lg p-2 border border-white/5 flex items-center justify-center">
                          <img src={site_settings.logo_url} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => { site_settings.logo_url = url; setAllData({ ...allData }); })}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Favicon Upload helper */}
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Favicon</label>
                    <div className="flex items-center gap-4">
                      {site_settings.favicon_url && (
                        <div className="w-12 h-12 bg-[#0c0e17] rounded-lg p-2 border border-white/5 flex items-center justify-center">
                          <img src={site_settings.favicon_url} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Favicon
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => { site_settings.favicon_url = url; setAllData({ ...allData }); })}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
                    Logo Display Style (লোগো প্রদর্শনের ধরন)
                  </label>
                  <select
                    value={site_settings.logo_display_mode || 'graphic'}
                    onChange={(e) => { 
                      site_settings.logo_display_mode = e.target.value; 
                      setAllData({ ...allData });
                    }}
                    className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="graphic">Website/Graphic Logo Only (শুধু গ্রাফিক লোগো)</option>
                    <option value="text">Text Logo Only (শুধু টেক্সট লোগো - B2Ofiy)</option>
                    <option value="both">Both Together (দুইটিই একসাথে - গ্রাফিক + টেক্সট)</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2 font-sans">
                    * এই অপশনটির মাধ্যমে আপনি আপনার ওয়েবসাইটের লোগো প্রদর্শন নিয়ন্ত্রণ করতে পারবেন। (ওয়েবসাইট/গ্রাফিক লোগো, টেক্সট লোগো অথবা উভয় একসাথে প্রদর্শন করা সম্ভব)
                  </p>
                </div>

                <div className="space-y-6 border-t border-white/5 pt-6">
                  <h3 className="text-base font-bold text-white">Hero Banner Text</h3>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Headline</label>
                    <input
                      type="text"
                      defaultValue={site_settings.hero_title}
                      onChange={(e) => { site_settings.hero_title = e.target.value; }}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Subtitle</label>
                    <textarea
                      defaultValue={site_settings.hero_subtitle}
                      onChange={(e) => { site_settings.hero_subtitle = e.target.value; }}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">CTA Button Text</label>
                    <input
                      type="text"
                      defaultValue={site_settings.hero_cta_text}
                      onChange={(e) => { site_settings.hero_cta_text = e.target.value; }}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-6 border-t border-white/5 pt-6">
                  <h3 className="text-base font-bold text-white">Footer & Contact Information</h3>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Footer Bio Text</label>
                    <input
                      type="text"
                      defaultValue={site_settings.footer_text}
                      onChange={(e) => { site_settings.footer_text = e.target.value; }}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Office Address</label>
                      <input
                        type="text"
                        defaultValue={site_settings.footer_address}
                        onChange={(e) => { site_settings.footer_address = e.target.value; }}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Official Email</label>
                      <input
                        type="email"
                        defaultValue={site_settings.footer_email}
                        onChange={(e) => { site_settings.footer_email = e.target.value; }}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 border-t border-white/5 pt-6">
                  <h3 className="text-base font-bold text-white">Social Media Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Facebook URL</label>
                      <input
                        type="url"
                        defaultValue={site_settings.social_links.facebook}
                        onChange={(e) => { site_settings.social_links.facebook = e.target.value; }}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Instagram URL</label>
                      <input
                        type="url"
                        defaultValue={site_settings.social_links.instagram}
                        onChange={(e) => { site_settings.social_links.instagram = e.target.value; }}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">LinkedIn URL</label>
                      <input
                        type="url"
                        defaultValue={site_settings.social_links.linkedin}
                        onChange={(e) => { site_settings.social_links.linkedin = e.target.value; }}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">YouTube URL</label>
                      <input
                        type="url"
                        defaultValue={site_settings.social_links.youtube}
                        onChange={(e) => { site_settings.social_links.youtube = e.target.value; }}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 border-t border-white/5 pt-6">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    SEO & Open Graph Meta Tags (এসইও ও সোশ্যাল শেয়ার সেটিংস)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">SEO Description (ওয়েবসাইটের বিবরণ)</label>
                      <textarea
                        defaultValue={site_settings.seo_description || ''}
                        onChange={(e) => { site_settings.seo_description = e.target.value; }}
                        placeholder="Google সার্চের জন্য ওয়েবসাইটের মূল বিবরণ লিখুন..."
                        rows={3}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">SEO Keywords (কীওয়ার্ডসমূহ - কমা দিয়ে আলাদা করুন)</label>
                      <textarea
                        defaultValue={site_settings.seo_keywords || ''}
                        onChange={(e) => { site_settings.seo_keywords = e.target.value; }}
                        placeholder="agency, video editing, graphics design, web development"
                        rows={3}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Open Graph Title (সোশ্যাল মিডিয়া টাইটেল)</label>
                      <input
                        type="text"
                        defaultValue={site_settings.og_title || ''}
                        onChange={(e) => { site_settings.og_title = e.target.value; }}
                        placeholder="Facebook/Twitter-এ লিংক শেয়ার করলে যে টাইটেল দেখাবে..."
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Open Graph Description (সোশ্যাল মিডিয়া বিবরণ)</label>
                      <input
                        type="text"
                        defaultValue={site_settings.og_description || ''}
                        onChange={(e) => { site_settings.og_description = e.target.value; }}
                        placeholder="Facebook/Twitter-এ লিংক শেয়ার করলে যে বর্ণনা দেখাবে..."
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-6">
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Open Graph Image (লিংক শেয়ারের ব্যানার ইমেজ)</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={site_settings.og_image_url || ''}
                        onChange={(e) => { 
                          site_settings.og_image_url = e.target.value;
                          setAllData({ ...allData });
                        }}
                        placeholder="https://example.com/banner.png বা নিচের বাটন দিয়ে আপলোড করুন"
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <div className="flex items-center gap-4">
                        {site_settings.og_image_url && (
                          <div className="w-24 h-16 bg-[#0c0e17] rounded-lg p-1 border border-white/5 flex items-center justify-center">
                            <img src={site_settings.og_image_url} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">
                          <Upload className="w-4 h-4" />
                          Upload Social Banner
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => { 
                              site_settings.og_image_url = url; 
                              setAllData({ ...allData }); 
                            })}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 border-t border-white/5 pt-6">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Statistics & Counter Metrics (পরিসংখ্যান ও কাউন্টার সেটিং)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Projects Completed */}
                    <div className="space-y-3 p-4 rounded-2xl border border-white/5 bg-[#090a10]/40">
                      <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider block">Statistic #1</span>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Value (সংখ্যা)</label>
                        <input
                          type="number"
                          defaultValue={site_settings.stat_projects_value !== undefined ? site_settings.stat_projects_value : 250}
                          onChange={(e) => { site_settings.stat_projects_value = Number(e.target.value); }}
                          className="w-full px-3 py-2 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Label (নাম)</label>
                        <input
                          type="text"
                          defaultValue={site_settings.stat_projects_label || 'Projects Completed'}
                          onChange={(e) => { site_settings.stat_projects_label = e.target.value; }}
                          className="w-full px-3 py-2 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Happy Clients */}
                    <div className="space-y-3 p-4 rounded-2xl border border-white/5 bg-[#090a10]/40">
                      <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider block">Statistic #2</span>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Value (সংখ্যা)</label>
                        <input
                          type="number"
                          defaultValue={site_settings.stat_clients_value !== undefined ? site_settings.stat_clients_value : 65}
                          onChange={(e) => { site_settings.stat_clients_value = Number(e.target.value); }}
                          className="w-full px-3 py-2 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Label (নাম)</label>
                        <input
                          type="text"
                          defaultValue={site_settings.stat_clients_label || 'Happy Clients'}
                          onChange={(e) => { site_settings.stat_clients_label = e.target.value; }}
                          className="w-full px-3 py-2 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Years Experience */}
                    <div className="space-y-3 p-4 rounded-2xl border border-white/5 bg-[#090a10]/40">
                      <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider block">Statistic #3</span>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Value (সংখ্যা)</label>
                        <input
                          type="number"
                          defaultValue={site_settings.stat_experience_value !== undefined ? site_settings.stat_experience_value : 8}
                          onChange={(e) => { site_settings.stat_experience_value = Number(e.target.value); }}
                          className="w-full px-3 py-2 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Label (নাম)</label>
                        <input
                          type="text"
                          defaultValue={site_settings.stat_experience_label || 'Years Experience'}
                          onChange={(e) => { site_settings.stat_experience_label = e.target.value; }}
                          className="w-full px-3 py-2 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Success Rate */}
                    <div className="space-y-3 p-4 rounded-2xl border border-white/5 bg-[#090a10]/40">
                      <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider block">Statistic #4</span>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Value (সংখ্যা)</label>
                        <input
                          type="number"
                          defaultValue={site_settings.stat_success_value !== undefined ? site_settings.stat_success_value : 100}
                          onChange={(e) => { site_settings.stat_success_value = Number(e.target.value); }}
                          className="w-full px-3 py-2 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Label (নাম)</label>
                        <input
                          type="text"
                          defaultValue={site_settings.stat_success_label || 'Success Rate'}
                          onChange={(e) => { site_settings.stat_success_label = e.target.value; }}
                          className="w-full px-3 py-2 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg transition-all cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SERVICES MANAGER */}
          {activeTab === 'services' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-white">Services Manager</h2>
                  <p className="text-gray-400 text-sm mt-1">Add, edit, or remove services and configure sub-tasks.</p>
                </div>
                <button
                  onClick={() => setEditingService({ title: '', icon: 'Palette', short_description: '', is_active: true })}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg hover:bg-indigo-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New Service
                </button>
              </div>

              {/* Service Editor Overlay Form */}
              {editingService && (
                <form onSubmit={handleSaveService} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>{editingService.id ? 'Edit Service' : 'New Service'}</span>
                    <button type="button" onClick={() => setEditingService(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Service Title</label>
                      <input
                        type="text"
                        required
                        value={editingService.title || ''}
                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Lucide Icon Name</label>
                      <select
                        value={editingService.icon || 'Palette'}
                        onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                      >
                        <option value="Palette">Palette</option>
                        <option value="Video">Video</option>
                        <option value="Code">Code</option>
                        <option value="TrendingUp">TrendingUp</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Short Description</label>
                    <textarea
                      required
                      value={editingService.short_description || ''}
                      onChange={(e) => setEditingService({ ...editingService, short_description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Cover Image</label>
                    <div className="flex items-center gap-4">
                      {editingService.cover_image_url && (
                        <div className="w-16 h-12 bg-[#0c0e17] rounded-lg overflow-hidden border border-white/5">
                          <img src={editingService.cover_image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Cover Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => setEditingService({ ...editingService, cover_image_url: url }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setEditingService(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg">Save Service</button>
                  </div>
                </form>
              )}

              {/* Subtask Editor form */}
              {editingSubtask && (
                <form onSubmit={handleSaveSubtask} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>{editingSubtask.id ? 'Edit Sub-task' : 'New Sub-task'}</span>
                    <button type="button" onClick={() => setEditingSubtask(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </h3>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Under Which Service?</label>
                    <select
                      value={editingSubtask.service_id || ''}
                      onChange={(e) => setEditingSubtask({ ...editingSubtask, service_id: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                    >
                      <option value="">Select Service...</option>
                      {services.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Sub-task Title</label>
                    <input
                      type="text"
                      required
                      value={editingSubtask.title || ''}
                      onChange={(e) => setEditingSubtask({ ...editingSubtask, title: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Sub-task Description</label>
                    <textarea
                      value={editingSubtask.description || ''}
                      onChange={(e) => setEditingSubtask({ ...editingSubtask, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setEditingSubtask(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg font-semibold">Save Sub-task</button>
                  </div>
                </form>
              )}

              {/* Grid lists of services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service: any) => (
                  <div key={service.id} className="rounded-2xl glass-card border border-white/5 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                            {service.icon === 'Palette' && <Palette className="w-5 h-5" />}
                            {service.icon === 'Video' && <Video className="w-5 h-5" />}
                            {service.icon === 'Code' && <Code className="w-5 h-5" />}
                            {service.icon === 'TrendingUp' && <TrendingUp className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">{service.title}</h3>
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Icon: {service.icon}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingService(service)}
                            className="p-1.5 rounded-lg border border-white/5 hover:border-indigo-500/20 bg-white/5 text-gray-400 hover:text-indigo-400 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/20 bg-white/5 text-gray-400 hover:text-red-400 cursor-pointer"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mt-4 leading-relaxed font-sans">{service.short_description}</p>

                      {/* Display sub-tasks */}
                      <div className="mt-6 border-t border-white/5 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">Sub-task List</h4>
                          <button
                            onClick={() => setEditingSubtask({ service_id: service.id, title: '', description: '' })}
                            className="text-xs font-mono text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> [ Add Sub-task ]
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {service_details
                            .filter((sd: any) => sd.service_id === service.id)
                            .sort((a: any, b: any) => a.order_index - b.order_index)
                            .map((sd: any) => (
                              <div key={sd.id} className="flex items-start justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                                <div>
                                  <span className="text-sm text-gray-300 font-semibold">{sd.title}</span>
                                  {sd.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{sd.description}</p>}
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button onClick={() => setEditingSubtask(sd)} className="p-1 text-gray-500 hover:text-white cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeleteSubtask(sd.id)} className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"><Trash className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CLIENT LOGOS MANAGER */}
          {activeTab === 'logos' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-white">Client Logos Manager</h2>
                  <p className="text-gray-400 text-sm mt-1">Manage partner/company logos shown in the marquee slideshow.</p>
                </div>
                <button
                  onClick={() => setEditingLogo({ company_name: '', logo_url: '', is_active: true })}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Upload New Logo
                </button>
              </div>

              {editingLogo && (
                <form onSubmit={handleSaveLogo} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>{editingLogo.id ? 'Edit Logo' : 'Upload New Logo'}</span>
                    <button type="button" onClick={() => setEditingLogo(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </h3>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Company Name</label>
                    <input
                      type="text"
                      required
                      value={editingLogo.company_name || ''}
                      onChange={(e) => setEditingLogo({ ...editingLogo, company_name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Logo Image</label>
                    <div className="flex items-center gap-4">
                      {editingLogo.logo_url && (
                        <div className="w-16 h-12 bg-[#0c0e17] rounded-lg p-2 border border-white/5 flex items-center justify-center">
                          <img src={editingLogo.logo_url} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">
                        <Upload className="w-4 h-4" />
                        Select Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => setEditingLogo({ ...editingLogo, logo_url: url }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setEditingLogo(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg font-semibold">Save Logo</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {client_logos.map((logo: any) => (
                  <div key={logo.id} className="rounded-2xl glass-card border border-white/5 p-4 flex flex-col items-center justify-between text-center relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                      <button onClick={() => setEditingLogo(logo)} className="p-1 rounded bg-black/60 text-indigo-400 hover:text-white cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteLogo(logo.id)} className="p-1 rounded bg-black/60 text-red-400 hover:text-white cursor-pointer"><Trash className="w-3.5 h-3.5" /></button>
                    </div>

                    <div className="w-full h-16 flex items-center justify-center mb-3">
                      <img src={logo.logo_url} className="max-w-full max-h-full object-contain grayscale" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-xs font-mono text-gray-400 font-bold block">{logo.company_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VIDEO PORTFOLIO MANAGER */}
          {activeTab === 'videos' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-white">Video Portfolio Manager</h2>
                  <p className="text-gray-400 text-sm mt-1">Manage video categories, video thumbnails, and play links.</p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setEditingCategory({ name: '', is_active: true })}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 font-semibold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                  <button
                    onClick={() => setEditingVideo({ title: '', category_id: video_categories[0]?.id || '', thumbnail_url: '', video_url: '', is_active: true })}
                    className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg hover:bg-indigo-600 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Video
                  </button>
                </div>
              </div>

              {/* Category Editor */}
              {editingCategory && (
                <form onSubmit={handleSaveCategory} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>Category Form</span>
                    <button type="button" onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </h3>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Category Name</label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      placeholder="e.g., Reels Video"
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setEditingCategory(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-400 border border-white/5">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold">Save</button>
                  </div>
                </form>
              )}

              {/* Video Editor form */}
              {editingVideo && (
                <form onSubmit={handleSaveVideo} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>{editingVideo.id ? 'Edit Video' : 'Add New Video'}</span>
                    <button type="button" onClick={() => setEditingVideo(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Video Title</label>
                      <input
                        type="text"
                        required
                        value={editingVideo.title || ''}
                        onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Category</label>
                      <select
                        value={editingVideo.category_id || ''}
                        onChange={(e) => setEditingVideo({ ...editingVideo, category_id: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                      >
                        {video_categories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Video Link (YouTube / Vimeo Embed or Watch Link)</label>
                    <input
                      type="url"
                      required
                      value={editingVideo.video_url || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Thumbnail Image</label>
                    <div className="flex items-center gap-4">
                      {editingVideo.thumbnail_url && (
                        <div className="w-16 h-12 bg-[#0c0e17] rounded-lg overflow-hidden border border-white/5">
                          <img src={editingVideo.thumbnail_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Thumbnail
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => setEditingVideo({ ...editingVideo, thumbnail_url: url }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setEditingVideo(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-400 border border-white/5">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg font-semibold">Save Video</button>
                  </div>
                </form>
              )}

              {/* Categories list manager display */}
              <div className="rounded-2xl glass-card border border-white/5 p-6 space-y-4">
                <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-widest">Category List</h3>
                <div className="flex flex-wrap gap-2">
                  {video_categories.map((cat: any) => (
                    <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-sm font-semibold text-white">{cat.name}</span>
                      <button onClick={() => setEditingCategory(cat)} className="text-gray-400 hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-400"><Trash className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {video_portfolio.map((v: any) => {
                  const cat = video_categories.find((c: any) => c.id === v.category_id);
                  return (
                    <div key={v.id} className="rounded-2xl glass-card border border-white/5 overflow-hidden group">
                      <div className="relative aspect-video">
                        <img src={v.thumbnail_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                          <button onClick={() => setEditingVideo(v)} className="p-1.5 rounded bg-black/60 text-indigo-400 hover:text-white cursor-pointer"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteVideo(v.id)} className="p-1.5 rounded bg-black/60 text-red-400 hover:text-white cursor-pointer"><Trash className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="p-4 bg-[#0a0b12]">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{v.title}</h4>
                        <span className="text-[10px] font-mono text-indigo-400 mt-1 block">Category: {cat?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: GRAPHICS PORTFOLIO MANAGER */}
          {activeTab === 'graphics' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-white">Graphics Portfolio Manager</h2>
                  <p className="text-gray-400 text-sm mt-1">Manage slideshow images and external "View All" gallery link.</p>
                </div>
                <button
                  onClick={() => setEditingGraphics({ image_url: '', title: '' })}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg hover:bg-indigo-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Upload New Image
                </button>
              </div>

              {/* View all external gallery settings */}
              <form onSubmit={handleSaveGraphicsSettings} className="rounded-2xl glass-card border border-white/5 p-6 flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">"View All Graphics Design" External Gallery Link (Behance / Drive)</label>
                  <input
                    type="url"
                    required
                    value={graphicsViewAllLink}
                    onChange={(e) => setGraphicsViewAllLink(e.target.value)}
                    placeholder="https://behance.net/username"
                    className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none font-mono"
                  />
                </div>
                <button type="submit" className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm h-[46px] cursor-pointer">Update Link</button>
              </form>

              {editingGraphics && (
                <form onSubmit={handleSaveGraphicsItem} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>{editingGraphics.id ? 'Edit Graphics' : 'Upload New Graphics'}</span>
                    <button type="button" onClick={() => setEditingGraphics(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </h3>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Design Project Title</label>
                    <input
                      type="text"
                      value={editingGraphics.title || ''}
                      onChange={(e) => setEditingGraphics({ ...editingGraphics, title: e.target.value })}
                      placeholder="e.g., Minimalist Corporate Branding"
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Design Image</label>
                    <div className="flex items-center gap-4">
                      {editingGraphics.image_url && (
                        <div className="w-16 h-12 bg-[#0c0e17] rounded-lg overflow-hidden border border-white/5">
                          <img src={editingGraphics.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => setEditingGraphics({ ...editingGraphics, image_url: url }))}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setEditingGraphics(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-400 border border-white/5">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg font-semibold">Save</button>
                  </div>
                </form>
              )}

              {/* Images list display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {graphics_portfolio.map((g: any) => (
                  <div key={g.id} className="rounded-2xl glass-card border border-white/5 overflow-hidden relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                      <button onClick={() => setEditingGraphics(g)} className="p-1 rounded bg-black/60 text-indigo-400 hover:text-white cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteGraphicsItem(g.id)} className="p-1 rounded bg-black/60 text-red-400 hover:text-white cursor-pointer"><Trash className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="aspect-square">
                      <img src={g.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    {g.title && (
                      <div className="p-2 bg-black/60 text-[10px] text-gray-300 truncate">
                        {g.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: WEB DEVELOPMENT PORTFOLIO MANAGER */}
          {activeTab === 'web' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-white">Web Portfolio Manager</h2>
                  <p className="text-gray-400 text-sm mt-1">Manage website screenshots and live demo links.</p>
                </div>
                <button
                  onClick={() => setEditingWeb({ title: '', image_url: '', demo_link: '', is_active: true })}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg hover:bg-indigo-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New Web Project
                </button>
              </div>

              {editingWeb && (
                <form onSubmit={handleSaveWeb} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>{editingWeb.id ? 'Edit Web Project' : 'Add New Web Project'}</span>
                    <button type="button" onClick={() => setEditingWeb(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Project Title</label>
                      <input
                        type="text"
                        required
                        value={editingWeb.title || ''}
                        onChange={(e) => setEditingWeb({ ...editingWeb, title: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Live Demo Link</label>
                      <input
                        type="url"
                        required
                        value={editingWeb.demo_link || ''}
                        onChange={(e) => setEditingWeb({ ...editingWeb, demo_link: e.target.value })}
                        placeholder="https://github.com/my-project"
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Project Screenshot</label>
                    <div className="flex items-center gap-4">
                      {editingWeb.image_url && (
                        <div className="w-16 h-12 bg-[#0c0e17] rounded-lg overflow-hidden border border-white/5">
                          <img src={editingWeb.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Screenshot
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => setEditingWeb({ ...editingWeb, image_url: url }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setEditingWeb(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-400 border border-white/5">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg">Save Project</button>
                  </div>
                </form>
              )}

              {/* Web items list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {web_portfolio.map((item: any) => (
                  <div key={item.id} className="rounded-2xl glass-card border border-white/5 overflow-hidden relative group flex flex-col justify-between">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                      <button onClick={() => setEditingWeb(item)} className="p-1.5 rounded bg-black/60 text-indigo-400 hover:text-white cursor-pointer"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteWeb(item.id)} className="p-1.5 rounded bg-black/60 text-red-400 hover:text-white cursor-pointer"><Trash className="w-4 h-4" /></button>
                    </div>
                    <div className="aspect-video">
                      <img src={item.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-4 bg-[#0a0b12]">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                      <a href={item.demo_link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-indigo-400 hover:underline mt-1 block">Demo: Link</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TESTIMONIALS REVIEWS MANAGER */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-white">Client Reviews Manager</h2>
                  <p className="text-gray-400 text-sm mt-1">Manage client names, designations, ratings, and review text.</p>
                </div>
                <button
                  onClick={() => setEditingReview({ client_name: '', client_photo_url: '', designation: '', rating: 5, review_text: '', is_active: true })}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg hover:bg-indigo-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New Review
                </button>
              </div>

              {editingReview && (
                <form onSubmit={handleSaveReview} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>{editingReview.id ? 'Edit Review' : 'Add New Review'}</span>
                    <button type="button" onClick={() => setEditingReview(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Client Name</label>
                      <input
                        type="text"
                        required
                        value={editingReview.client_name || ''}
                        onChange={(e) => setEditingReview({ ...editingReview, client_name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Designation / Company</label>
                      <input
                        type="text"
                        value={editingReview.designation || ''}
                        onChange={(e) => setEditingReview({ ...editingReview, designation: e.target.value })}
                        placeholder="Founder, ABC Corp"
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Star Rating (1 - 5)</label>
                      <select
                        value={editingReview.rating || 5}
                        onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                        <option value={3}>⭐⭐⭐ (3 Stars)</option>
                        <option value={2}>⭐⭐ (2 Stars)</option>
                        <option value={1}>⭐ (1 Star)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Client Photo</label>
                      <div className="flex items-center gap-4">
                        {editingReview.client_photo_url && (
                          <div className="w-12 h-12 bg-[#0c0e17] rounded-full overflow-hidden border border-white/5">
                            <img src={editingReview.client_photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">
                          <Upload className="w-4 h-4" />
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => setEditingReview({ ...editingReview, client_photo_url: url }))}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Review Text</label>
                    <textarea
                      required
                      value={editingReview.review_text || ''}
                      onChange={(e) => setEditingReview({ ...editingReview, review_text: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setEditingReview(null)} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-400 border border-white/5">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold">Save</button>
                  </div>
                </form>
              )}

              {/* Reviews Cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.map((r: any) => (
                  <div key={r.id} className="rounded-2xl glass-card border border-white/5 p-6 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {r.client_photo_url && (
                            <img src={r.client_photo_url} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-white">{r.client_name}</h4>
                            <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">{r.designation}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingReview(r)} className="p-1 text-gray-400 hover:text-white cursor-pointer"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteReview(r.id)} className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"><Trash className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <div className="flex gap-1 items-center my-3 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                      </div>

                      <p className="text-gray-400 text-sm font-sans italic leading-relaxed">"{r.review_text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: CONTACT SUBMISSIONS */}
          {activeTab === 'contacts' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-display font-extrabold text-white">Message Submissions ({contact_submissions.length})</h2>
                <p className="text-gray-400 text-sm mt-1">Dashboard for tracking all customer messages sent from the contact form.</p>
              </div>

              <div className="rounded-2xl glass-card border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0c0d15] text-xs font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-white/5">
                      <tr>
                        <th className="p-4">Name / Contact</th>
                        <th className="p-4">Service Interested</th>
                        <th className="p-4">Message</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans text-gray-300">
                      {contact_submissions.map((sub: any) => (
                        <tr key={sub.id} className={`hover:bg-white/5 transition-colors ${!sub.is_read ? 'bg-indigo-500/5' : ''}`}>
                          <td className="p-4 space-y-1">
                            <span className="font-bold text-white block">{sub.name}</span>
                            {sub.phone && <span className="text-xs text-gray-400 block font-mono">{sub.phone}</span>}
                            {sub.email && <span className="text-xs text-indigo-400 block font-mono">{sub.email}</span>}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 text-[10px] font-semibold rounded bg-[#0d0f19] border border-white/5 text-indigo-400">
                              {sub.service_interested || 'None'}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed">{sub.message || 'No description provided.'}</p>
                            <span className="text-[10px] text-gray-500 font-mono mt-1 block">{new Date(sub.created_at).toLocaleString()}</span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleContactRead(sub.id, sub.is_read)}
                              className={`p-2 rounded-lg cursor-pointer ${
                                sub.is_read ? 'text-gray-500 hover:text-indigo-400' : 'text-indigo-400 hover:text-white'
                              }`}
                            >
                              {sub.is_read ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5 animate-pulse" />}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteContact(sub.id)}
                              className="p-2 text-gray-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {contact_submissions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500 italic">No contact submissions received yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ACCOUNT SECURITY */}
          {activeTab === 'account' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-display font-extrabold text-white">Account Security Settings</h2>
                <p className="text-gray-400 text-sm mt-1">Change username and password to secure the Admin Panel.</p>
              </div>

              <form onSubmit={handleSaveAccountSecurity} className="space-y-6 rounded-2xl glass-card border border-white/5 p-6 sm:p-8 max-w-xl">
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Console Username</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 bg-[#0a0b12] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg cursor-pointer"
                  >
                    Update Credentials
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
