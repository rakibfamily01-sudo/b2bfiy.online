import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../components/AppContext';
import { 
  LayoutDashboard, Laptop, Briefcase, DollarSign, Users, Settings, 
  Image as ImageIcon, LogOut, CheckCircle, Trash2, Edit, Plus, X, Globe,
  Eye, RefreshCw, Star, Info, MessageSquare, ListPlus, ShieldCheck, Mail, Phone, MapPin,
  Menu
} from 'lucide-react';

type AdminTab = 'overview' | 'services' | 'portfolio' | 'packages' | 'leads' | 'content' | 'media' | 'account';

export default function Dashboard() {
  const { data, token, adminEmail, logout, refreshData, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Database lists
  const settings = data?.settings;
  const hero = data?.hero_content;
  const services = data?.services || [];
  const projects = data?.portfolio_projects || [];
  const categories = data?.portfolio_categories || [];
  const packages = data?.packages || [];
  const leads = data?.leads || [];
  const stats = data?.statistics || [];

  // Local CMS States
  const [editingService, setEditingService] = useState<any | null>(null);
  const [confirmDeleteServiceId, setConfirmDeleteServiceId] = useState<string | null>(null);
  
  // Portfolio CRUD State
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projectForm, setProjectForm] = useState({
    id: '',
    title: '',
    slug: '',
    clientName: '',
    thumbnail: '',
    serviceType: 'Website Development',
    categoryId: 'cat1',
    description: '',
    challenge: '',
    solution: '',
    process: '',
    result: '',
    videoUrl: '',
    websiteUrl: '',
    technologies: '',
    tags: '',
    featured: false,
    images: ''
  });

  // Package CRUD State
  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [packageForm, setPackageForm] = useState({
    id: '',
    name: '',
    type: 'monthly',
    price: '',
    currency: '৳',
    period: 'monthly',
    deliveryTime: '',
    features: '',
    mostPopular: false
  });

  // Lead Details Modal
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  // Settings CMS State
  const [settingsForm, setSettingsForm] = useState<any>({ ...settings });
  const [heroForm, setHeroForm] = useState<any>({ ...hero });

  // Media Library State
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaName, setMediaName] = useState('');

  // Sync settings when data is loaded
  React.useEffect(() => {
    if (settings) setSettingsForm({ ...settings });
    if (hero) setHeroForm({ ...hero });
  }, [settings, hero]);

  // Admin Credentials Form State
  const [adminEmailForm, setAdminEmailForm] = useState(adminEmail || '');
  const [adminPasswordForm, setAdminPasswordForm] = useState('');
  const [adminConfirmPasswordForm, setAdminConfirmPasswordForm] = useState('');

  // Sync credentials on mount or email load
  React.useEffect(() => {
    if (adminEmail) {
      setAdminEmailForm(adminEmail);
    }
  }, [adminEmail]);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminPasswordForm) {
      if (adminPasswordForm.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }
      if (adminPasswordForm !== adminConfirmPasswordForm) {
        showToast('Passwords do not match.', 'error');
        return;
      }
    }

    try {
      setLoading(true);
      const payload: any = {};
      if (adminEmailForm) payload.email = adminEmailForm;
      if (adminPasswordForm) payload.password = adminPasswordForm;

      const res = await fetch('/api/admin/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        showToast(result.message || 'Credentials updated successfully!', 'success');
        
        if (adminEmailForm) {
          try {
            localStorage.setItem('b2bfiy_email', adminEmailForm);
          } catch (e) {
            console.warn('[SafeStorage] Failed to write email to localStorage:', e);
          }
        }
        
        setAdminPasswordForm('');
        setAdminConfirmPasswordForm('');
        await refreshData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update credentials.', 'error');
      }
    } catch (err) {
      showToast('Network error updating security settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleReload = async () => {
    setLoading(true);
    await refreshData();
    setLoading(false);
    showToast('Database content reloaded.', 'success');
  };

  // --- SERVICE ACTIONS ---
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      setLoading(true);
      const isNew = !services.some((s: any) => s.id === editingService.id);
      const updatedServices = isNew 
        ? [...services, editingService]
        : services.map((s: any) => s.id === editingService.id ? editingService : s);

      const res = await fetch('/api/admin/save-services', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ services: updatedServices })
      });
      if (res.ok) {
        showToast(isNew ? 'Service card created successfully.' : 'Service card updated successfully.', 'success');
        setEditingService(null);
        refreshData();
      } else {
        showToast('Failed to save service card.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      setLoading(true);
      const updatedServices = services.filter((s: any) => s.id !== serviceId);
      const res = await fetch('/api/admin/save-services', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ services: updatedServices })
      });
      if (res.ok) {
        showToast('Service card deleted successfully.', 'success');
        setConfirmDeleteServiceId(null);
        refreshData();
      } else {
        showToast('Failed to delete service card.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- PORTFOLIO CRUD ACTIONS ---
  const handleOpenProjectForm = (proj: any = null) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({
        id: proj.id,
        title: proj.title,
        slug: proj.slug,
        clientName: proj.clientName,
        thumbnail: proj.thumbnail,
        serviceType: proj.serviceType,
        categoryId: proj.categoryId,
        description: proj.description,
        challenge: proj.challenge || '',
        solution: proj.solution || '',
        process: proj.process || '',
        result: proj.result || '',
        videoUrl: proj.videoUrl || '',
        websiteUrl: proj.websiteUrl || '',
        technologies: proj.technologies.join(', '),
        tags: proj.tags.join(', '),
        featured: proj.featured || false,
        images: proj.images ? proj.images.join(', ') : ''
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        id: '',
        title: '',
        slug: '',
        clientName: '',
        thumbnail: '',
        serviceType: 'Website Development',
        categoryId: 'cat1',
        description: '',
        challenge: '',
        solution: '',
        process: '',
        result: '',
        videoUrl: '',
        websiteUrl: '',
        technologies: '',
        tags: '',
        featured: false,
        images: ''
      });
    }
    setPortfolioFormOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.slug || !projectForm.thumbnail) {
      showToast('Title, Slug, and Thumbnail are required.', 'error');
      return;
    }

    try {
      setLoading(true);
      const itemToSave = {
        id: projectForm.id || 'proj_' + Date.now(),
        title: projectForm.title,
        slug: projectForm.slug,
        clientName: projectForm.clientName || 'B2bfiy Partner',
        thumbnail: projectForm.thumbnail,
        serviceType: projectForm.serviceType,
        categoryId: projectForm.categoryId,
        description: projectForm.description,
        challenge: projectForm.challenge,
        solution: projectForm.solution,
        process: projectForm.process,
        result: projectForm.result,
        videoUrl: projectForm.videoUrl,
        websiteUrl: projectForm.websiteUrl,
        technologies: projectForm.technologies.split(',').map(s => s.trim()).filter(Boolean),
        tags: projectForm.tags.split(',').map(s => s.trim()).filter(Boolean),
        featured: projectForm.featured,
        images: projectForm.images ? projectForm.images.split(',').map(s => s.trim()).filter(Boolean) : [projectForm.thumbnail],
        published: editingProject ? (editingProject.published ?? true) : true,
        date: editingProject ? (editingProject.date || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
      };

      let updatedProjects;
      if (projectForm.id) {
        updatedProjects = projects.map(p => p.id === projectForm.id ? itemToSave : p);
      } else {
        updatedProjects = [itemToSave, ...projects];
      }

      const res = await fetch('/api/admin/save-portfolio-projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projects: updatedProjects })
      });

      if (res.ok) {
        showToast('Portfolio case study saved successfully.', 'success');
        setPortfolioFormOpen(false);
        refreshData();
      } else {
        showToast('Failed to save case study.', 'error');
      }
    } catch (err) {
      showToast('Network error saving project.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this case study?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/delete-portfolio-project/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast('Project deleted successfully.', 'success');
        refreshData();
      } else {
        showToast('Failed to delete project.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- PACKAGE CRUD ACTIONS ---
  const handleOpenPackageForm = (p: any = null) => {
    if (p) {
      setEditingPackage(p);
      setPackageForm({
        id: p.id,
        name: p.name,
        type: p.type,
        price: p.price,
        currency: p.currency || '৳',
        period: p.period,
        deliveryTime: p.deliveryTime || '',
        features: p.features.join('\n'),
        mostPopular: p.mostPopular || false
      });
    } else {
      setEditingPackage(null);
      setPackageForm({
        id: '',
        name: '',
        type: 'monthly',
        price: '',
        currency: '৳',
        period: 'monthly',
        deliveryTime: '',
        features: '',
        mostPopular: false
      });
    }
    setPackageFormOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageForm.name || !packageForm.price) {
      showToast('Name and Price are required.', 'error');
      return;
    }

    try {
      setLoading(true);
      const itemToSave = {
        id: packageForm.id || 'pack_' + Date.now(),
        name: packageForm.name,
        type: packageForm.type,
        price: packageForm.price,
        currency: packageForm.currency,
        period: packageForm.period,
        deliveryTime: packageForm.deliveryTime,
        features: packageForm.features.split('\n').map(s => s.trim()).filter(Boolean),
        mostPopular: packageForm.mostPopular,
        published: editingPackage ? (editingPackage.published ?? true) : true,
        order: editingPackage ? (editingPackage.order ?? 99) : packages.length + 1
      };

      let updatedPackages;
      if (packageForm.id) {
        updatedPackages = packages.map(p => p.id === packageForm.id ? itemToSave : p);
      } else {
        updatedPackages = [...packages, itemToSave];
      }

      const res = await fetch('/api/admin/save-packages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ packages: updatedPackages })
      });

      if (res.ok) {
        showToast('Pricing package saved successfully.', 'success');
        setPackageFormOpen(false);
        refreshData();
      } else {
        showToast('Failed to save package.', 'error');
      }
    } catch (err) {
      showToast('Network error saving package.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!window.confirm('Delete this pricing plan?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/delete-package/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast('Package plan deleted.', 'success');
        refreshData();
      } else {
        showToast('Failed to delete package.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- LEAD STATUS ACTIONS ---
  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/leads/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast('Lead status updated.', 'success');
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead({ ...selectedLead, status });
        }
        refreshData();
      } else {
        showToast('Failed to update status.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Delete this customer lead log permanently?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/leads/${id}/delete`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast('Lead logged deleted.', 'success');
        setSelectedLead(null);
        refreshData();
      } else {
        showToast('Deletion error.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- WEBPAGE CONTENT ACTIONS ---
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Save global configuration settings
      const setRes = await fetch('/api/admin/save-settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings: settingsForm })
      });

      // Save hero presentation layout
      const heroRes = await fetch('/api/admin/save-hero-content', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ heroContent: heroForm })
      });

      if (setRes.ok && heroRes.ok) {
        showToast('Website configurations and SEO content updated!', 'success');
        refreshData();
      } else {
        showToast('Failed to save website parameters.', 'error');
      }
    } catch (err) {
      showToast('Network error saving CMS details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGO & FAVICON UPLOADS ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data: base64String
          })
        });

        const resData = await res.json();
        if (res.ok && resData.success && resData.data?.fileUrl) {
          setSettingsForm((prev: any) => ({ ...prev, logo: resData.data.fileUrl }));
          showToast('Custom logo uploaded successfully. Apply settings to save!', 'success');
        } else {
          showToast(resData.error || 'Failed to upload logo.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Error reading file.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data: base64String
          })
        });

        const resData = await res.json();
        if (res.ok && resData.success && resData.data?.fileUrl) {
          setSettingsForm((prev: any) => ({ ...prev, favicon: resData.data.fileUrl }));
          showToast('Custom favicon uploaded successfully. Apply settings to save!', 'success');
        } else {
          showToast(resData.error || 'Failed to upload favicon.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Error reading file.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data: base64String
          })
        });

        const resData = await res.json();
        if (res.ok && resData.success && resData.data?.fileUrl) {
          setHeroForm((prev: any) => ({ ...prev, imagePath: resData.data.fileUrl }));
          showToast('Hero presentation image uploaded successfully. Apply settings to save!', 'success');
        } else {
          showToast(resData.error || 'Failed to upload hero image.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Error reading file.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // --- CUSTOM DIRECT UPLOADS FOR PORTFOLIO & MEDIA LIBRARY ---
  const handleProjectThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data: base64String
          })
        });

        const resData = await res.json();
        if (res.ok && resData.success && resData.data?.fileUrl) {
          setProjectForm((prev: any) => ({ ...prev, thumbnail: resData.data.fileUrl }));
          showToast('Project thumbnail uploaded and populated successfully!', 'success');
        } else {
          showToast(resData.error || 'Failed to upload project thumbnail.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Error reading file.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data: base64String
          })
        });

        const resData = await res.json();
        if (res.ok && resData.success && resData.data?.fileUrl) {
          setProjectForm((prev: any) => {
            const currentImages = prev.images ? prev.images.trim() : '';
            const appended = currentImages ? `${currentImages}, ${resData.data.fileUrl}` : resData.data.fileUrl;
            return { ...prev, images: appended };
          });
          showToast('Gallery screenshot uploaded and appended!', 'success');
        } else {
          showToast(resData.error || 'Failed to upload gallery screenshot.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Error reading file.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProjectGalleryImage = (imgUrl: string) => {
    setProjectForm((prev: any) => {
      const currentImages = prev.images ? prev.images.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      const updatedImages = currentImages.filter((url: string) => url !== imgUrl);
      return { ...prev, images: updatedImages.join(', ') };
    });
    showToast('Gallery image removed from this project.', 'info');
  };

  const handleMediaLibraryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data: base64String
          })
        });

        const resData = await res.json();
        if (res.ok && resData.success) {
          showToast('Local image file successfully uploaded & registered in library!', 'success');
          refreshData();
        } else {
          showToast(resData.error || 'Failed to upload file to media library.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Error reading file.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- MEDIA ACTIONS ---
  const handleRegisterMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) return;

    try {
      setLoading(true);
      const res = await fetch('/api/admin/media-url', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: mediaUrl, name: mediaName || 'Registered Image' })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('External asset path registered to library.', 'success');
        setMediaUrl('');
        setMediaName('');
        refreshData();
      } else {
        showToast(data.error || 'Failed to register image url.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (filePath: string) => {
    if (!window.confirm('Remove this asset from media library?')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filePath })
      });
      if (res.ok) {
        showToast('Asset removed from file database.', 'success');
        refreshData();
      } else {
        showToast('Failed to remove asset.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-light-bg text-left relative overflow-x-hidden">
      
      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />
            {/* Drawer Container */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-brand-dark text-brand-pure-white flex flex-col justify-between z-50 border-r border-gray-800 lg:hidden"
            >
              <div>
                {/* Admin Identity with close button */}
                <div className="h-20 border-b border-gray-800 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center font-bold text-lg">
                      B
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm leading-tight text-brand-pure-white">B2bfiy Admin</h4>
                      <span className="text-[10px] text-gray-500 font-semibold block">Signed in as {adminEmail || 'Admin'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Items */}
                <nav className="p-4 flex flex-col gap-1">
                  {[
                    { id: 'overview', label: 'CRM Overview', icon: LayoutDashboard },
                    { id: 'leads', label: 'Leads CRM', icon: Users, badge: leads.filter(l => l.status === 'Pending').length },
                    { id: 'portfolio', label: 'Case Studies', icon: Briefcase },
                    { id: 'packages', label: 'Pricing Plans', icon: DollarSign },
                    { id: 'services', label: 'Services Options', icon: Laptop },
                    { id: 'content', label: 'Website CMS & SEO', icon: Settings },
                    { id: 'media', label: 'Media Library', icon: ImageIcon },
                    { id: 'account', label: 'Admin Security', icon: ShieldCheck },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as AdminTab);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-brand-primary text-brand-pure-white shadow-md' 
                            : 'text-gray-400 hover:text-brand-pure-white hover:bg-gray-800'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </span>
                        {item.badge ? (
                          <span className="bg-brand-primary text-brand-pure-white text-[9px] px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom controls */}
              <div className="p-4 border-t border-gray-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:text-brand-pure-white hover:bg-red-950 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Secure Session
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR NAVIGATION (DESKTOP) */}
      <aside className="hidden lg:flex w-64 bg-brand-dark text-brand-pure-white flex-col justify-between border-r border-gray-800 shrink-0">
        <div>
          {/* Admin Identity */}
          <div className="h-20 border-b border-gray-800 px-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center font-bold text-lg">
              B
            </div>
            <div>
              <h4 className="font-extrabold text-sm leading-tight text-brand-pure-white">B2bfiy Admin</h4>
              <span className="text-[10px] text-gray-500 font-semibold block">Signed in as {adminEmail || 'Admin'}</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 flex flex-col gap-1">
            {[
              { id: 'overview', label: 'CRM Overview', icon: LayoutDashboard },
              { id: 'leads', label: 'Leads CRM', icon: Users, badge: leads.filter(l => l.status === 'Pending').length },
              { id: 'portfolio', label: 'Case Studies', icon: Briefcase },
              { id: 'packages', label: 'Pricing Plans', icon: DollarSign },
              { id: 'services', label: 'Services Options', icon: Laptop },
              { id: 'content', label: 'Website CMS & SEO', icon: Settings },
              { id: 'media', label: 'Media Library', icon: ImageIcon },
              { id: 'account', label: 'Admin Security', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand-primary text-brand-pure-white shadow-md' 
                      : 'text-gray-400 hover:text-brand-pure-white hover:bg-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="bg-brand-primary text-brand-pure-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:text-brand-pure-white hover:bg-red-950 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout Secure Session
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN VIEWPORT */}
      <main className="flex-grow flex flex-col min-h-screen overflow-x-hidden overflow-y-auto">
        {/* Dynamic header */}
        <header className="h-20 bg-brand-pure-white border-b border-brand-border px-4 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 lg:hidden text-brand-dark hover:text-brand-primary hover:bg-brand-soft-red rounded-lg transition-colors cursor-pointer"
              title="Open Admin Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xs sm:text-sm md:text-lg font-black text-brand-dark uppercase tracking-wider truncate max-w-[130px] sm:max-w-none">
              {activeTab === 'overview' && 'CRM Overview'}
              {activeTab === 'services' && 'Services Options'}
              {activeTab === 'portfolio' && 'Case Studies'}
              {activeTab === 'packages' && 'Pricing Plans'}
              {activeTab === 'leads' && 'Customer Leads'}
              {activeTab === 'content' && 'Website CMS'}
              {activeTab === 'media' && 'Media Library'}
              {activeTab === 'account' && 'Admin Security Settings'}
            </h1>
            {loading && <RefreshCw className="w-4 h-4 text-brand-primary animate-spin shrink-0" />}
          </div>

          <div className="flex items-center gap-2 md:gap-3.5">
            <button
              onClick={() => window.open('/', '_blank')}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-brand-soft-red hover:bg-brand-primary hover:text-brand-pure-white text-brand-primary text-[10px] font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Globe className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View Live Website</span><span className="sm:hidden">Live Site</span>
            </button>
            <button
              onClick={handleReload}
              className="p-2 text-brand-secondary hover:text-brand-primary hover:bg-brand-warm-bg rounded-lg transition-colors cursor-pointer shrink-0"
              title="Refresh cache"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Active Content rendering wrapper */}
        <div className="p-4 md:p-8 flex-grow">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              {/* Counter Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-secondary">Total CRM Leads</span>
                    <h3 className="text-2xl font-black text-brand-dark mt-1">{leads.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold">L</div>
                </div>

                <div className="bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-secondary">Pending Audits</span>
                    <h3 className="text-2xl font-black text-brand-dark mt-1">{leads.filter(l => l.status === 'Pending' && l.type === 'audit').length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-brand-primary font-bold">P</div>
                </div>

                <div className="bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-secondary">Published Projects</span>
                    <h3 className="text-2xl font-black text-brand-dark mt-1">{projects.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 font-bold">S</div>
                </div>

                <div className="bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-secondary">Active Pricing Plans</span>
                    <h3 className="text-2xl font-black text-brand-dark mt-1">{packages.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 font-bold">৳</div>
                </div>
              </div>

              {/* CRM Leads Quick Peek */}
              <div className="bg-brand-pure-white rounded-3xl border border-brand-border p-6 shadow-soft-card">
                <div className="flex justify-between items-center border-b border-brand-warm-bg pb-4 mb-4">
                  <h4 className="font-extrabold text-sm text-brand-dark">Latest Incoming Client Leads</h4>
                  <button onClick={() => setActiveTab('leads')} className="text-xs font-bold text-brand-primary hover:underline">Manage All CRM Leads</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border text-[10px] uppercase font-bold text-brand-secondary">
                        <th className="py-3 px-2">Client Name</th>
                        <th className="py-3 px-2">WhatsApp</th>
                        <th className="py-3 px-2">Service Type</th>
                        <th className="py-3 px-2">Date Received</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {leads.slice(0, 5).map((l) => (
                        <tr key={l.id} className="border-b border-brand-warm-bg hover:bg-brand-warm-bg">
                          <td className="py-3.5 px-2 font-bold text-brand-dark">
                            {l.fullName}
                            {l.businessName && <span className="block text-[10px] text-brand-secondary font-medium">{l.businessName}</span>}
                          </td>
                          <td className="py-3.5 px-2 font-medium">{l.whatsapp}</td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-0.5 bg-brand-soft-red text-brand-primary rounded-full font-bold text-[10px] uppercase">
                              {l.type === 'audit' ? 'Free Audit' : 'Contact form'}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-brand-secondary">{new Date(l.createdAt).toLocaleDateString()}</td>
                          <td className="py-3.5 px-2 text-right">
                            <button
                              onClick={() => { setSelectedLead(l); setActiveTab('leads'); }}
                              className="px-3 py-1 bg-brand-dark text-brand-pure-white rounded-lg hover:bg-brand-primary text-[10px] font-bold cursor-pointer"
                            >
                              Open Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-brand-secondary font-medium">
                            No client leads have been submitted yet. Run a promotion to drive contacts!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === 'services' && (
            <div className="flex flex-col gap-8">
              {editingService ? (
                <form onSubmit={handleSaveService} className="bg-brand-pure-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-soft-card max-w-2xl">
                  <div className="flex justify-between items-center border-b border-brand-warm-bg pb-3 mb-6">
                    <h3 className="font-extrabold text-sm text-brand-dark">
                      {services.some((s: any) => s.id === editingService.id) 
                        ? `Editing ${editingService.title || 'Service'} Details` 
                        : 'Create New Service Option'}
                    </h3>
                    <button type="button" onClick={() => setEditingService(null)} className="p-1 rounded bg-brand-warm-bg hover:bg-brand-soft-red text-brand-secondary hover:text-brand-primary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Service Title</label>
                      <input
                        type="text"
                        required
                        value={editingService.title}
                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                        placeholder="e.g. Graphic & UI/UX Design"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Service Description</label>
                      <textarea
                        required
                        value={editingService.description}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        rows={4}
                        placeholder="Describe the service details to attract clients..."
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Capabilities / Bullet Features (comma-separated)</label>
                      <input
                        type="text"
                        value={editingService.features.join(', ')}
                        onChange={(e) => setEditingService({ ...editingService, features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="e.g. Brand Identity, Logo Design, Figma Prototypes"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-brand-dark mb-2">Service Icon (Lucide Icon Name)</label>
                        <select
                          value={editingService.iconName || 'Laptop'}
                          onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                          className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                        >
                          <option value="Laptop">Laptop (Web Design & Dev)</option>
                          <option value="Palette">Palette (Brand Design)</option>
                          <option value="Video">Video (Social Video Editing)</option>
                          <option value="Users">Users (Social Media Management)</option>
                          <option value="TrendingUp">TrendingUp (SEO / Organic Traffic)</option>
                          <option value="Globe">Globe (Global Marketing)</option>
                          <option value="Star">Star (Premium Support)</option>
                          <option value="Briefcase">Briefcase (Business Strategy)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-dark mb-2">Display Order</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={editingService.order || 1}
                          onChange={(e) => setEditingService({ ...editingService, order: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={editingService.published !== false}
                        onChange={(e) => setEditingService({ ...editingService, published: e.target.checked })}
                        className="w-4 h-4 text-brand-primary border-brand-border rounded focus:ring-brand-primary cursor-pointer"
                      />
                      <label htmlFor="published" className="text-xs font-bold text-brand-dark select-none cursor-pointer">
                        Published (Visible on public website)
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <button type="button" onClick={() => setEditingService(null)} className="px-5 py-2.5 bg-brand-warm-bg hover:bg-brand-soft-red text-brand-secondary hover:text-brand-primary text-xs font-bold rounded-full transition-all">
                        Cancel Adjustments
                      </button>
                      <button type="submit" disabled={loading} className="px-5 py-2.5 bg-brand-primary text-brand-pure-white text-xs font-bold rounded-full hover:bg-brand-coral transition-all">
                        {loading ? 'Saving...' : 'Save Service Card'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card">
                    <div>
                      <h3 className="font-extrabold text-base text-brand-dark">Our CMS Services ({services.length})</h3>
                      <p className="text-brand-secondary text-xs mt-1">Manage the services that appear on your homepage and service directory pages.</p>
                    </div>
                    <button
                      onClick={() => setEditingService({
                        id: 'srv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                        title: '',
                        description: '',
                        features: [],
                        iconName: 'Laptop',
                        order: services.length + 1,
                        published: true
                      })}
                      className="self-start sm:self-auto px-5 py-3 bg-brand-primary text-brand-pure-white text-xs font-bold rounded-full hover:bg-brand-coral transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add New Service
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((srv) => (
                      <div key={srv.id} className="bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-extrabold text-base text-brand-dark flex items-center gap-2">
                              {srv.title}
                              {!srv.published && (
                                <span className="text-[9px] font-bold text-brand-primary bg-brand-soft-red px-2 py-0.5 rounded-full uppercase">Draft</span>
                              )}
                            </h4>
                            <span className="text-[10px] uppercase font-bold text-brand-secondary bg-brand-warm-bg border px-2 py-0.5 rounded-full">{srv.iconName}</span>
                          </div>
                          <p className="text-brand-secondary text-xs leading-relaxed mb-4">{srv.description}</p>
                          
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {srv.features.map((f, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-brand-soft-red text-brand-primary rounded-full font-bold">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2.5">
                          <button
                            onClick={() => setEditingService(srv)}
                            className="flex-1 py-2.5 bg-brand-warm-bg border border-brand-border text-brand-primary hover:bg-brand-primary hover:text-brand-pure-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit CMS Card
                          </button>

                          {confirmDeleteServiceId === srv.id ? (
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => handleDeleteService(srv.id)}
                                className="px-3 py-2.5 bg-brand-primary hover:bg-brand-coral text-brand-pure-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteServiceId(null)}
                                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteServiceId(srv.id)}
                              className="px-3.5 py-2.5 bg-brand-warm-bg border border-brand-border text-brand-secondary hover:bg-brand-soft-red hover:text-brand-primary rounded-xl transition-all cursor-pointer flex items-center justify-center"
                              title="Delete Service Card"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="flex flex-col gap-8">
              {portfolioFormOpen ? (
                <form onSubmit={handleSaveProject} className="bg-brand-pure-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-soft-card max-w-3xl">
                  <div className="flex justify-between items-center border-b border-brand-warm-bg pb-3 mb-6">
                    <h3 className="font-extrabold text-sm text-brand-dark">
                      {projectForm.id ? `Edit ${projectForm.title} Case Study` : 'Create New Portfolio Project Case Study'}
                    </h3>
                    <button type="button" onClick={() => setPortfolioFormOpen(false)} className="p-1 rounded bg-brand-warm-bg hover:bg-brand-soft-red text-brand-secondary">
                      <X className="w-4 h-4" onClick={() => setPortfolioFormOpen(false)} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Project Title *</label>
                      <input
                        type="text"
                        required
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        placeholder="e.g. Pizza House E-commerce App"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Project Slug * (lowercase, unique)</label>
                      <input
                        type="text"
                        required
                        value={projectForm.slug}
                        onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                        placeholder="e.g. pizza-house-ecommerce"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none font-semibold text-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Client Brand Name</label>
                      <input
                        type="text"
                        value={projectForm.clientName}
                        onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                        placeholder="e.g. Pizza House BD"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Service Category Type</label>
                      <select
                        value={projectForm.categoryId}
                        onChange={(e) => setProjectForm({ ...projectForm, categoryId: e.target.value })}
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none font-semibold"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                     <div className="bg-brand-warm-bg/25 p-4 rounded-2xl border border-brand-border/60">
                       <div className="flex justify-between items-center mb-2">
                         <label className="block text-xs font-bold text-brand-dark">Thumbnail Link URL *</label>
                         <label className="text-[10px] text-brand-primary font-extrabold hover:text-brand-coral cursor-pointer flex items-center gap-1 bg-brand-pure-white px-2 py-1 rounded-md border border-brand-border transition-colors shadow-sm">
                           <ImageIcon className="w-3 h-3" /> Direct Upload Image
                           <input
                             type="file"
                             accept="image/*"
                             onChange={handleProjectThumbnailUpload}
                             className="hidden"
                           />
                         </label>
                       </div>
                       <div className="flex gap-3 items-center">
                         <div className="w-14 h-14 bg-brand-pure-white border border-brand-border rounded-xl flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-sm">
                           {projectForm.thumbnail ? (
                             <img src={projectForm.thumbnail} alt="Thumbnail Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                           ) : (
                             <span className="text-[9px] text-brand-secondary font-bold text-center">No Image</span>
                           )}
                         </div>
                         <div className="flex-1">
                           <input
                             type="text"
                             required
                             value={projectForm.thumbnail}
                             onChange={(e) => setProjectForm({ ...projectForm, thumbnail: e.target.value })}
                             placeholder="e.g. https://images.unsplash.com/photo-..."
                             className="w-full px-3 py-2 text-xs bg-brand-pure-white border border-brand-border rounded-lg focus:border-brand-primary outline-none font-mono text-[10px]"
                           />
                         </div>
                       </div>
                     </div>

                     <div className="bg-brand-warm-bg/25 p-4 rounded-2xl border border-brand-border/60">
                       <div className="flex justify-between items-center mb-2">
                         <label className="block text-xs font-bold text-brand-dark">Screenshot Gallery</label>
                         <label className="text-[10px] text-brand-primary font-extrabold hover:text-brand-coral cursor-pointer flex items-center gap-1 bg-brand-pure-white px-2.5 py-1 rounded-md border border-brand-border transition-colors shadow-sm">
                           <Plus className="w-3 h-3" /> Upload & Append Image
                           <input
                             type="file"
                             accept="image/*"
                             onChange={handleProjectGalleryUpload}
                             className="hidden"
                           />
                         </label>
                       </div>
                       
                       <input
                         type="text"
                         value={projectForm.images}
                         onChange={(e) => setProjectForm({ ...projectForm, images: e.target.value })}
                         placeholder="e.g. link1, link2"
                         className="w-full px-3 py-2 text-xs bg-brand-pure-white border border-brand-border rounded-lg focus:border-brand-primary outline-none font-mono text-[10px] mb-3"
                       />

                       {projectForm.images ? (
                         <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-border/40">
                           {projectForm.images.split(',').map((s) => s.trim()).filter(Boolean).map((imgUrl, idx) => (
                             <div key={idx} className="relative w-12 h-12 rounded-lg bg-brand-pure-white border border-brand-border p-1 overflow-hidden group shadow-sm shrink-0">
                               <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                               <button
                                 type="button"
                                 onClick={() => handleRemoveProjectGalleryImage(imgUrl)}
                                 className="absolute -top-1 -right-1 bg-brand-primary hover:bg-brand-coral text-brand-pure-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                 title="Remove image"
                               >
                                 <X className="w-2.5 h-2.5" />
                               </button>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <p className="text-[10px] text-brand-secondary italic">No screenshot gallery images added yet.</p>
                       )}
                     </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">YouTube Presentation Link (optional)</label>
                      <input
                        type="text"
                        value={projectForm.videoUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, videoUrl: e.target.value })}
                        placeholder="e.g. https://youtube.com/watch?v=..."
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Live App Link (optional)</label>
                      <input
                        type="text"
                        value={projectForm.websiteUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, websiteUrl: e.target.value })}
                        placeholder="e.g. https://example.com"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Tech Stack Used (comma-separated)</label>
                      <input
                        type="text"
                        value={projectForm.technologies}
                        onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                        placeholder="e.g. React, Node, Tailwind"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Project Keywords Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={projectForm.tags}
                        onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                        placeholder="e.g. UI/UX, ecom, fast"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-6 sm:col-span-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={projectForm.featured}
                        onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                        className="w-4.5 h-4.5 accent-brand-primary"
                      />
                      <label htmlFor="featured" className="text-xs font-bold text-brand-dark cursor-pointer">
                        Pin to Website Front Showcase Hero Projects
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 mb-8">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Brief Summary description</label>
                      <textarea
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none resize-none"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-brand-dark mb-2">The Client Challenge</label>
                        <textarea
                          value={projectForm.challenge}
                          onChange={(e) => setProjectForm({ ...projectForm, challenge: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-dark mb-2">Our Implemented Solution</label>
                        <textarea
                          value={projectForm.solution}
                          onChange={(e) => setProjectForm({ ...projectForm, solution: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-dark mb-2">The Production Pipeline Process</label>
                        <textarea
                          value={projectForm.process}
                          onChange={(e) => setProjectForm({ ...projectForm, process: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-dark mb-2">End Business Result</label>
                        <textarea
                          value={projectForm.result}
                          onChange={(e) => setProjectForm({ ...projectForm, result: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-brand-warm-bg pt-5">
                    <button type="button" onClick={() => setPortfolioFormOpen(false)} className="px-5 py-2.5 bg-brand-warm-bg hover:bg-brand-soft-red text-brand-secondary text-xs font-bold rounded-full cursor-pointer">
                      Discard
                    </button>
                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-brand-primary text-brand-pure-white text-xs font-bold rounded-full hover:bg-brand-coral cursor-pointer">
                      Save Case Study
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-brand-pure-white rounded-3xl border border-brand-border p-6 shadow-soft-card">
                  <div className="flex justify-between items-center border-b border-brand-warm-bg pb-4 mb-4">
                    <h4 className="font-extrabold text-sm text-brand-dark">Case Studies Portfolio Projects</h4>
                    <button
                      onClick={() => handleOpenProjectForm()}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-coral text-brand-pure-white text-[10px] font-bold rounded-full transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Case Study
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border text-[10px] uppercase font-bold text-brand-secondary">
                          <th className="py-3 px-2">Project Thumbnail & Title</th>
                          <th className="py-3 px-2">Slug</th>
                          <th className="py-3 px-2">Category</th>
                          <th className="py-3 px-2">Featured</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {projects.map((p) => {
                          const categoryName = categories.find(c => c.id === p.categoryId)?.name || 'General';
                          return (
                            <tr key={p.id} className="border-b border-brand-warm-bg hover:bg-brand-warm-bg">
                              <td className="py-3 px-2 flex items-center gap-3">
                                <img src={p.thumbnail} alt={p.title} className="w-12 h-9 rounded object-cover shrink-0 border border-brand-border" referrerPolicy="no-referrer" />
                                <div>
                                  <span className="font-bold text-brand-dark block">{p.title}</span>
                                  <span className="text-[10px] text-brand-secondary font-semibold">{p.clientName}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 font-mono text-[10px] text-brand-primary font-bold">{p.slug}</td>
                              <td className="py-3 px-2 font-medium">{categoryName}</td>
                              <td className="py-3 px-2">
                                {p.featured ? (
                                  <span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold text-[9px] rounded-full border border-green-200">Featured</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenProjectForm(p)}
                                    className="p-1.5 hover:bg-brand-soft-red text-brand-secondary hover:text-brand-primary rounded transition-all cursor-pointer"
                                    title="Edit Case Study"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProject(p.id)}
                                    className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition-all cursor-pointer"
                                    title="Delete Project"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {projects.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-brand-secondary">No portfolio case studies inside database.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PACKAGES */}
          {activeTab === 'packages' && (
            <div className="flex flex-col gap-8">
              {packageFormOpen ? (
                <form onSubmit={handleSavePackage} className="bg-brand-pure-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-soft-card max-w-2xl">
                  <div className="flex justify-between items-center border-b border-brand-warm-bg pb-3 mb-6">
                    <h3 className="font-extrabold text-sm text-brand-dark">
                      {packageForm.id ? `Edit ${packageForm.name} Package` : 'Create New Pricing Package Plan'}
                    </h3>
                    <button type="button" onClick={() => setPackageFormOpen(false)} className="p-1 rounded bg-brand-warm-bg hover:bg-brand-soft-red text-brand-secondary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Package Name *</label>
                      <input
                        type="text"
                        required
                        value={packageForm.name}
                        onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                        placeholder="e.g. Professional Growth Plan"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Package Type Segment</label>
                      <select
                        value={packageForm.type}
                        onChange={(e) => setPackageForm({ ...packageForm, type: e.target.value })}
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none font-semibold"
                      >
                        <option value="monthly">Monthly SMM Plans</option>
                        <option value="website">Web Development Packages</option>
                        <option value="graphic">Graphic Design Packages</option>
                        <option value="video">Video Editing Packages</option>
                        <option value="bundle">Business Launch Bundles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Price Amount * (numeric)</label>
                      <input
                        type="text"
                        required
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                        placeholder="e.g. 25000"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none font-bold text-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Billing Period</label>
                      <input
                        type="text"
                        value={packageForm.period}
                        onChange={(e) => setPackageForm({ ...packageForm, period: e.target.value })}
                        placeholder="e.g. month, project, logo, pack"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Estimated Delivery Time</label>
                      <input
                        type="text"
                        value={packageForm.deliveryTime}
                        onChange={(e) => setPackageForm({ ...packageForm, deliveryTime: e.target.value })}
                        placeholder="e.g. 10 - 15 Days, Weekly Feed"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-2">Price Currency</label>
                      <input
                        type="text"
                        value={packageForm.currency}
                        onChange={(e) => setPackageForm({ ...packageForm, currency: e.target.value })}
                        placeholder="e.g. ৳"
                        className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-bold text-brand-dark mb-2">Features Included (one feature per line)</label>
                    <textarea
                      required
                      value={packageForm.features}
                      onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                      placeholder="Figma Creative UX Layouts&#10;Original post designs weekly&#10;Social posting strategically"
                      rows={6}
                      className="w-full px-4 py-3 text-xs bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none font-medium resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <input
                      type="checkbox"
                      id="mostPopular"
                      checked={packageForm.mostPopular}
                      onChange={(e) => setPackageForm({ ...packageForm, mostPopular: e.target.checked })}
                      className="w-4.5 h-4.5 accent-brand-primary"
                    />
                    <label htmlFor="mostPopular" className="text-xs font-bold text-brand-dark cursor-pointer">
                      Highlight as "Most Popular Choice" Plan Card
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-brand-warm-bg pt-5">
                    <button type="button" onClick={() => setPackageFormOpen(false)} className="px-5 py-2.5 bg-brand-warm-bg hover:bg-brand-soft-red text-brand-secondary text-xs font-bold rounded-full">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-brand-primary text-brand-pure-white text-xs font-bold rounded-full">Save Plan</button>
                  </div>
                </form>
              ) : (
                <div className="bg-brand-pure-white rounded-3xl border border-brand-border p-6 shadow-soft-card">
                  <div className="flex justify-between items-center border-b border-brand-warm-bg pb-4 mb-4">
                    <h4 className="font-extrabold text-sm text-brand-dark">Standard Pricing Plans</h4>
                    <button
                      onClick={() => handleOpenPackageForm()}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-coral text-brand-pure-white text-[10px] font-bold rounded-full flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Plan
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border text-[10px] uppercase font-bold text-brand-secondary">
                          <th className="py-3 px-2">Package Name</th>
                          <th className="py-3 px-2">Type Segment</th>
                          <th className="py-3 px-2">Price Value</th>
                          <th className="py-3 px-2">Popular</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {packages.map((pk) => (
                          <tr key={pk.id} className="border-b border-brand-warm-bg hover:bg-brand-warm-bg">
                            <td className="py-3 px-2 font-bold text-brand-dark">
                              {pk.name}
                              {pk.deliveryTime && <span className="block text-[9px] text-brand-secondary font-medium mt-0.5">Delivery: {pk.deliveryTime}</span>}
                            </td>
                            <td className="py-3 px-2 font-mono text-[10px] uppercase text-brand-primary font-semibold">{pk.type}</td>
                            <td className="py-3 px-2 font-bold">{pk.currency}{pk.price} / {pk.period}</td>
                            <td className="py-3 px-2">
                              {pk.mostPopular ? (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[9px] rounded-full border border-amber-200">Popular</span>
                              ) : '-'}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button onClick={() => handleOpenPackageForm(pk)} className="p-1.5 hover:bg-brand-soft-red text-brand-secondary hover:text-brand-primary rounded"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeletePackage(pk.id)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: LEADS CRM */}
          {activeTab === 'leads' && (
            <div className="flex flex-col gap-8">
              {/* Lead detail profiles modal render */}
              {selectedLead && (
                <div className="bg-brand-pure-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-lg max-w-2xl relative">
                  <button onClick={() => setSelectedLead(null)} className="absolute top-6 right-6 p-1 bg-brand-warm-bg hover:bg-brand-soft-red text-brand-secondary rounded-full">
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="font-extrabold text-base text-brand-dark border-b border-brand-warm-bg pb-3 mb-6">Client Lead Profile</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs text-brand-secondary">
                    <div>
                      <strong className="block text-brand-dark mb-1 font-bold">Client Name:</strong>
                      <span>{selectedLead.fullName}</span>
                    </div>
                    <div>
                      <strong className="block text-brand-dark mb-1 font-bold">WhatsApp Call Number:</strong>
                      <a href={`https://wa.me/${selectedLead.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-brand-primary font-bold hover:underline">{selectedLead.whatsapp}</a>
                    </div>
                    <div>
                      <strong className="block text-brand-dark mb-1 font-bold">Email Address:</strong>
                      <a href={`mailto:${selectedLead.email}`} className="text-brand-primary font-bold hover:underline">{selectedLead.email}</a>
                    </div>
                    {selectedLead.businessName && (
                      <div>
                        <strong className="block text-brand-dark mb-1 font-bold">Business Name:</strong>
                        <span>{selectedLead.businessName}</span>
                      </div>
                    )}
                    {selectedLead.websiteUrl && (
                      <div className="sm:col-span-2">
                        <strong className="block text-brand-dark mb-1 font-bold">Current Website/Page URL:</strong>
                        <a href={selectedLead.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{selectedLead.websiteUrl}</a>
                      </div>
                    )}
                    {selectedLead.serviceNeeded && (
                      <div>
                        <strong className="block text-brand-dark mb-1 font-bold">Service Needed:</strong>
                        <span className="px-2 py-0.5 bg-brand-soft-red text-brand-primary rounded font-bold text-[10px]">{selectedLead.serviceNeeded}</span>
                      </div>
                    )}
                    <div>
                      <strong className="block text-brand-dark mb-1 font-bold">Inquiry Type:</strong>
                      <span className="uppercase font-bold text-gray-500">{selectedLead.type}</span>
                    </div>
                    {selectedLead.message && (
                      <div className="sm:col-span-2 bg-brand-warm-bg p-4 rounded-xl border border-brand-border">
                        <strong className="block text-brand-dark mb-1.5 font-bold">Inquiry message/goals:</strong>
                        <p className="text-xs text-brand-secondary whitespace-pre-line leading-relaxed">{selectedLead.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-brand-warm-bg pt-5">
                    <button onClick={() => handleDeleteLead(selectedLead.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-full cursor-pointer">
                      Delete Lead Log
                    </button>
                    <div className="flex items-center gap-2">
                      {selectedLead.status === 'Pending' ? (
                        <button
                          onClick={() => handleUpdateLeadStatus(selectedLead.id, 'Contacted')}
                          className="px-5 py-2 bg-brand-primary text-brand-pure-white hover:bg-brand-success font-bold text-xs rounded-full cursor-pointer"
                        >
                          Mark as Contacted
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateLeadStatus(selectedLead.id, 'Pending')}
                          className="px-5 py-2 bg-brand-warm-bg border text-brand-secondary font-bold text-xs rounded-full cursor-pointer"
                        >
                          Set to Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Leads Table database */}
              <div className="bg-brand-pure-white rounded-3xl border border-brand-border p-6 shadow-soft-card">
                <div className="flex justify-between items-center border-b border-brand-warm-bg pb-4 mb-4">
                  <h4 className="font-extrabold text-sm text-brand-dark">Client Leads Registry ({leads.length})</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border text-[10px] uppercase font-bold text-brand-secondary">
                        <th className="py-3 px-2">Name & Company</th>
                        <th className="py-3 px-2">Inquiry Type</th>
                        <th className="py-3 px-2">Contacts Details</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {leads.map((l) => (
                        <tr key={l.id} className="border-b border-brand-warm-bg hover:bg-brand-warm-bg">
                          <td className="py-4 px-2 font-bold text-brand-dark">
                            {l.fullName}
                            {l.businessName && <span className="block text-[10px] font-semibold text-brand-secondary">{l.businessName}</span>}
                          </td>
                          <td className="py-4 px-2">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                              l.type === 'audit' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-pink-50 text-pink-700 border border-pink-200'
                            }`}>
                              {l.type === 'audit' ? 'Free Audit' : 'Contact form'}
                            </span>
                          </td>
                          <td className="py-4 px-2 font-medium">
                            <span className="block">{l.whatsapp}</span>
                            <span className="block text-[10px] text-brand-secondary">{l.email}</span>
                          </td>
                          <td className="py-4 px-2">
                            {l.status === 'Pending' ? (
                              <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 font-bold text-[9px] rounded-full border border-yellow-200 animate-pulse">Pending</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold text-[9px] rounded-full border border-green-200">Contacted</span>
                            )}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => setSelectedLead(l)} className="px-2.5 py-1 bg-brand-soft-red hover:bg-brand-primary hover:text-brand-pure-white text-brand-primary text-[10px] font-bold rounded-lg transition-colors cursor-pointer">
                                Profile
                              </button>
                              <button onClick={() => handleDeleteLead(l.id)} className="p-1 text-red-400 hover:text-red-600 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-brand-secondary font-medium">Registry is completely empty.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WEBSITE CONTENT & HERO SETTINGS */}
          {activeTab === 'content' && (
            <form onSubmit={handleSaveContent} className="bg-brand-pure-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-soft-card max-w-3xl">
              <h3 className="font-extrabold text-base text-brand-dark border-b border-brand-warm-bg pb-3 mb-6">Website Layout & SEO Controls</h3>

              <div className="flex flex-col gap-8">
                {/* 1. Hero Content */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-primary"></span> Hero Section Settings
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-brand-secondary font-medium">
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Hero Badge Title</label>
                      <input
                        type="text"
                        value={heroForm.badge}
                        onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Hero Highlight Phrase</label>
                      <input
                        type="text"
                        value={heroForm.highlightText}
                        onChange={(e) => setHeroForm({ ...heroForm, highlightText: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-brand-dark mb-2 font-bold">Hero Main Heading text</label>
                      <input
                        type="text"
                        value={heroForm.heading}
                        onChange={(e) => setHeroForm({ ...heroForm, heading: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-brand-dark mb-2 font-bold">Hero Long description</label>
                      <textarea
                        value={heroForm.description}
                        onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none resize-none"
                      ></textarea>
                    </div>
                    <div className="sm:col-span-2 bg-brand-warm-bg/30 p-4 rounded-2xl border border-brand-border/60">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-brand-dark font-extrabold text-xs">Hero Presentation Image Link</label>
                        <label className="text-[10px] text-brand-primary font-extrabold hover:text-brand-coral cursor-pointer flex items-center gap-1 bg-brand-pure-white px-2.5 py-1 rounded-md border border-brand-border transition-colors shadow-sm">
                          <ImageIcon className="w-3 h-3" /> Direct Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="w-20 h-20 bg-brand-pure-white border border-brand-border rounded-xl flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-sm">
                          {heroForm.imagePath ? (
                            <img src={heroForm.imagePath} alt="Hero Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[10px] text-brand-secondary font-bold text-center">No Image</span>
                          )}
                        </div>
                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            value={heroForm.imagePath}
                            onChange={(e) => setHeroForm({ ...heroForm, imagePath: e.target.value })}
                            placeholder="e.g. /hero-bg.png or Unsplash URL"
                            className="w-full px-3 py-2 bg-brand-pure-white border border-brand-border rounded-xl focus:border-brand-primary outline-none font-mono text-[11px]"
                          />
                          <p className="text-[10px] text-brand-secondary mt-1">Provide an image URL or use the upload button above.</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Primary Button Destination</label>
                      <input
                        type="text"
                        value={heroForm.primaryCtaUrl}
                        onChange={(e) => setHeroForm({ ...heroForm, primaryCtaUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Corporate Identity & Branding (Custom Upload) */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-primary"></span> Corporate Identity & Branding
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-brand-secondary font-medium">
                    <div className="bg-brand-warm-bg p-5 rounded-2xl border border-brand-border flex flex-col md:flex-row items-start md:items-center gap-5">
                      <div className="w-16 h-16 bg-brand-pure-white border border-brand-border rounded-xl flex items-center justify-center overflow-hidden p-2 shrink-0">
                        {settingsForm.logo ? (
                          <img src={settingsForm.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-[10px] text-brand-secondary font-bold text-center">No Logo</span>
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-brand-dark mb-1 font-extrabold">Custom Website Logo</label>
                        <p className="text-[10px] text-brand-secondary mb-3">Upload transparent PNG/SVG or enter path</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={settingsForm.logo || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                            placeholder="/logo.png"
                            className="flex-1 px-3 py-1.5 bg-brand-pure-white border border-brand-border rounded-lg focus:border-brand-primary outline-none font-mono text-[10px]"
                          />
                          <label className="px-3 py-1.5 bg-brand-dark hover:bg-brand-primary text-brand-pure-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-brand-warm-bg p-5 rounded-2xl border border-brand-border flex flex-col md:flex-row items-start md:items-center gap-5">
                      <div className="w-16 h-16 bg-brand-pure-white border border-brand-border rounded-xl flex items-center justify-center overflow-hidden p-2 shrink-0">
                        {settingsForm.favicon ? (
                          <img src={settingsForm.favicon} alt="Favicon Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-[10px] text-brand-secondary font-bold text-center">No Favicon</span>
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-brand-dark mb-1 font-extrabold">Custom Website Favicon</label>
                        <p className="text-[10px] text-brand-secondary mb-3">Upload ICO/PNG/SVG or enter path</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={settingsForm.favicon || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, favicon: e.target.value })}
                            placeholder="/favicon.ico"
                            className="flex-1 px-3 py-1.5 bg-brand-pure-white border border-brand-border rounded-lg focus:border-brand-primary outline-none font-mono text-[10px]"
                          />
                          <label className="px-3 py-1.5 bg-brand-dark hover:bg-brand-primary text-brand-pure-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFaviconUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-brand-warm-bg p-5 rounded-2xl border border-brand-border flex flex-col items-start gap-4">
                      <div className="flex-1 w-full">
                        <label className="block text-brand-dark mb-1 font-extrabold">Logo Text</label>
                        <p className="text-[10px] text-brand-secondary mb-3">Text displayed next to the logo on the website</p>
                        <input
                          type="text"
                          value={settingsForm.logoText || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                          placeholder="e.g. B2bfiy"
                          className="w-full px-3 py-2 bg-brand-pure-white border border-brand-border rounded-lg focus:border-brand-primary outline-none font-medium"
                        />
                      </div>
                      <div className="flex-1 w-full border-t border-brand-border/40 pt-3">
                        <label className="block text-brand-dark mb-1 font-extrabold">Logo Display Style</label>
                        <p className="text-[10px] text-brand-secondary mb-3">Choose what to show in the website header & footer</p>
                        <select
                          value={settingsForm.logoDisplayType || 'both'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, logoDisplayType: e.target.value })}
                          className="w-full px-3 py-2 bg-brand-pure-white border border-brand-border rounded-lg focus:border-brand-primary outline-none font-medium"
                        >
                          <option value="both">Logo + Text</option>
                          <option value="logo">Only Logo</option>
                          <option value="text">Only Text</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Global Contact Credentials */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-primary"></span> Agency Contact Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-brand-secondary font-medium">
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Agency Name</label>
                      <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Primary Telephone Call Number</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Primary Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">WhatsApp Hotline Number</label>
                      <input
                        type="text"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                        placeholder="e.g. 01712345678"
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none font-bold text-green-700"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-brand-dark mb-2 font-bold">Headquarters Address</label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Social Handles */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-primary"></span> Social Network URLs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-brand-secondary font-medium">
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Facebook Page URL</label>
                      <input
                        type="text"
                        value={settingsForm.facebook}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Instagram Handle URL</label>
                      <input
                        type="text"
                        value={settingsForm.instagram}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">LinkedIn Business URL</label>
                      <input
                        type="text"
                        value={settingsForm.linkedin}
                        onChange={(e) => setSettingsForm({ ...settingsForm, linkedin: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">YouTube Channel URL</label>
                      <input
                        type="text"
                        value={settingsForm.youtube}
                        onChange={(e) => setSettingsForm({ ...settingsForm, youtube: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Display Flags */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-primary"></span> Visual Layout Flags
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-brand-secondary font-medium">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="enableTopBar"
                        checked={settingsForm.enableTopBar}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableTopBar: e.target.checked })}
                        className="w-4.5 h-4.5 accent-brand-primary"
                      />
                      <label htmlFor="enableTopBar" className="text-brand-dark cursor-pointer font-bold">Show Red Contacts Top Bar</label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="enableStickyHeader"
                        checked={settingsForm.enableStickyHeader}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableStickyHeader: e.target.checked })}
                        className="w-4.5 h-4.5 accent-brand-primary"
                      />
                      <label htmlFor="enableStickyHeader" className="text-brand-dark cursor-pointer font-bold">Sticky Floating Navigation Menu</label>
                    </div>
                  </div>
                </div>

                {/* 5. SEO Defaults */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-primary"></span> Global SEO Settings
                  </h4>
                  <div className="grid grid-cols-1 gap-5 text-xs text-brand-secondary font-medium">
                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Default SEO Portal Title</label>
                      <input
                        type="text"
                        value={settingsForm.defaultSeoTitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, defaultSeoTitle: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">Default Meta Description</label>
                      <textarea
                        value={settingsForm.defaultMetaDescription}
                        onChange={(e) => setSettingsForm({ ...settingsForm, defaultMetaDescription: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-brand-dark mb-2 font-bold">"View All Graphics Design" Button URL Link</label>
                      <input
                        type="text"
                        value={settingsForm.viewAllGraphicsDesignUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, viewAllGraphicsDesignUrl: e.target.value })}
                        placeholder="e.g. https://www.behance.net/your-profile or https://drive.google.com/..."
                        className="w-full px-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                      <p className="text-[10px] text-brand-secondary mt-1">This link will power the "View All Graphics Design" action button on the Creative Portfolio page under the Graphic Design category filter.</p>
                    </div>
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="border-t border-brand-warm-bg pt-6 mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-brand-primary hover:bg-brand-coral text-brand-pure-white text-xs font-bold rounded-full cursor-pointer shadow-md transition-colors"
                  >
                    {loading ? 'Saving CMS settings...' : 'Apply CMS Content & SEO'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 7: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="flex flex-col gap-8 text-xs text-brand-secondary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                {/* Direct Custom File Upload */}
                <div className="bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card flex flex-col justify-between min-h-[280px]">
                  <div>
                    <h4 className="font-extrabold text-sm text-brand-dark border-b border-brand-warm-bg pb-2 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-brand-primary" /> Direct File Upload
                    </h4>
                    <p className="text-[11px] mb-5">Upload transparent PNGs, custom JPEGs, or SVGs directly from your device storage to use anywhere on your website CMS pages.</p>
                  </div>
                  
                  <div className="border-2 border-dashed border-brand-border hover:border-brand-primary rounded-2xl p-6 text-center transition-colors bg-brand-warm-bg/50 relative group">
                    <input
                      type="file"
                      id="directMediaUpload"
                      accept="image/*"
                      onChange={handleMediaLibraryUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-brand-pure-white rounded-full shadow-sm text-brand-primary group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-xs text-brand-dark">Click or drag image file here</span>
                      <span className="text-[10px] text-brand-secondary">Supports PNG, JPG, GIF, SVG up to 5MB</span>
                    </div>
                  </div>
                </div>

                {/* Manual registration of URLs */}
                <form onSubmit={handleRegisterMedia} className="bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card flex flex-col justify-between min-h-[280px]">
                  <div>
                    <h4 className="font-extrabold text-sm text-brand-dark border-b border-brand-warm-bg pb-2 mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-primary" /> Register External Asset Link
                    </h4>
                    <p className="text-[11px] mb-4">Register high-quality Unsplash image URLs or YouTube thumbnails to include inside the CMS case studies dropdown selectors.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block font-bold text-brand-dark mb-1.5">Asset Label Name</label>
                        <input
                          type="text"
                          required
                          value={mediaName}
                          onChange={(e) => setMediaName(e.target.value)}
                          placeholder="e.g. Pizza house homepage"
                          className="w-full px-3 py-2 bg-brand-warm-bg border border-brand-border rounded-lg outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-brand-dark mb-1.5">Image Link URL</label>
                        <input
                          type="text"
                          required
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/..."
                          className="w-full px-3 py-2 bg-brand-warm-bg border border-brand-border rounded-lg outline-none focus:border-brand-primary font-mono text-[10px]"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-brand-primary hover:bg-brand-coral text-brand-pure-white font-bold rounded-xl cursor-pointer transition-colors shadow-sm">
                    Save External Asset to Library
                  </button>
                </form>
              </div>

              {/* Grid of registered media */}
              <div className="bg-brand-pure-white p-6 rounded-3xl border border-brand-border shadow-soft-card">
                <h4 className="font-extrabold text-sm text-brand-dark border-b border-brand-warm-bg pb-3 mb-5">Asset Library Files</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {data?.media && data.media.map((file: any, index: number) => (
                    <div key={file.id || index} className="border border-brand-border rounded-xl overflow-hidden bg-brand-warm-bg relative group flex flex-col justify-between">
                      <div className="aspect-square bg-brand-light-bg flex items-center justify-center relative overflow-hidden">
                        <img src={file.fileUrl} alt={file.fileName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          onClick={() => handleDeleteMedia(file.fileUrl)}
                          className="absolute top-2 right-2 p-1.5 bg-brand-pure-white hover:bg-red-50 text-red-500 rounded-full shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-2.5 bg-brand-pure-white border-t border-brand-border">
                        <span className="block font-bold text-[10px] text-brand-dark truncate">{file.fileName}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(file.fileUrl);
                            showToast('Asset link copied!', 'success');
                          }}
                          className="text-[9px] font-bold text-brand-primary hover:underline mt-1 cursor-pointer block text-left"
                        >
                          Copy Link String
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!data?.media || data.media.length === 0) && (
                    <div className="col-span-full py-12 text-center text-brand-secondary">No media files registered yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ADMIN SECURITY / CREDENTIALS */}
          {activeTab === 'account' && (
            <div className="flex flex-col gap-8 max-w-2xl text-xs text-brand-secondary">
              <div className="bg-brand-pure-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-soft-card">
                <div className="flex items-center gap-3 border-b border-brand-warm-bg pb-4 mb-6">
                  <div className="p-2.5 bg-brand-soft-red text-brand-primary rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-brand-dark">Update Admin Login Credentials</h3>
                    <p className="text-brand-secondary text-[11px] mt-0.5">Protect your admin portal by updating your master login ID and password below.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateCredentials} className="flex flex-col gap-6">
                  {/* Login ID Section */}
                  <div className="bg-brand-warm-bg/50 p-5 rounded-2xl border border-brand-border">
                    <h4 className="font-extrabold text-brand-dark text-xs mb-3.5 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-brand-primary" /> Admin Login ID (Email Address)
                    </h4>
                    
                    <div>
                      <label className="block font-bold text-brand-dark mb-2">Login ID / Username</label>
                      <input
                        type="email"
                        required
                        value={adminEmailForm}
                        onChange={(e) => setAdminEmailForm(e.target.value)}
                        placeholder="e.g. admin@b2bfiy.com"
                        className="w-full px-4 py-3 bg-brand-pure-white border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                      />
                      <span className="block text-[10px] text-brand-secondary mt-1.5">This email address will serve as your master login ID. Keep it safe and secure.</span>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="bg-brand-warm-bg/50 p-5 rounded-2xl border border-brand-border">
                    <h4 className="font-extrabold text-brand-dark text-xs mb-3.5 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" /> Master Password Update
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-bold text-brand-dark mb-2">New Password</label>
                        <input
                          type="password"
                          value={adminPasswordForm}
                          onChange={(e) => setAdminPasswordForm(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-brand-pure-white border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                        />
                        <span className="block text-[10px] text-brand-secondary mt-1.5">Leave blank if you do not wish to change your password.</span>
                      </div>

                      <div>
                        <label className="block font-bold text-brand-dark mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={adminConfirmPasswordForm}
                          onChange={(e) => setAdminConfirmPasswordForm(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-brand-pure-white border border-brand-border rounded-xl focus:border-brand-primary outline-none"
                        />
                        <span className="block text-[10px] text-brand-secondary mt-1.5">Verify your password to avoid mistakes.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-brand-primary hover:bg-brand-coral text-brand-pure-white font-bold rounded-full cursor-pointer transition-all shadow-md"
                    >
                      {loading ? 'Updating Credentials...' : 'Save Security Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
