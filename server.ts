import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword, isSupabaseConfigured, supabase, syncFromSupabase, saveToSupabaseIndividual } from './server/db.ts';

const app = express();
const PORT = 3000;

// Body size limits for base64 file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded static files
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Middleware to sync with Supabase on every request if configured (critical for serverless environments like Vercel)
app.use(async (req, res, next) => {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Try to load from separate, individual structured tables in Supabase
      const individualData = await syncFromSupabase();
      if (individualData) {
        db.setRaw(individualData);
      } else {
        // 2. Fallback to the single site_config JSONB column if individual tables don't exist yet
        const { data, error } = await supabase
          .from('site_config')
          .select('data')
          .eq('id', 1)
          .single();
        
        if (!error && data && data.data) {
          db.setRaw(data.data);
          
          // Background sync to seed individual tables if the user just created them
          saveToSupabaseIndividual(data.data).catch(() => {});
        } else if (error) {
          // If it's a row not found error (PGRST116), seed it with local data!
          if (error.code === 'PGRST116') {
            console.log('Row with id=1 not found. Seeding Supabase with default local data...');
            const localData = db.get();
            await supabase.from('site_config').upsert({ id: 1, data: localData });
            saveToSupabaseIndividual(localData).catch(() => {});
          } else {
            console.error('Supabase fetch error in middleware:', error.message);
          }
        }
      }
    } catch (err) {
      console.error('Supabase middleware sync failed:', err);
    }
  }
  next();
});

// In-memory active admin sessions to prevent cross-site iframe cookie blocking
const activeSessions = new Map<string, { username: string; expiresAt: number }>();
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Helper to authenticate admin via Bearer header
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access. Please login first.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid. Please login again.' });
  }

  // Refresh expiration
  session.expiresAt = Date.now() + SESSION_DURATION;
  next();
}

// ================= PUBLIC API ENDPOINTS =================

// 1. Get entire public landing page data
app.get('/api/site-data', (req, res) => {
  try {
    const data = db.get();
    
    // Return only active services, categories, videos, logos, portfolio graphics, web items and reviews
    const activeServices = data.services
      .filter((s) => s.is_active)
      .sort((a, b) => a.order_index - b.order_index);
      
    const activeClientLogos = data.client_logos
      .filter((l) => l.is_active)
      .sort((a, b) => a.order_index - b.order_index);
      
    const activeCategories = data.video_categories
      .filter((c) => c.is_active)
      .sort((a, b) => a.order_index - b.order_index);
      
    const activeVideos = data.video_portfolio
      .filter((v) => v.is_active)
      .sort((a, b) => a.order_index - b.order_index);
      
    const activeGraphics = data.graphics_portfolio
      .filter((g) => g.is_active)
      .sort((a, b) => a.order_index - b.order_index);
      
    const activeWeb = data.web_portfolio
      .filter((w) => w.is_active)
      .sort((a, b) => a.order_index - b.order_index);
      
    const activeReviews = data.reviews
      .filter((r) => r.is_active)
      .sort((a, b) => a.order_index - b.order_index);

    res.json({
      site_settings: data.site_settings,
      services: activeServices,
      service_details: data.service_details,
      client_logos: activeClientLogos,
      video_categories: activeCategories,
      video_portfolio: activeVideos,
      graphics_portfolio: activeGraphics,
      graphics_settings: data.graphics_settings,
      web_portfolio: activeWeb,
      reviews: activeReviews,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch site data: ' + err.message });
  }
});

// 2. Submit contact form
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, service_interested, message } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newSubmission = {
      id: crypto.randomUUID(),
      name,
      email: email || '',
      phone: phone || '',
      service_interested: service_interested || '',
      message: message || '',
      created_at: new Date().toISOString(),
      is_read: false,
    };

    db.update((data) => {
      data.contact_submissions.unshift(newSubmission);
    });

    res.json({ success: true, message: 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমাদের টিম শীঘ্রই যোগাযোগ করবে।' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit contact form: ' + err.message });
  }
});

// ================= ADMIN API ENDPOINTS =================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const data = db.get();
  const admin = data.admin_users.find((u) => u.username === username);
  if (!admin || admin.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়!' });
  }

  // Session token creation
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    username,
    expiresAt: Date.now() + SESSION_DURATION,
  });

  res.json({ token, username, message: 'স্বাগতম! আপনি সফলভাবে লগইন করেছেন।' });
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get self info
app.get('/api/admin/me', authenticate, (req, res) => {
  res.json({ authenticated: true });
});

// Base64 file uploader
app.post('/api/admin/upload', authenticate, (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ error: 'File name and base64 data are required' });
    }

    // Convert base64 representation to binary buffer
    const buffer = Buffer.from(data, 'base64');
    const extension = path.extname(name) || '.png';
    const uniqueName = `${crypto.randomUUID()}${extension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);
    res.json({ url: `/uploads/${uniqueName}` });
  } catch (err: any) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// Get site statistics + raw settings/data for administrative table views
app.get('/api/admin/all-data', authenticate, (req, res) => {
  res.json(db.get());
});

// Update General Site Settings
app.post('/api/admin/site-settings', authenticate, (req, res) => {
  try {
    const newSettings = req.body;
    db.update((data) => {
      data.site_settings = {
        ...data.site_settings,
        ...newSettings,
        social_links: {
          ...data.site_settings.social_links,
          ...(newSettings.social_links || {}),
        },
      };
    });
    res.json({ success: true, message: 'জেনারেল সেটিংস সফলভাবে আপডেট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SERVICE API ENDPOINTS ----------------
app.post('/api/admin/services', authenticate, (req, res) => {
  try {
    const { id, title, icon, short_description, cover_image_url, order_index, is_active } = req.body;
    
    db.update((data) => {
      if (id) {
        // Edit existing
        const idx = data.services.findIndex((s) => s.id === id);
        if (idx !== -1) {
          data.services[idx] = {
            ...data.services[idx],
            title,
            icon: icon || data.services[idx].icon,
            short_description,
            cover_image_url: cover_image_url || data.services[idx].cover_image_url,
            is_active: is_active !== undefined ? is_active : data.services[idx].is_active,
            order_index: order_index !== undefined ? Number(order_index) : data.services[idx].order_index,
          };
        }
      } else {
        // Add new
        data.services.push({
          id: crypto.randomUUID(),
          title,
          icon: icon || 'Palette',
          short_description: short_description || '',
          cover_image_url: cover_image_url || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
          order_index: data.services.length + 1,
          is_active: true,
          created_at: new Date().toISOString(),
        });
      }
    });
    res.json({ success: true, message: 'সার্ভিস সফলভাবে সংরক্ষণ করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/services/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    db.update((data) => {
      data.services = data.services.filter((s) => s.id !== id);
      data.service_details = data.service_details.filter((sd) => sd.service_id !== id);
    });
    res.json({ success: true, message: 'সার্ভিস সফলভাবে ডিলিট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SERVICE SUB-TASKS (Service Details) ----------------
app.post('/api/admin/service-details', authenticate, (req, res) => {
  try {
    const { id, service_id, title, description, order_index } = req.body;
    if (!service_id || !title) {
      return res.status(400).json({ error: 'Service ID and Title are required' });
    }

    db.update((data) => {
      if (id) {
        const idx = data.service_details.findIndex((sd) => sd.id === id);
        if (idx !== -1) {
          data.service_details[idx] = {
            ...data.service_details[idx],
            title,
            description: description || '',
            order_index: order_index !== undefined ? Number(order_index) : data.service_details[idx].order_index,
          };
        }
      } else {
        data.service_details.push({
          id: crypto.randomUUID(),
          service_id,
          title,
          description: description || '',
          order_index: data.service_details.filter((sd) => sd.service_id === service_id).length + 1,
        });
      }
    });
    res.json({ success: true, message: 'সাব-টাস্ক সফলভাবে সংরক্ষণ করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/service-details/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    db.update((data) => {
      data.service_details = data.service_details.filter((sd) => sd.id !== id);
    });
    res.json({ success: true, message: 'সাব-টাস্ক ডিলিট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- CLIENT LOGOS API ENDPOINTS ----------------
app.post('/api/admin/client-logos', authenticate, (req, res) => {
  try {
    const { id, company_name, logo_url, order_index, is_active } = req.body;
    if (!logo_url) {
      return res.status(400).json({ error: 'Logo URL is required' });
    }

    db.update((data) => {
      if (id) {
        const idx = data.client_logos.findIndex((l) => l.id === id);
        if (idx !== -1) {
          data.client_logos[idx] = {
            ...data.client_logos[idx],
            company_name: company_name || '',
            logo_url,
            is_active: is_active !== undefined ? is_active : data.client_logos[idx].is_active,
            order_index: order_index !== undefined ? Number(order_index) : data.client_logos[idx].order_index,
          };
        }
      } else {
        data.client_logos.push({
          id: crypto.randomUUID(),
          company_name: company_name || 'Partner Company',
          logo_url,
          order_index: data.client_logos.length + 1,
          is_active: true,
        });
      }
    });
    res.json({ success: true, message: 'ক্লায়েন্ট লোগো সফলভাবে সংরক্ষণ করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/client-logos/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    db.update((data) => {
      data.client_logos = data.client_logos.filter((l) => l.id !== id);
    });
    res.json({ success: true, message: 'লোগোটি সফলভাবে ডিলিট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- VIDEO CATEGORIES API ENDPOINTS ----------------
app.post('/api/admin/video-categories', authenticate, (req, res) => {
  try {
    const { id, name, slug, order_index, is_active } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and Slug are required' });
    }

    db.update((data) => {
      if (id) {
        const idx = data.video_categories.findIndex((c) => c.id === id);
        if (idx !== -1) {
          data.video_categories[idx] = {
            ...data.video_categories[idx],
            name,
            slug: slug.toLowerCase().replace(/\s+/g, '-'),
            is_active: is_active !== undefined ? is_active : data.video_categories[idx].is_active,
            order_index: order_index !== undefined ? Number(order_index) : data.video_categories[idx].order_index,
          };
        }
      } else {
        data.video_categories.push({
          id: crypto.randomUUID(),
          name,
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
          order_index: data.video_categories.length + 1,
          is_active: true,
        });
      }
    });
    res.json({ success: true, message: 'ক্যাটাগরি সফলভাবে সংরক্ষণ করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/video-categories/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    db.update((data) => {
      data.video_categories = data.video_categories.filter((c) => c.id !== id);
      data.video_portfolio = data.video_portfolio.filter((v) => v.category_id !== id);
    });
    res.json({ success: true, message: 'ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- VIDEO PORTFOLIO API ENDPOINTS ----------------
app.post('/api/admin/video-portfolio', authenticate, (req, res) => {
  try {
    const { id, category_id, title, thumbnail_url, video_url, order_index, is_active } = req.body;
    if (!category_id || !video_url || !thumbnail_url) {
      return res.status(400).json({ error: 'Category, Thumbnail and Video URL are required' });
    }

    db.update((data) => {
      if (id) {
        const idx = data.video_portfolio.findIndex((v) => v.id === id);
        if (idx !== -1) {
          data.video_portfolio[idx] = {
            ...data.video_portfolio[idx],
            category_id,
            title: title || '',
            thumbnail_url,
            video_url,
            is_active: is_active !== undefined ? is_active : data.video_portfolio[idx].is_active,
            order_index: order_index !== undefined ? Number(order_index) : data.video_portfolio[idx].order_index,
          };
        }
      } else {
        data.video_portfolio.push({
          id: crypto.randomUUID(),
          category_id,
          title: title || '',
          thumbnail_url,
          video_url,
          order_index: data.video_portfolio.length + 1,
          is_active: true,
          created_at: new Date().toISOString(),
        });
      }
    });
    res.json({ success: true, message: 'ভিডিও পোর্টফোলিও সফলভাবে সংরক্ষণ করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/video-portfolio/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    db.update((data) => {
      data.video_portfolio = data.video_portfolio.filter((v) => v.id !== id);
    });
    res.json({ success: true, message: 'ভিডিও সফলভাবে ডিলিট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- GRAPHICS PORTFOLIO API ENDPOINTS ----------------
app.post('/api/admin/graphics-portfolio', authenticate, (req, res) => {
  try {
    const { items, view_all_link } = req.body; // items is array of {id, image_url, title, order_index, is_active} or single item
    
    db.update((data) => {
      if (view_all_link !== undefined) {
        data.graphics_settings.view_all_link = view_all_link;
      }
      
      if (items && Array.isArray(items)) {
        // Bulk save or complete rewrite of graphics items
        data.graphics_portfolio = items.map((item: any) => ({
          id: item.id || crypto.randomUUID(),
          image_url: item.image_url,
          title: item.title || '',
          order_index: item.order_index !== undefined ? Number(item.order_index) : 0,
          is_active: item.is_active !== undefined ? item.is_active : true,
        }));
      } else if (req.body.image_url) {
        // Save single item
        const { id, image_url, title, order_index, is_active } = req.body;
        if (id) {
          const idx = data.graphics_portfolio.findIndex((g) => g.id === id);
          if (idx !== -1) {
            data.graphics_portfolio[idx] = {
              ...data.graphics_portfolio[idx],
              image_url,
              title: title || '',
              is_active: is_active !== undefined ? is_active : data.graphics_portfolio[idx].is_active,
              order_index: order_index !== undefined ? Number(order_index) : data.graphics_portfolio[idx].order_index,
            };
          }
        } else {
          data.graphics_portfolio.push({
            id: crypto.randomUUID(),
            image_url,
            title: title || '',
            order_index: data.graphics_portfolio.length + 1,
            is_active: true,
          });
        }
      }
    });
    res.json({ success: true, message: 'গ্রাফিক্স পোর্টফোলিও সফলভাবে আপডেট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/graphics-portfolio/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    db.update((data) => {
      data.graphics_portfolio = data.graphics_portfolio.filter((g) => g.id !== id);
    });
    res.json({ success: true, message: 'গ্রাফিক্স ইমেজটি সফলভাবে ডিলিট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- WEB PORTFOLIO API ENDPOINTS ----------------
app.post('/api/admin/web-portfolio', authenticate, (req, res) => {
  try {
    const { id, title, image_url, demo_link, order_index, is_active } = req.body;
    if (!image_url || !demo_link) {
      return res.status(400).json({ error: 'Image URL and Demo Link are required' });
    }

    db.update((data) => {
      if (id) {
        const idx = data.web_portfolio.findIndex((w) => w.id === id);
        if (idx !== -1) {
          data.web_portfolio[idx] = {
            ...data.web_portfolio[idx],
            title: title || '',
            image_url,
            demo_link,
            is_active: is_active !== undefined ? is_active : data.web_portfolio[idx].is_active,
            order_index: order_index !== undefined ? Number(order_index) : data.web_portfolio[idx].order_index,
          };
        }
      } else {
        data.web_portfolio.push({
          id: crypto.randomUUID(),
          title: title || '',
          image_url,
          demo_link,
          order_index: data.web_portfolio.length + 1,
          is_active: true,
        });
      }
    });
    res.json({ success: true, message: 'ওয়েব পোর্টফোলিও সফলভাবে সংরক্ষণ করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/web-portfolio/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    db.update((data) => {
      data.web_portfolio = data.web_portfolio.filter((w) => w.id !== id);
    });
    res.json({ success: true, message: 'ওয়েব প্রজেক্টটি ডিলিট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- REVIEWS API ENDPOINTS ----------------
app.post('/api/admin/reviews', authenticate, (req, res) => {
  try {
    const { id, client_name, client_photo_url, designation, rating, review_text, order_index, is_active } = req.body;
    if (!client_name || !review_text) {
      return res.status(400).json({ error: 'Client Name and Review Text are required' });
    }

    db.update((data) => {
      if (id) {
        const idx = data.reviews.findIndex((r) => r.id === id);
        if (idx !== -1) {
          data.reviews[idx] = {
            ...data.reviews[idx],
            client_name,
            client_photo_url: client_photo_url || '',
            designation: designation || '',
            rating: rating !== undefined ? Number(rating) : data.reviews[idx].rating,
            review_text,
            is_active: is_active !== undefined ? is_active : data.reviews[idx].is_active,
            order_index: order_index !== undefined ? Number(order_index) : data.reviews[idx].order_index,
          };
        }
      } else {
        data.reviews.push({
          id: crypto.randomUUID(),
          client_name,
          client_photo_url: client_photo_url || '',
          designation: designation || '',
          rating: rating !== undefined ? Number(rating) : 5,
          review_text,
          order_index: data.reviews.length + 1,
          is_active: true,
        });
      }
    });
    res.json({ success: true, message: 'রিভিউটি সফলভাবে সংরক্ষণ করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/reviews/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    db.update((data) => {
      data.reviews = data.reviews.filter((r) => r.id !== id);
    });
    res.json({ success: true, message: 'রিভিউটি সফলভাবে ডিলিট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- CONTACT SUBMISSIONS API ENDPOINTS ----------------
app.get('/api/admin/contacts', authenticate, (req, res) => {
  try {
    const data = db.get();
    res.json(data.contact_submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/contacts/read', authenticate, (req, res) => {
  try {
    const { id, is_read } = req.body;
    db.update((data) => {
      const submission = data.contact_submissions.find((s) => s.id === id);
      if (submission) {
        submission.is_read = is_read !== undefined ? is_read : true;
      }
    });
    res.json({ success: true, message: 'স্ট্যাটাস আপডেট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/contacts/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    db.update((data) => {
      data.contact_submissions = data.contact_submissions.filter((s) => s.id !== id);
    });
    res.json({ success: true, message: 'সাবমিশনটি ডিলিট করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- ADMIN ACCOUNT SETTINGS API ENDPOINTS ----------------
app.post('/api/admin/account/password', authenticate, (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    db.update((data) => {
      // Assuming a single admin user profile (id: admin-1)
      const admin = data.admin_users[0] || {
        id: 'admin-1',
        username: 'b2bfiy',
        password_hash: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      admin.username = username;
      admin.password_hash = hashPassword(password);
      admin.updated_at = new Date().toISOString();
      
      data.admin_users[0] = admin;
    });

    res.json({ success: true, message: 'অ্যাডমিন ইউজারনেম এবং পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SUPABASE CLOUD DATABASE SYNC ENDPOINTS ----------------
app.get('/api/admin/supabase/status', authenticate, (req, res) => {
  res.json({
    configured: isSupabaseConfigured,
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  });
});

app.post('/api/admin/supabase/push', authenticate, async (req, res) => {
  if (!isSupabaseConfigured || !supabase) {
    return res.status(400).json({ error: 'সুপাবেস সার্ভারে কনফিগার করা নেই। দয়া করে এনভায়রনমেন্ট ভেরিয়েবল চেক করুন।' });
  }

  try {
    const currentData = db.get();
    const { error } = await supabase
      .from('site_config')
      .upsert({ id: 1, data: currentData, updated_at: new Date().toISOString() });

    if (error) {
      return res.status(500).json({ error: 'Supabase-এ ডাটা পুশ করতে ব্যর্থ হয়েছে: ' + error.message });
    }

    res.json({ success: true, message: 'সরাসরি সফলভাবে Supabase Cloud-এ ডাটা পুশ করা হয়েছে!' });
  } catch (err: any) {
    res.status(500).json({ error: 'ব্যতিক্রমী ত্রুটি: ' + err.message });
  }
});

app.post('/api/admin/supabase/pull', authenticate, async (req, res) => {
  if (!isSupabaseConfigured || !supabase) {
    return res.status(400).json({ error: 'সুপাবেস সার্ভারে কনফিগার করা নেই। দয়া করে এনভায়রনমেন্ট ভেরিয়েবল চেক করুন।' });
  }

  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('data')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Supabase Cloud-এ কোনো ডাটা খুঁজে পাওয়া যায়নি। প্রথমে Push Local Data চাপুন।' });
      }
      return res.status(500).json({ error: 'Supabase থেকে ডাটা পুল করতে ব্যর্থ হয়েছে: ' + error.message });
    }

    if (data && data.data) {
      db.update((draft) => {
        db.setRaw(data.data);
      });
      return res.json({ success: true, message: 'সরাসরি সফলভাবে Supabase Cloud থেকে লেটেস্ট ডাটা পুল করা হয়েছে এবং লোকালি সেভ করা হয়েছে!' });
    }

    res.status(400).json({ error: 'Supabase থেকে অকার্যকর ডাটা পাওয়া গেছে।' });
  } catch (err: any) {
    res.status(500).json({ error: 'ব্যতিক্রমী ত্রুটি: ' + err.message });
  }
});

// ================= VITE MIDDLEWARE SETUP =================

async function startServer() {
  let vite: any;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  // Fallback wildcard to serve transformed / injected index.html
  app.get('*', async (req, res, next) => {
    // Exclude API, uploads, or static assets from being treated as HTML pages
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.includes('.')) {
      return next();
    }

    try {
      const url = req.originalUrl;
      let htmlPath = '';
      let html = '';

      if (process.env.NODE_ENV !== 'production') {
        htmlPath = path.resolve(process.cwd(), 'index.html');
        html = fs.readFileSync(htmlPath, 'utf-8');
        html = await vite.transformIndexHtml(url, html);
      } else {
        htmlPath = path.resolve(process.cwd(), 'dist/index.html');
        if (fs.existsSync(htmlPath)) {
          html = fs.readFileSync(htmlPath, 'utf-8');
        } else {
          // Fallback if index.html is in root
          htmlPath = path.resolve(process.cwd(), 'index.html');
          html = fs.readFileSync(htmlPath, 'utf-8');
        }
      }

      // Load current site settings to inject SEO meta tags
      const data = db.get();
      const settings = data.site_settings;

      const title = settings.site_name || 'B2Bfiy Institute | Premium Digital Agency';
      const description = settings.seo_description || settings.hero_subtitle || 'B2Bfiy Institute is a premium digital agency.';
      const keywords = settings.seo_keywords || 'B2Bfiy, digital agency, graphic design, video editing, web development, digital marketing';
      const ogTitle = settings.og_title || title;
      const ogDescription = settings.og_description || description;
      const ogImage = settings.og_image_url || settings.logo_url || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80';
      const favicon = settings.favicon_url || '';

      // Simple replacement of head contents
      // 1. Title replacement
      let injectedHtml = html;
      if (injectedHtml.includes('<title>')) {
        injectedHtml = injectedHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
      } else {
        injectedHtml = injectedHtml.replace('</head>', `<title>${title}</title>\n</head>`);
      }

      // 2. SEO & OG Meta Tags injection
      const metaTags = `
    <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="keywords" content="${keywords.replace(/"/g, '&quot;')}" />
    <meta property="og:title" content="${ogTitle.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${ogDescription.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${ogImage.replace(/"/g, '&quot;')}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${req.protocol}://${req.get('host')}${req.originalUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${ogDescription.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${ogImage.replace(/"/g, '&quot;')}" />
`;

      // 3. Favicon dynamic insertion
      let faviconTag = '';
      if (favicon) {
        faviconTag = `<link rel="icon" type="image/x-icon" href="${favicon}" />`;
        // Remove existing link rel="icon" or shortcut icon
        injectedHtml = injectedHtml.replace(/<link[^>]*rel=["'](shortcut )?icon["'][^>]*>/gi, '');
      }

      injectedHtml = injectedHtml.replace('</head>', `${metaTags}\n${faviconTag}\n</head>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(injectedHtml);
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production' && vite) {
        vite.ssrFixStacktrace(err);
      }
      next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
