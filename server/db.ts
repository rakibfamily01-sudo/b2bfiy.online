import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Supabase environment variables support (checks both standard and Vite-prefixed names)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// Ensure data and uploads directories exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  logo_url: string;
  favicon_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  whatsapp_number: string;
  footer_text: string;
  footer_address: string;
  footer_email: string;
  logo_display_mode?: string; // 'graphic' | 'text' | 'both'
  seo_description?: string;
  seo_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  stat_projects_value?: number;
  stat_projects_label?: string;
  stat_clients_value?: number;
  stat_clients_label?: string;
  stat_experience_value?: number;
  stat_experience_label?: string;
  stat_success_value?: number;
  stat_success_label?: string;
  social_links: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  short_description: string;
  cover_image_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface ServiceDetail {
  id: string;
  service_id: string;
  title: string;
  description: string;
  order_index: number;
}

export interface ClientLogo {
  id: string;
  company_name: string;
  logo_url: string;
  order_index: number;
  is_active: boolean;
}

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  is_active: boolean;
}

export interface VideoPortfolio {
  id: string;
  category_id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface GraphicsPortfolio {
  id: string;
  image_url: string;
  title: string;
  order_index: number;
  is_active: boolean;
}

export interface GraphicsSettings {
  view_all_link: string;
}

export interface WebPortfolio {
  id: string;
  title: string;
  image_url: string;
  demo_link: string;
  order_index: number;
  is_active: boolean;
}

export interface Review {
  id: string;
  client_name: string;
  client_photo_url: string;
  designation: string;
  rating: number;
  review_text: string;
  order_index: number;
  is_active: boolean;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_interested: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface DatabaseSchema {
  admin_users: AdminUser[];
  site_settings: SiteSettings;
  services: Service[];
  service_details: ServiceDetail[];
  client_logos: ClientLogo[];
  video_categories: VideoCategory[];
  video_portfolio: VideoPortfolio[];
  graphics_portfolio: GraphicsPortfolio[];
  graphics_settings: GraphicsSettings;
  web_portfolio: WebPortfolio[];
  reviews: Review[];
  contact_submissions: ContactSubmission[];
}

export function hashPassword(password: string): string {
  const salt = 'b2bfiy_secret_salt_123';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Default Seed Data
const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: 'B2Bfiy Institute',
  logo_url: '', // Empty initially, will have dynamic generator or SVG placeholder
  favicon_url: '',
  hero_title: 'We Build Digital Brands That Conquer The Global Market',
  hero_subtitle: 'B2Bfiy Institute is a premium digital agency. We take your business to new heights through graphic design, video editing, web development, and digital marketing.',
  hero_cta_text: 'Our Services',
  whatsapp_number: '+8801700000000',
  footer_text: 'B2Bfiy Institute - Your Trusted Digital Agency Partner.',
  footer_address: 'Mirpur 10, Dhaka, Bangladesh',
  footer_email: 'info@b2bfiy.com',
  logo_display_mode: 'both',
  seo_description: 'B2Bfiy Institute is a premium digital agency. We take your business to new heights through graphic design, video editing, web development, and digital marketing.',
  seo_keywords: 'B2Bfiy, digital agency, graphic design, video editing, web development, digital marketing',
  og_title: 'B2Bfiy Institute | Premium Digital Agency',
  og_description: 'We Build Digital Brands That Conquer The Global Market. B2Bfiy Institute is a premium digital agency.',
  og_image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
  stat_projects_value: 250,
  stat_projects_label: 'Projects Completed',
  stat_clients_value: 65,
  stat_clients_label: 'Happy Clients',
  stat_experience_value: 8,
  stat_experience_label: 'Years Experience',
  stat_success_value: 100,
  stat_success_label: 'Success Rate',
  social_links: {
    facebook: 'https://facebook.com/b2bfiy',
    instagram: 'https://instagram.com/b2bfiy',
    linkedin: 'https://linkedin.com/company/b2bfiy',
    youtube: 'https://youtube.com/b2bfiy',
  },
};

const DEFAULT_SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Graphics Design',
    icon: 'Palette',
    short_description: 'Branding, logos, and attractive social media designs that bring out your business\'s core message.',
    cover_image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's2',
    title: 'Video Editing',
    icon: 'Video',
    short_description: 'Cinematic video editing, motion graphics, and short-form content that captures viewers from the very first second.',
    cover_image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's3',
    title: 'Web Development',
    icon: 'Code',
    short_description: 'Modern, fast, and responsive websites that give your business a strong online presence.',
    cover_image_url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's4',
    title: 'Digital Marketing',
    icon: 'TrendingUp',
    short_description: 'Growth in sales and brand value through targeted Facebook ads and social media management.',
    cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_SERVICE_DETAILS: ServiceDetail[] = [
  // Graphics Design sub-tasks
  { id: 'sd1', service_id: 's1', title: 'Logo & Brand Identity', description: 'We create professional and unique logos that express your brand\'s core philosophy.', order_index: 1 },
  { id: 'sd2', service_id: 's1', title: 'Social Media Post Design', description: 'High-converting and aesthetic post and banner designs for social media.', order_index: 2 },
  { id: 'sd3', service_id: 's1', title: 'Marketing Collateral', description: 'Leaflets, brochures, business cards, and other offline print designs.', order_index: 3 },
  // Video Editing sub-tasks
  { id: 'sd4', service_id: 's2', title: 'Cinematic Video Editing', description: 'Complete cinematic editing including drone footage, color grading, and sound effects.', order_index: 1 },
  { id: 'sd5', service_id: 's2', title: 'Reels & TikTok Editing', description: 'Viral-quality short-form content editing with hooks and transitions.', order_index: 2 },
  { id: 'sd6', service_id: 's2', title: 'Motion Graphics & Intros', description: 'Logo animation, 2D motion, and engaging video intro-outro designs.', order_index: 3 },
  // Web Development sub-tasks
  { id: 'sd7', service_id: 's3', title: 'Custom React Web Applications', description: 'Ultra-fast and dynamic web applications built with the latest technologies.', order_index: 1 },
  { id: 'sd8', service_id: 's3', title: 'E-Commerce Development', description: 'Online stores with user-friendly shopping experience and integrated payment gateways.', order_index: 2 },
  { id: 'sd9', service_id: 's3', title: 'UI/UX Design to Web', description: 'Pixel-perfect and responsive website coding from Figma designs.', order_index: 3 },
  // Digital Marketing sub-tasks
  { id: 'sd10', service_id: 's4', title: 'Facebook & Instagram Ads', description: 'Ensuring maximum ROI through precise audience research and A/B testing.', order_index: 1 },
  { id: 'sd11', service_id: 's4', title: 'Social Media Management', description: 'Page optimization, regular content posting, and boosting customer engagement.', order_index: 2 },
  { id: 'sd12', service_id: 's4', title: 'SEO Optimization', description: 'Professional SEO to rank your website at the top of search engines.', order_index: 3 },
];

const DEFAULT_CLIENT_LOGOS: ClientLogo[] = [
  { id: 'l1', company_name: 'TechFlow Solutions', logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&q=80', order_index: 1, is_active: true },
  { id: 'l2', company_name: 'Apex Digital', logo_url: 'https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=200&q=80', order_index: 2, is_active: true },
  { id: 'l3', company_name: 'Zeta Foods', logo_url: 'https://images.unsplash.com/photo-1551490103-a859a09ddf3b?auto=format&fit=crop&w=200&q=80', order_index: 3, is_active: true },
  { id: 'l4', company_name: 'Alpha Agency', logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80', order_index: 4, is_active: true },
  { id: 'l5', company_name: 'Nova Soft', logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', order_index: 5, is_active: true },
];

const DEFAULT_VIDEO_CATEGORIES: VideoCategory[] = [
  { id: 'vc1', name: 'Reels Video', slug: 'reels-video', order_index: 1, is_active: true },
  { id: 'vc2', name: 'Motion Video', slug: 'motion-video', order_index: 2, is_active: true },
  { id: 'vc3', name: 'Document Video', slug: 'document-video', order_index: 3, is_active: true },
  { id: 'vc4', name: 'Long Video', slug: 'long-video', order_index: 4, is_active: true },
];

const DEFAULT_VIDEO_PORTFOLIOS: VideoPortfolio[] = [
  { id: 'v1', category_id: 'vc1', title: 'Creative Brand Reels 1', thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order_index: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'v2', category_id: 'vc1', title: 'Food & Restaurant Promo Reels', thumbnail_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order_index: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'v3', category_id: 'vc2', title: 'SaaS Product Intro Explainer', thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order_index: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'v4', category_id: 'vc3', title: 'Corporate Identity Documentary', thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order_index: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'v5', category_id: 'vc4', title: 'Full Length Tech Review Podcasting', thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=80', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order_index: 1, is_active: true, created_at: new Date().toISOString() },
];

const DEFAULT_GRAPHICS_PORTFOLIOS: GraphicsPortfolio[] = [
  { id: 'g1', image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', title: 'Modern Minimalist Corporate Branding', order_index: 1, is_active: true },
  { id: 'g2', image_url: 'https://images.unsplash.com/photo-1626785774625-ddc7c8241314?auto=format&fit=crop&w=600&q=80', title: 'Crypto Mobile App UI Mockup Design', order_index: 2, is_active: true },
  { id: 'g3', image_url: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=600&q=80', title: 'Luxury Skincare Packaging Label Art', order_index: 3, is_active: true },
  { id: 'g4', image_url: 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&w=600&q=80', title: 'Creative Poster for Digital Art Exhibition', order_index: 4, is_active: true },
];

const DEFAULT_WEB_PORTFOLIOS: WebPortfolio[] = [
  { id: 'w1', title: 'Fintech Analytics Landing Page', image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', demo_link: 'https://github.com', order_index: 1, is_active: true },
  { id: 'w2', title: 'Eco-Friendly E-commerce Platform', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', demo_link: 'https://github.com', order_index: 2, is_active: true },
  { id: 'w3', title: 'SaaS Multi-Tenant Billing Portal', image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80', demo_link: 'https://github.com', order_index: 3, is_active: true },
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'r1',
    client_name: 'Rashedul Hasan',
    client_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    designation: 'CEO, Apex Electronics',
    rating: 5,
    review_text: 'B2Bfiy Institute\'s video editing service increased our social media sales by 30%. Their team\'s work is truly wonderful and highly professional.',
    order_index: 1,
    is_active: true,
  },
  {
    id: 'r2',
    client_name: 'Farhana Islam',
    client_photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    designation: 'Founder, Organic Ghor',
    rating: 5,
    review_text: 'We got our page logo and complete branding done by them. The brand guideline they created for us is extraordinary. We are truly satisfied!',
    order_index: 2,
    is_active: true,
  },
  {
    id: 'r3',
    client_name: 'Tanvir Ahmed',
    client_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    designation: 'Marketing Director, TechFlow',
    rating: 5,
    review_text: 'They set up Facebook Ads and built a complete funnel for us. Our conversion rate increased significantly in the first month. There is no alternative to their work.',
    order_index: 3,
    is_active: true,
  },
];

export class JSONDatabase {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return {
          admin_users: parsed.admin_users || [],
          site_settings: parsed.site_settings || DEFAULT_SITE_SETTINGS,
          services: parsed.services || DEFAULT_SERVICES,
          service_details: parsed.service_details || DEFAULT_SERVICE_DETAILS,
          client_logos: parsed.client_logos || DEFAULT_CLIENT_LOGOS,
          video_categories: parsed.video_categories || DEFAULT_VIDEO_CATEGORIES,
          video_portfolio: parsed.video_portfolio || DEFAULT_VIDEO_PORTFOLIOS,
          graphics_portfolio: parsed.graphics_portfolio || DEFAULT_GRAPHICS_PORTFOLIOS,
          graphics_settings: parsed.graphics_settings || { view_all_link: 'https://behance.net' },
          web_portfolio: parsed.web_portfolio || DEFAULT_WEB_PORTFOLIOS,
          reviews: parsed.reviews || DEFAULT_REVIEWS,
          contact_submissions: parsed.contact_submissions || [],
        };
      } catch (err) {
        console.error('Error reading database file, using defaults:', err);
      }
    }

    // Default Seed state if file not present or corrupted
    const defaultData: DatabaseSchema = {
      admin_users: [
        {
          id: 'admin-1',
          username: 'b2bfiy',
          password_hash: hashPassword('rakib1122@#'),
          updated_at: new Date().toISOString(),
        }
      ],
      site_settings: DEFAULT_SITE_SETTINGS,
      services: DEFAULT_SERVICES,
      service_details: DEFAULT_SERVICE_DETAILS,
      client_logos: DEFAULT_CLIENT_LOGOS,
      video_categories: DEFAULT_VIDEO_CATEGORIES,
      video_portfolio: DEFAULT_VIDEO_PORTFOLIOS,
      graphics_portfolio: DEFAULT_GRAPHICS_PORTFOLIOS,
      graphics_settings: { view_all_link: 'https://behance.net' },
      web_portfolio: DEFAULT_WEB_PORTFOLIOS,
      reviews: DEFAULT_REVIEWS,
      contact_submissions: [],
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write to database file:', err);
    }

    // Save to Supabase asynchronously if configured
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { error } = await supabase
            .from('site_config')
            .upsert({ id: 1, data, updated_at: new Date().toISOString() });
          if (error) {
            console.error('Failed to save to Supabase site_config:', error.message);
          } else {
            console.log('Successfully saved database state to Supabase!');
          }
        } catch (err) {
          console.error('Error in Supabase save:', err);
        }
      })();
    }
  }

  public get(): DatabaseSchema {
    return this.schema;
  }

  public setRaw(data: DatabaseSchema) {
    this.schema = data;
  }

  public update(updater: (data: DatabaseSchema) => void) {
    updater(this.schema);
    this.saveData(this.schema);
  }
}

export const db = new JSONDatabase();
