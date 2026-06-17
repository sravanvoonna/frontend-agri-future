import React, { useState } from 'react';
import axios from 'axios';
import { Sprout, Eye, EyeOff, Phone, Mail, User, Lock, AlertCircle, CheckCircle2, ArrowRight, Leaf } from 'lucide-react';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000/api'
    : 'https://agri-future-backend.onrender.com/api';

/* ─── tiny helpers ─── */
const isEmail  = (v) => v.includes('@');
const isPhone  = (v) => /^[0-9\s\-+()]{7,15}$/.test(v.trim());
const cleanPh  = (v) => v.replace(/\D/g, '');

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode]           = useState('login');   // 'login' | 'signup'
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);

  /* form fields */
  const [name, setName]           = useState('');
  const [identifier, setIdentifier] = useState('');  // email OR phone
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');

  const identifierType = isEmail(identifier) ? 'email' : isPhone(identifier) ? 'phone' : null;

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    /* basic validation */
    if (mode === 'signup') {
      if (!name.trim())           return setError('Please enter your full name.');
      if (!identifier.trim())     return setError('Please enter your email or phone number.');
      if (!identifierType)        return setError('Enter a valid email (with @) or a 10-digit phone number.');
      if (password.length < 6)    return setError('Password must be at least 6 characters.');
      if (password !== confirm)   return setError('Passwords do not match.');
    } else {
      if (!identifier.trim())     return setError('Please enter your email or phone number.');
      if (!password)              return setError('Please enter your password.');
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const body = {
          name,
          password,
          ...(identifierType === 'email' ? { email: identifier.trim().toLowerCase() } : { phone: cleanPh(identifier) })
        };
        const res = await axios.post(`${API_BASE_URL}/auth/register`, body);
        localStorage.setItem('agri_token', res.data.token);
        localStorage.setItem('agri_user',  JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
      } else {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, { identifier: identifier.trim(), password });
        localStorage.setItem('agri_token', res.data.token);
        localStorage.setItem('agri_user',  JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); setPassword(''); setConfirm(''); };

  /* ── badge that shows 📧 or 📱 based on what user typed ── */
  const IdentBadge = () => {
    if (!identifier) return null;
    if (identifierType === 'email')  return <Mail  className="h-4 w-4 text-emerald-500" />;
    if (identifierType === 'phone')  return <Phone className="h-4 w-4 text-emerald-500" />;
    return <AlertCircle className="h-4 w-4 text-amber-400" />;
  };

  /* ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      {/* ── Left hero panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 px-16 py-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl backdrop-blur-sm">
            <Sprout className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight leading-none">AgriFuture</h1>
            <p className="text-emerald-400 text-xs font-semibold mt-0.5">Smart Agriculture Platform</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/25 px-4 py-2 rounded-full">
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Trusted by 10,000+ Farmers</span>
            </div>
            <h2 className="text-5xl font-black text-white leading-tight">
              Grow Smarter,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Farm Better
              </span>
            </h2>
            <p className="text-emerald-200/80 text-base leading-relaxed max-w-md">
              Access AI-powered crop diagnostics, real-time weather, government scheme guidance,
              and personalised farming history — all in one place.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-3">
            {[
              { icon: '🌱', text: 'AI Leaf Disease Diagnosis' },
              { icon: '🌦️', text: 'Live Weather & Mandi Prices' },
              { icon: '📋', text: 'Smart Crop Scheduler' },
              { icon: '🏛️', text: 'Govt Scheme Recommendations' },
            ].map((f) => (
              <div key={f.text} className="flex items-center space-x-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-emerald-200 text-sm font-semibold">{f.text}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="text-emerald-500/60 text-xs font-medium">
          "Technology in service of every farmer's field."
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
              <Sprout className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-white font-black text-xl">AgriFuture</h1>
          </div>

          {/* Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">

            {/* Tab switcher */}
            <div className="flex bg-black/20 rounded-2xl p-1 mb-8 gap-1">
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    mode === m
                      ? 'bg-white text-emerald-900 shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                  id={`auth-tab-${m}`}
                >
                  {m === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <h2 className="text-white font-black text-2xl mb-1">
              {mode === 'login' ? 'Welcome back 👋' : 'Create account 🌱'}
            </h2>
            <p className="text-emerald-300/80 text-sm mb-6">
              {mode === 'login'
                ? 'Sign in to access your personalised dashboard.'
                : 'Join thousands of farmers using AgriFuture.'}
            </p>

            {/* Error banner */}
            {error && (
              <div className="flex items-start space-x-2.5 bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3 mb-5">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-red-300 text-sm font-medium leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">

              {/* Name (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/70" />
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ravi Kumar"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email or Phone */}
              <div>
                <label className="block text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    {identifier
                      ? <IdentBadge />
                      : <Mail className="h-4 w-4 text-emerald-400/70" />}
                  </div>
                  <input
                    id="auth-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="farmer@gmail.com or 9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
                    autoComplete="username"
                  />
                </div>
                {identifier && !identifierType && (
                  <p className="text-amber-400/80 text-xs mt-1.5 font-medium">
                    Enter a valid email (contains @) or phone number (digits only)
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/70" />
                  <input
                    id="auth-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === 'signup' && password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          password.length >= [4, 6, 8, 12][i]
                            ? ['bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'][i]
                            : 'bg-white/15'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/70" />
                    <input
                      id="auth-confirm"
                      type={showConf ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                        confirm && confirm !== password
                          ? 'border-red-400/50 focus:ring-red-400/30'
                          : confirm && confirm === password
                          ? 'border-emerald-400/50 focus:ring-emerald-400/30'
                          : 'border-white/20 focus:ring-emerald-400/50 focus:border-emerald-400/50'
                      }`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConf(!showConf)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                    >
                      {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {confirm && confirm === password && (
                      <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="auth-submit"
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch link */}
            <p className="text-center text-white/50 text-sm mt-6">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                id="auth-switch"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>

          <p className="text-center text-emerald-700/60 text-xs mt-6">
            Your data is secure and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
