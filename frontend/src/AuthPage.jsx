import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Sprout, Eye, EyeOff, Phone, Mail, User, Lock, AlertCircle, CheckCircle2, ArrowRight, Leaf } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000/api'
    : 'https://agrifuture.azurewebsites.net/api');

/* ─── tiny helpers ─── */
const isEmail = (v) => v.includes('@');
const cleanPh  = (v) => v.replace(/\D/g, '');
const isPhone = (v) => {
  const cleaned = cleanPh(v);
  return /^\d{10}$/.test(cleaned);
};

/* ════════════════════════════════════════════════
   FARMER AVATAR — eye-tracking + password peek-a-boo
   ════════════════════════════════════════════════ */
function FarmerAvatar({ passwordFocused }) {
  const svgRef = useRef(null);
  const [pupils, setPupils] = useState({ lx: 0, ly: 0, rx: 0, ry: 0 });

  // Eye centres in viewBox(200×220) space
  const LE = { x: 79, y: 106 };
  const RE = { x: 121, y: 106 };
  const MAX_R = 5;

  useEffect(() => {
    const onMove = (e) => {
      if (!svgRef.current || passwordFocused) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width)  * 200;
      const my = ((e.clientY - rect.top)  / rect.height) * 220;

      const calc = (cx, cy) => {
        const dx = mx - cx, dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const r  = Math.min(dist / 6, MAX_R);
        const a  = Math.atan2(dy, dx);
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      };

      const l = calc(LE.x, LE.y);
      const r = calc(RE.x, RE.y);
      setPupils({ lx: l.x, ly: l.y, rx: r.x, ry: r.y });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [passwordFocused]);

  const handStyle = (side) => ({
    opacity:    passwordFocused ? 1 : 0,
    transform:  passwordFocused ? 'translateY(0px)' : 'translateY(28px)',
    transition: 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.34,1.4,0.64,1)',
    transformBox: 'fill-box',
    transformOrigin: side === 'left' ? 'bottom right' : 'bottom left',
  });

  const lidStyle = {
    opacity:    passwordFocused ? 1 : 0,
    transition: 'opacity 0.25s ease',
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      className="w-36 h-36 mx-auto select-none"
      style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))' }}
    >
      <defs>
        <radialGradient id="fg-face" cx="42%" cy="38%" r="58%">
          <stop offset="0%"   stopColor="#fde68a" />
          <stop offset="55%"  stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <radialGradient id="fg-eye" cx="50%" cy="28%" r="62%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dde6f0" />
        </radialGradient>
        <radialGradient id="fg-iris" cx="40%" cy="35%" r="55%">
          <stop offset="0%"   stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
        <radialGradient id="fg-pupil" cx="38%" cy="33%" r="55%">
          <stop offset="0%"   stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <radialGradient id="fg-hat" cx="40%" cy="28%" r="62%">
          <stop offset="0%"   stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
        <radialGradient id="fg-hand" cx="45%" cy="35%" r="58%">
          <stop offset="0%"   stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>

      {/* ── Body / shirt ── */}
      <path d="M65 188 Q100 205 135 188 L142 220 H58 Z" fill="#16a34a" />
      <path d="M78 188 Q100 196 122 188 L118 220 H82 Z" fill="#15803d" />
      {/* collar */}
      <path d="M86 185 L100 198 L114 185" stroke="#bbf7d0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* ── Neck ── */}
      <rect x="89" y="163" width="22" height="22" rx="6" fill="#fbbf24" />

      {/* ── Head ── */}
      <ellipse cx="100" cy="113" rx="57" ry="60" fill="url(#fg-face)" />

      {/* ── Ears ── */}
      <ellipse cx="43"  cy="113" rx="10" ry="13" fill="#f59e0b" />
      <ellipse cx="43"  cy="113" rx="6"  ry="8.5" fill="#fcd34d" />
      <ellipse cx="157" cy="113" rx="10" ry="13" fill="#f59e0b" />
      <ellipse cx="157" cy="113" rx="6"  ry="8.5" fill="#fcd34d" />

      {/* ── Straw hat brim ── */}
      <ellipse cx="100" cy="61" rx="73" ry="11"  fill="#92400e" />
      <ellipse cx="100" cy="59" rx="71" ry="9.5" fill="url(#fg-hat)" />
      {/* straw lines on brim */}
      {[-30,-15,0,15,30].map(offset => (
        <line key={offset} x1={100+offset} y1="51" x2={100+offset+8} y2="68"
          stroke="#d97706" strokeWidth="1" opacity="0.5" />
      ))}
      {/* Hat crown */}
      <path d="M69 60 Q74 22 100 19 Q126 22 131 60 Z" fill="#92400e" />
      <path d="M71 59 Q76 24 100 21 Q124 24 129 59 Z" fill="url(#fg-hat)" />
      {/* Hat band */}
      <path d="M71 57 Q100 65 129 57" stroke="#16a34a" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M71 57 Q100 65 129 57" stroke="#4ade80" strokeWidth="2"   fill="none" strokeLinecap="round" opacity="0.5" />

      {/* ── Eyebrows ── */}
      <path d={passwordFocused ? "M62 90 Q79 83 88 87" : "M62 92 Q79 86 88 90"}
        stroke="#92400e" strokeWidth="3.5" fill="none" strokeLinecap="round"
        style={{ transition: 'all 0.3s ease' }} />
      <path d={passwordFocused ? "M112 87 Q121 83 138 90" : "M112 90 Q121 86 138 92"}
        stroke="#92400e" strokeWidth="3.5" fill="none" strokeLinecap="round"
        style={{ transition: 'all 0.3s ease' }} />

      {/* ══ LEFT EYE ══ */}
      <ellipse cx={LE.x} cy={LE.y} rx="14" ry="13" fill="url(#fg-eye)" />
      {/* iris + pupil (hidden when closed) */}
      <g style={{ opacity: passwordFocused ? 0 : 1, transition: 'opacity 0.2s ease' }}>
        <circle cx={LE.x + pupils.lx} cy={LE.y + pupils.ly} r="8.5" fill="url(#fg-iris)" />
        <circle cx={LE.x + pupils.lx} cy={LE.y + pupils.ly} r="5.5" fill="url(#fg-pupil)" />
        <circle cx={LE.x + pupils.lx - 2.5} cy={LE.y + pupils.ly - 2.5} r="2"   fill="white" opacity="0.85" />
        <circle cx={LE.x + pupils.lx + 1.5} cy={LE.y + pupils.ly + 2}   r="1"   fill="white" opacity="0.45" />
      </g>
      {/* eyelid */}
      <ellipse cx={LE.x} cy={LE.y - 2} rx="14" ry="12" fill="#fbbf24" style={lidStyle} />
      <path d="M65 104 Q79 98 93 104" stroke="#d97706" strokeWidth="1.5" fill="none" style={lidStyle} />

      {/* ══ RIGHT EYE ══ */}
      <ellipse cx={RE.x} cy={RE.y} rx="14" ry="13" fill="url(#fg-eye)" />
      <g style={{ opacity: passwordFocused ? 0 : 1, transition: 'opacity 0.2s ease' }}>
        <circle cx={RE.x + pupils.rx} cy={RE.y + pupils.ry} r="8.5" fill="url(#fg-iris)" />
        <circle cx={RE.x + pupils.rx} cy={RE.y + pupils.ry} r="5.5" fill="url(#fg-pupil)" />
        <circle cx={RE.x + pupils.rx - 2.5} cy={RE.y + pupils.ry - 2.5} r="2"   fill="white" opacity="0.85" />
        <circle cx={RE.x + pupils.rx + 1.5} cy={RE.y + pupils.ry + 2}   r="1"   fill="white" opacity="0.45" />
      </g>
      <ellipse cx={RE.x} cy={RE.y - 2} rx="14" ry="12" fill="#fbbf24" style={lidStyle} />
      <path d="M107 104 Q121 98 135 104" stroke="#d97706" strokeWidth="1.5" fill="none" style={lidStyle} />

      {/* ── Nose ── */}
      <ellipse cx="100" cy="124" rx="5.5" ry="4" fill="#d97706" opacity="0.55" />
      <circle cx="96" cy="123" r="1.8" fill="#b45309" opacity="0.4" />
      <circle cx="104" cy="123" r="1.8" fill="#b45309" opacity="0.4" />

      {/* ── Mouth ── */}
      <path
        d={passwordFocused
          ? "M87 140 Q100 134 113 140"   /* straight / slight frown when covering */
          : "M87 137 Q100 150 113 137"}  /* big smile */
        stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round"
        style={{ transition: 'all 0.35s cubic-bezier(0.34,1.4,0.64,1)' }}
      />
      {/* teeth on smile */}
      {!passwordFocused && (
        <path d="M90 140 Q100 146 110 140" fill="white" opacity="0.7" />
      )}

      {/* ── Cheeks ── */}
      <ellipse cx="60"  cy="128" rx="11" ry="8" fill="#f87171" opacity="0.3" />
      <ellipse cx="140" cy="128" rx="11" ry="8" fill="#f87171" opacity="0.3" />

      {/* ══ HANDS covering eyes (animated) ══ */}
      {/* Left hand */}
      <g style={handStyle('left')}>
        {/* palm */}
        <ellipse cx="72" cy="112" rx="21" ry="17" fill="url(#fg-hand)" />
        <ellipse cx="72" cy="114" rx="19" ry="14" fill="#fde68a" />
        {/* fingers */}
        <ellipse cx="53" cy="102" rx="7"  ry="11" fill="#fde68a" transform="rotate(-18 53 102)" />
        <ellipse cx="55" cy="94"  rx="6.5" ry="11" fill="#fde68a" transform="rotate(-6 55 94)" />
        <ellipse cx="63" cy="90"  rx="6.5" ry="11" fill="#fde68a" transform="rotate(5 63 90)" />
        <ellipse cx="71" cy="89"  rx="6"  ry="10.5" fill="#fde68a" transform="rotate(12 71 89)" />
        {/* knuckle lines */}
        <path d="M58 102 Q60 99 63 101" stroke="#d97706" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M60 95  Q62 92 65 94"  stroke="#d97706" strokeWidth="1" fill="none" opacity="0.5" />
      </g>

      {/* Right hand */}
      <g style={handStyle('right')}>
        <ellipse cx="128" cy="112" rx="21" ry="17" fill="url(#fg-hand)" />
        <ellipse cx="128" cy="114" rx="19" ry="14" fill="#fde68a" />
        {/* fingers */}
        <ellipse cx="147" cy="102" rx="7"  ry="11" fill="#fde68a" transform="rotate(18 147 102)" />
        <ellipse cx="145" cy="94"  rx="6.5" ry="11" fill="#fde68a" transform="rotate(6 145 94)" />
        <ellipse cx="137" cy="90"  rx="6.5" ry="11" fill="#fde68a" transform="rotate(-5 137 90)" />
        <ellipse cx="129" cy="89"  rx="6"  ry="10.5" fill="#fde68a" transform="rotate(-12 129 89)" />
        <path d="M142 102 Q140 99 137 101" stroke="#d97706" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M140 95  Q138 92 135 94"  stroke="#d97706" strokeWidth="1" fill="none" opacity="0.5" />
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════════════ */

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode]           = useState('login');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  /* form fields */
  const [name, setName]           = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');

  const identifierType = isEmail(identifier) ? 'email' : isPhone(identifier) ? 'phone' : null;

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name.trim())         return setError('Please enter your full name.');
      if (!identifier.trim())   return setError('Please enter your email or phone number.');
      if (!identifierType)      return setError('Enter a valid email (with @) or a 10-digit phone number.');
      if (password.length < 6)  return setError('Password must be at least 6 characters.');
      if (password !== confirm)  return setError('Passwords do not match.');
    } else {
      if (!identifier.trim())   return setError('Please enter your email or phone number.');
      if (!password)            return setError('Please enter your password.');
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const body = {
          name,
          password,
          ...(identifierType === 'email'
            ? { email: identifier.trim().toLowerCase() }
            : { phone: cleanPh(identifier) })
        };
        const res = await axios.post(`${API_BASE_URL}/auth/register`, body);
        localStorage.setItem('agri_token', res.data.token);
        localStorage.setItem('agri_user',  JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
      } else {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, {
          identifier: identifier.trim(), password
        });
        localStorage.setItem('agri_token', res.data.token);
        localStorage.setItem('agri_user',  JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running on http://127.0.0.1:5000');
      } else {
        const serverMsg = err.response.data?.error || 'Something went wrong. Please try again.';
        setError(serverMsg);
        if (err.response.status === 409) {
          setTimeout(() => {
            switchMode('login');
            setError('This account already exists. Please log in instead.');
          }, 1500);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setPassword('');
    setConfirm('');
    setPasswordFocused(false);
  };

  const IdentBadge = () => {
    if (!identifier) return null;
    if (identifierType === 'email')  return <Mail  className="h-4 w-4 text-emerald-500" />;
    if (identifierType === 'phone')  return <Phone className="h-4 w-4 text-emerald-500" />;
    return <AlertCircle className="h-4 w-4 text-amber-400" />;
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 relative overflow-hidden">

      {/* Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      {/* ── Left hero panel ── */}
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

        <p className="text-emerald-500/60 text-xs font-medium">
          "Technology in service of every farmer's field."
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
              <Sprout className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-white font-black text-xl">AgriFuture</h1>
          </div>

          {/* Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">

            {/* ── FARMER AVATAR ── */}
            <div className="mb-2">
              <FarmerAvatar passwordFocused={passwordFocused} />
              <p className="text-center text-emerald-300/70 text-[11px] font-semibold mt-1 tracking-wide">
                {passwordFocused ? '🙈 I\'m not looking!' : '👀 I\'m watching over you!'}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-black/20 rounded-2xl p-1 mb-6 gap-1">
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
            <p className="text-emerald-300/80 text-sm mb-5">
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
                    {identifier ? <IdentBadge /> : <Mail className="h-4 w-4 text-emerald-400/70" />}
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

              {/* Password — triggers farmer eye-close */}
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
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
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

              {/* Confirm Password (signup only) — also closes eyes */}
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
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
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
            <p className="text-center text-white/50 text-sm mt-5">
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

          <p className="text-center text-emerald-700/60 text-xs mt-5">
            Your data is secure and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
