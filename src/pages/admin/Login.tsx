import React, { useState } from 'react';
import { useApp } from '../../components/AppContext';
import { Lock, User, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, showToast, navigateTo, isAdminVerified } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Automatically redirect if already logged in
  React.useEffect(() => {
    if (isAdminVerified) {
      navigateTo('/admin');
    }
  }, [isAdminVerified, navigateTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please specify both admin email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.token, data.email);
        showToast('Successfully logged in! Opening B2bfiy CMS...', 'success');
        navigateTo('/admin');
      } else {
        showToast(data.error || 'Invalid credentials. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Backend offline or network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-warm-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-soft-red rounded-full filter blur-3xl opacity-30 -z-10 animate-pulse"></div>
      
      <div className="max-w-md w-full bg-brand-pure-white rounded-3xl border border-brand-border shadow-xl p-8 md:p-10 relative overflow-hidden">
        {/* Brand identity */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary text-brand-pure-white rounded-2xl font-black text-2xl shadow-md mb-4">
            B
          </div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">B2bfiy CMS Portal</h2>
          <p className="text-xs text-brand-secondary mt-1">Provide administrator credentials to access the website database.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 text-left">
          {/* Username/Email Input */}
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-2">Admin Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary opacity-70" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="thedelusiongaming024@gmail.com"
                className="w-full pl-11 pr-4 py-3 bg-brand-warm-bg border border-brand-border rounded-xl text-xs focus:border-brand-primary outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-brand-dark">Security Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary opacity-70" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3 bg-brand-warm-bg border border-brand-border rounded-xl text-xs focus:border-brand-primary outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-primary cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-primary text-brand-pure-white font-bold rounded-xl shadow-lg hover:bg-brand-coral transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs md:text-sm uppercase tracking-wider mt-2"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-brand-border text-center">
          <p className="text-[10px] text-brand-secondary flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-primary" />
            Designed by B2bfiy Studio. Secure PBKDF2 Transactional Locks.
          </p>
        </div>
      </div>
    </div>
  );
}
