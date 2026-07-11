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

export interface SiteData {
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
}
