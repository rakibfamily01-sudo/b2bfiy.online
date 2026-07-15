import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { dbInstance, hashPassword } from './db';
import { 
  SiteSettings, 
  NavigationItem, 
  HeroContent, 
  StatisticCard, 
  ClientLogo, 
  ServiceCard, 
  WhyChooseUsItem, 
  PortfolioCategory, 
  PortfolioProject, 
  WorkProcessStep, 
  PricingPackage, 
  Testimonial, 
  FAQItem, 
  AuditRequest, 
  ContactMessage, 
  MediaItem 
} from '../types';

export const apiRouter = Router();

// Prevent caching for all API responses so edits show up immediately
apiRouter.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Ensure database state is fully loaded from Supabase or local backup before processing any request (essential for Serverless/Vercel)
apiRouter.use(async (req, res, next) => {
  try {
    await dbInstance.ensureLoaded();
  } catch (err) {
    console.error("[Database Middleware] Cloud synchronization failed:", err);
  }
  next();
});

// Stable secret key for signed tokens
const JWT_SECRET = 'b2bfiy_agent_secure_secret_key_2026_07';

// Auth token generator (stateless signed token)
function generateToken(email: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days expiration
  const payload = JSON.stringify({ email, expiresAt });
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

// Token verifier
function verifyToken(token: string): { email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const payloadStr = Buffer.from(parts[0], 'base64').toString('utf-8');
    const signature = parts[1];

    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(payloadStr);
    if (payload.expiresAt < Date.now()) {
      return null; // Expired
    }
    return { email: payload.email };
  } catch (e) {
    return null;
  }
}

// Middleware to check if user is admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1] || '';
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    return;
  }

  next();
}

// Ensure local uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// -------------------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------------------

// Get overall public state of the website in one fast request (highly optimized)
apiRouter.get('/public/state', (req, res) => {
  const state = dbInstance.getState();
  
  // Return everything except the admin login credentials for security
  // Default unpublished items to display unless explicitly set to false
  res.json({
    settings: state.settings,
    navigation_items: state.navigation_items.sort((a, b) => a.order - b.order),
    hero_content: state.hero_content,
    statistics: state.statistics.sort((a, b) => a.order - b.order),
    client_logos: state.client_logos.filter(l => l.published !== false).sort((a, b) => a.order - b.order),
    services: state.services.filter(s => s.published !== false).sort((a, b) => a.order - b.order),
    why_choose_us: state.why_choose_us.sort((a, b) => a.order - b.order),
    portfolio_categories: state.portfolio_categories,
    portfolio_projects: state.portfolio_projects.filter(p => p.published !== false),
    work_process: state.work_process.filter(w => w.published !== false).sort((a, b) => a.order - b.order),
    packages: state.packages.filter(p => p.published !== false).sort((a, b) => a.order - b.order),
    testimonials: state.testimonials.filter(t => t.published !== false).sort((a, b) => a.order - b.order),
    faqs: state.faqs.filter(f => f.published !== false).sort((a, b) => a.order - b.order),
  });
});

// Submit Free Digital Audit lead form
apiRouter.post('/public/audit-request', (req, res) => {
  try {
    const { fullName, businessName, email, whatsapp, websiteUrl, serviceNeeded, message } = req.body;
    
    if (!fullName || !email || !whatsapp) {
       res.status(400).json({ error: 'Name, email, and WhatsApp number are required' });
       return;
    }

    const newRequest: AuditRequest = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      fullName,
      businessName: businessName || '',
      email,
      whatsapp,
      websiteUrl: websiteUrl || '',
      serviceNeeded: serviceNeeded || 'Not Sure',
      message: message || '',
      status: 'new',
      notes: '',
      createdAt: new Date().toISOString(),
    };

    const state = dbInstance.getState();
    state.audit_requests.push(newRequest);
    dbInstance.save();

    res.json({ success: true, id: newRequest.id, message: 'Your Free Digital Audit request has been submitted successfully!' });
  } catch (error) {
    console.error("Audit request submission failed", error);
    res.status(500).json({ error: 'Server error processing audit request' });
  }
});

// Submit generic Contact Us lead form
apiRouter.post('/public/contact', (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !message) {
       res.status(400).json({ error: 'Name, email, and message are required' });
       return;
    }

    const newMessage: ContactMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      fullName,
      email,
      subject: subject || 'General Inquiry',
      message,
      status: 'unread',
      notes: '',
      createdAt: new Date().toISOString(),
    };

    const state = dbInstance.getState();
    state.contact_messages.push(newMessage);
    dbInstance.save();

    res.json({ success: true, id: newMessage.id, message: 'Your message has been sent successfully! We will contact you soon.' });
  } catch (error) {
    console.error("Contact message submission failed", error);
    res.status(500).json({ error: 'Server error sending contact message' });
  }
});

// -------------------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------------------

// Secure Login endpoint
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const state = dbInstance.getState();

  if (!email || !password) {
     res.status(400).json({ error: 'Email and password are required' });
     return;
  }

  const admin = state.admin;
  const calculatedHash = hashPassword(password, admin.salt);

  if (email.toLowerCase() === admin.email.toLowerCase() && calculatedHash === admin.passwordHash) {
    const token = generateToken(admin.email);
    res.json({ success: true, token, email: admin.email });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// Verify session
apiRouter.get('/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || '';
  const decoded = verifyToken(token);

  if (decoded) {
    res.json({ success: true, email: decoded.email });
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
});

// Logout endpoint
apiRouter.post('/auth/logout', (req, res) => {
  res.json({ success: true });
});

// -------------------------------------------------------------------------
// ADMIN CRUD ENDPOINTS (PROTECTED BY requireAdmin)
// -------------------------------------------------------------------------

// Retrieve entire state for administration
apiRouter.get('/admin/state', requireAdmin, (req, res) => {
  const state = dbInstance.getState();
  
  // Format consolidated leads list
  const auditLeads = (state.audit_requests || []).map(item => ({
    id: item.id,
    fullName: item.fullName,
    businessName: item.businessName || '',
    email: item.email,
    whatsapp: item.whatsapp,
    websiteUrl: item.websiteUrl || '',
    serviceNeeded: item.serviceNeeded || 'Not Sure',
    message: item.message || '',
    status: item.status || 'Pending',
    notes: item.notes || '',
    createdAt: item.createdAt,
    type: 'audit' as const
  }));

  const contactLeads = (state.contact_messages || []).map(item => ({
    id: item.id,
    fullName: item.fullName,
    businessName: '',
    email: item.email,
    whatsapp: '',
    websiteUrl: '',
    serviceNeeded: item.subject || 'General Inquiry',
    message: item.message,
    status: item.status || 'Pending',
    notes: item.notes || '',
    createdAt: item.createdAt,
    type: 'contact' as const
  }));

  const leads = [...auditLeads, ...contactLeads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({
    ...state,
    leads
  });
});

// Update global site settings
apiRouter.post(['/admin/settings', '/admin/save-settings'], requireAdmin, (req, res) => {
  const update = req.body.settings || req.body;
  dbInstance.updateSection('settings', update);
  res.json({ success: true, data: update });
});

// Update navigation items
apiRouter.post('/admin/navigation', requireAdmin, (req, res) => {
  const items: NavigationItem[] = req.body;
  dbInstance.updateSection('navigation_items', items);
  res.json({ success: true, data: items });
});

// Update hero content section
apiRouter.post(['/admin/hero', '/admin/save-hero-content'], requireAdmin, (req, res) => {
  const update = req.body.heroContent || req.body;
  dbInstance.updateSection('hero_content', update);
  res.json({ success: true, data: update });
});

// Update counter stats
apiRouter.post('/admin/statistics', requireAdmin, (req, res) => {
  const items: StatisticCard[] = req.body;
  dbInstance.updateSection('statistics', items);
  res.json({ success: true, data: items });
});

// Update client logos
apiRouter.post('/admin/client-logos', requireAdmin, (req, res) => {
  const items: ClientLogo[] = req.body;
  dbInstance.updateSection('client_logos', items);
  res.json({ success: true, data: items });
});

// Update services cards list
apiRouter.post(['/admin/services', '/admin/save-services'], requireAdmin, (req, res) => {
  const items = req.body.services || req.body;
  dbInstance.updateSection('services', items);
  res.json({ success: true, data: items });
});

// Update why choose us items list
apiRouter.post('/admin/why-choose-us', requireAdmin, (req, res) => {
  const items: WhyChooseUsItem[] = req.body;
  dbInstance.updateSection('why_choose_us', items);
  res.json({ success: true, data: items });
});

// Update work process step list
apiRouter.post('/admin/work-process', requireAdmin, (req, res) => {
  const items: WorkProcessStep[] = req.body;
  dbInstance.updateSection('work_process', items);
  res.json({ success: true, data: items });
});

// Update pricing plan packages
apiRouter.post(['/admin/packages', '/admin/save-packages'], requireAdmin, (req, res) => {
  const items = req.body.packages || req.body;
  dbInstance.updateSection('packages', items);
  res.json({ success: true, data: items });
});

// Delete a pricing plan package
apiRouter.delete(['/admin/packages/:id', '/admin/delete-package/:id'], requireAdmin, (req, res) => {
  const { id } = req.params;
  const state = dbInstance.getState();
  state.packages = state.packages.filter(p => p.id !== id);
  dbInstance.save();
  res.json({ success: true, message: 'Pricing package deleted successfully' });
});

// Update testimonials
apiRouter.post('/admin/testimonials', requireAdmin, (req, res) => {
  const items: Testimonial[] = req.body;
  dbInstance.updateSection('testimonials', items);
  res.json({ success: true, data: items });
});

// Update FAQs list
apiRouter.post('/admin/faqs', requireAdmin, (req, res) => {
  const items: FAQItem[] = req.body;
  dbInstance.updateSection('faqs', items);
  res.json({ success: true, data: items });
});

// -------------------------------------------------------------------------
// PORTFOLIO CRUD ENDPOINTS
// -------------------------------------------------------------------------

apiRouter.post('/admin/portfolio-categories', requireAdmin, (req, res) => {
  const categories: PortfolioCategory[] = req.body;
  dbInstance.updateSection('portfolio_categories', categories);
  res.json({ success: true, data: categories });
});

apiRouter.post(['/admin/portfolio-projects', '/admin/save-portfolio-projects'], requireAdmin, (req, res) => {
  const items = req.body.projects || req.body;
  dbInstance.updateSection('portfolio_projects', items);
  res.json({ success: true, data: items });
});

apiRouter.delete(['/admin/portfolio-projects/:id', '/admin/delete-portfolio-project/:id'], requireAdmin, (req, res) => {
  const { id } = req.params;
  const state = dbInstance.getState();
  state.portfolio_projects = state.portfolio_projects.filter(p => p.id !== id);
  dbInstance.save();
  res.json({ success: true, message: 'Portfolio project deleted successfully' });
});

// -------------------------------------------------------------------------
// CRM LEAD MANAGEMENT ENDPOINTS
// -------------------------------------------------------------------------

// Update specific Free Audit Request
apiRouter.put('/admin/audit-requests/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const state = dbInstance.getState();
  
  const index = state.audit_requests.findIndex(r => r.id === id);
  if (index === -1) {
     res.status(404).json({ error: 'Audit request not found' });
     return;
  }

  if (status !== undefined) state.audit_requests[index].status = status;
  if (notes !== undefined) state.audit_requests[index].notes = notes;
  
  dbInstance.save();
  res.json({ success: true, data: state.audit_requests[index] });
});

// Delete specific Free Audit Request
apiRouter.delete('/admin/audit-requests/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const state = dbInstance.getState();
  
  const initialLength = state.audit_requests.length;
  state.audit_requests = state.audit_requests.filter(r => r.id !== id);
  
  if (state.audit_requests.length === initialLength) {
     res.status(404).json({ error: 'Audit request not found' });
     return;
  }
  
  dbInstance.save();
  res.json({ success: true, message: 'Audit request deleted successfully' });
});

// Update specific Contact Message
apiRouter.put('/admin/contact-messages/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const state = dbInstance.getState();

  const index = state.contact_messages.findIndex(m => m.id === id);
  if (index === -1) {
     res.status(404).json({ error: 'Contact message not found' });
     return;
  }

  if (status !== undefined) state.contact_messages[index].status = status;
  if (notes !== undefined) state.contact_messages[index].notes = notes;

  dbInstance.save();
  res.json({ success: true, data: state.contact_messages[index] });
});

// Delete specific Contact Message
apiRouter.delete('/admin/contact-messages/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const state = dbInstance.getState();

  const initialLength = state.contact_messages.length;
  state.contact_messages = state.contact_messages.filter(m => m.id !== id);

  if (state.contact_messages.length === initialLength) {
     res.status(404).json({ error: 'Contact message not found' });
     return;
  }

  dbInstance.save();
  res.json({ success: true, message: 'Contact message deleted successfully' });
});

// Generic Leads status and deletion mappings (for Dashboard.tsx compatibility)
apiRouter.put('/admin/leads/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const state = dbInstance.getState();

    if (id.startsWith('audit_')) {
      const idx = state.audit_requests.findIndex(r => r.id === id);
      if (idx !== -1) {
        state.audit_requests[idx].status = status;
        dbInstance.save();
        res.json({ success: true, message: 'Audit request status updated' });
        return;
      }
    } else {
      const idx = state.contact_messages.findIndex(m => m.id === id);
      if (idx !== -1) {
        state.contact_messages[idx].status = status;
        dbInstance.save();
        res.json({ success: true, message: 'Contact message status updated' });
        return;
      }
    }
    res.status(404).json({ error: 'Lead not found' });
  } catch (error) {
    console.error("Lead status update failed", error);
    res.status(500).json({ error: 'Server error updating status' });
  }
});

apiRouter.delete('/admin/leads/:id/delete', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const state = dbInstance.getState();

    if (id.startsWith('audit_')) {
      const initialLength = state.audit_requests.length;
      state.audit_requests = state.audit_requests.filter(r => r.id !== id);
      if (state.audit_requests.length < initialLength) {
        dbInstance.save();
        res.json({ success: true, message: 'Audit request deleted' });
        return;
      }
    } else {
      const initialLength = state.contact_messages.length;
      state.contact_messages = state.contact_messages.filter(m => m.id !== id);
      if (state.contact_messages.length < initialLength) {
        dbInstance.save();
        res.json({ success: true, message: 'Contact message deleted' });
        return;
      }
    }
    res.status(404).json({ error: 'Lead not found' });
  } catch (error) {
    console.error("Lead deletion failed", error);
    res.status(500).json({ error: 'Server error deleting lead' });
  }
});

// -------------------------------------------------------------------------
// MEDIA LIBRARY & BASE64 FILE UPLOAD
// -------------------------------------------------------------------------

apiRouter.post('/admin/media/upload', requireAdmin, (req, res) => {
  try {
    const { fileName, fileType, base64Data } = req.body;

    if (!fileName || !fileType || !base64Data) {
       res.status(400).json({ error: 'Missing required file payload parameters' });
       return;
    }

    // Clean up base64 header if it exists
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Limit size to 5MB (5 * 1024 * 1024)
    if (buffer.length > 5 * 1024 * 1024) {
       res.status(400).json({ error: 'File size exceeds maximum 5MB limit' });
       return;
    }

    // Generate clean file name
    const ext = path.extname(fileName) || '.' + fileType.split('/')[1] || '.png';
    const cleanName = fileName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '_' + Date.now() + ext;
    const savePath = path.join(UPLOADS_DIR, cleanName);

    // Write file to server public folder
    fs.writeFileSync(savePath, buffer);

    const relativeUrl = `/uploads/${cleanName}`;

    // Store in media list
    const newMedia: MediaItem = {
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      fileName: fileName,
      fileUrl: relativeUrl,
      fileSize: buffer.length,
      mimeType: fileType,
      uploadedAt: new Date().toISOString()
    };

    const state = dbInstance.getState();
    state.media.push(newMedia);
    dbInstance.save();

    res.json({ success: true, data: newMedia });
  } catch (error) {
    console.error("Media upload failed", error);
    res.status(500).json({ error: 'Server error writing file' });
  }
});

// Delete media item (by ID in URL or by filePath in body)
apiRouter.delete('/admin/media/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const state = dbInstance.getState();

    const mediaItem = state.media.find(m => m.id === id);
    if (!mediaItem) {
       res.status(404).json({ error: 'Media file not found in database' });
       return;
    }

    // Check if it is a local file
    if (mediaItem.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', mediaItem.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    state.media = state.media.filter(m => m.id !== id);
    dbInstance.save();

    res.json({ success: true, message: 'Media file deleted successfully' });
  } catch (error) {
    console.error("Media deletion failed", error);
    res.status(500).json({ error: 'Server error deleting media asset' });
  }
});

// Delete media item by filePath in body (flexible)
apiRouter.delete('/admin/media', requireAdmin, (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      res.status(400).json({ error: 'filePath is required' });
      return;
    }
    const state = dbInstance.getState();
    const mediaItem = state.media.find(m => m.fileUrl === filePath);

    if (filePath.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), 'public', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    state.media = state.media.filter(m => m.fileUrl !== filePath);
    dbInstance.save();
    res.json({ success: true, message: 'Media file deleted successfully' });
  } catch (error) {
    console.error("Media deletion failed", error);
    res.status(500).json({ error: 'Server error deleting media asset' });
  }
});

// Register external media URL
apiRouter.post('/admin/media-url', requireAdmin, (req, res) => {
  try {
    const { url, name } = req.body;
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }
    const newMedia: MediaItem = {
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      fileName: name || 'Registered Image',
      fileUrl: url,
      fileSize: 0,
      mimeType: 'image/external',
      uploadedAt: new Date().toISOString()
    };
    const state = dbInstance.getState();
    state.media.push(newMedia);
    dbInstance.save();
    res.json({ success: true, data: newMedia });
  } catch (error) {
    console.error("Register media URL failed", error);
    res.status(500).json({ error: 'Server error registering media URL' });
  }
});

// -------------------------------------------------------------------------
// ADMIN ACCOUNT MANAGER
// -------------------------------------------------------------------------

// Update Admin Profile (Credentials / Password)
apiRouter.post('/admin/account', requireAdmin, (req, res) => {
  try {
    const { email, password } = req.body;
    const state = dbInstance.getState();

    if (email) {
      state.admin.email = email;
    }

    if (password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      state.admin.salt = salt;
      state.admin.passwordHash = passwordHash;
    }

    dbInstance.save();
    res.json({ success: true, email: state.admin.email, message: 'Admin credentials updated successfully' });
  } catch (error) {
    console.error("Account update failed", error);
    res.status(500).json({ error: 'Server error updating admin credentials' });
  }
});
