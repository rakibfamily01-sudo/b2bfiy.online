/**
 * B2bfiy Type Definitions
 */

export interface SiteSettings {
  name: string;
  logo: string;
  logoText?: string;
  logoDisplayType?: 'logo' | 'text' | 'both';
  favicon: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  defaultSeoTitle: string;
  defaultMetaDescription: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  enableTopBar: boolean;
  enableStickyHeader: boolean;
  viewAllGraphicsDesignUrl?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

export interface HeroContent {
  badge: string;
  heading: string;
  highlightText: string;
  description: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  trustText: string;
  imagePath: string;
  isVisible: boolean;
}

export interface StatisticCard {
  id: string;
  label: string;
  value: string;
  iconName: string;
  order: number;
}

export interface ClientLogo {
  id: string;
  name: string;
  url: string;
  imagePath: string;
  order: number;
  published: boolean;
}

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  features: string[];
  iconName: string;
  order: number;
  published: boolean;
}

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  order: number;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  categoryId: string;
  serviceType: string;
  thumbnail: string;
  images: string[];
  videoUrl: string;
  websiteUrl: string;
  date: string;
  description: string;
  challenge: string;
  solution: string;
  process: string;
  result: string;
  technologies: string[];
  tags: string[];
  featured: boolean;
  published: boolean;
}

export interface WorkProcessStep {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  order: number;
  published: boolean;
}

export interface PricingPackage {
  id: string;
  name: string;
  type: 'monthly' | 'website' | 'graphic' | 'video' | 'bundle';
  price: string;
  currency: string;
  period: string; // e.g., "Month" or "One-time"
  features: string[];
  mostPopular: boolean;
  order: number;
  deliveryTime?: string;
  published: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  review: string;
  rating: number;
  photoPath: string;
  order: number;
  published: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

export interface AuditRequest {
  id: string;
  fullName: string;
  businessName: string;
  email: string;
  whatsapp: string;
  websiteUrl: string;
  serviceNeeded: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'meeting' | 'client' | 'closed';
  notes: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  notes: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface AdminProfile {
  email: string;
  passwordHash: string;
  salt: string;
}

export interface DatabaseState {
  settings: SiteSettings;
  navigation_items: NavigationItem[];
  hero_content: HeroContent;
  statistics: StatisticCard[];
  client_logos: ClientLogo[];
  services: ServiceCard[];
  why_choose_us: WhyChooseUsItem[];
  portfolio_categories: PortfolioCategory[];
  portfolio_projects: PortfolioProject[];
  work_process: WorkProcessStep[];
  packages: PricingPackage[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  audit_requests: AuditRequest[];
  contact_messages: ContactMessage[];
  media: MediaItem[];
  admin: AdminProfile;
}
