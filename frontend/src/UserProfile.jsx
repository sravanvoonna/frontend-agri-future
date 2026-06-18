import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  X, LogOut, Trash2, RefreshCw, Clock, Sprout, Activity,
  Bot, Camera, MapPin, Newspaper, Sliders, TrendingUp, User
} from 'lucide-react';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000/api'
    : 'https://agri-future-backend.onrender.com/api';

/* icon + colour per action type */
const ACTION_META = {
  crop_viewed:     { icon: Sprout,     color: 'bg-emerald-100 text-emerald-700', label: 'Crop Viewed' },
  disease_viewed:  { icon: Activity,   color: 'bg-rose-100 text-rose-700',       label: 'Disease Lookup' },
  ai_diagnosis:    { icon: Camera,     color: 'bg-purple-100 text-purple-700',   label: 'AI Diagnosis' },
  chat_message:    { icon: Bot,        color: 'bg-blue-100 text-blue-700',       label: 'AI Chat' },
  scheduler_used:  { icon: Sliders,    color: 'bg-amber-100 text-amber-700',     label: 'Scheduler' },
  state_selected:  { icon: MapPin,     color: 'bg-teal-100 text-teal-700',       label: 'State Explored' },
  msp_viewed:      { icon: TrendingUp, color: 'bg-indigo-100 text-indigo-700',   label: 'MSP Prices' },
  news_viewed:     { icon: Newspaper,  color: 'bg-orange-100 text-orange-700',   label: 'News Read' },
};

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function UserProfile({ user, onSignOut, onClose }) {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [clearing, setClearing] = useState(false);

  const token = localStorage.getItem('agri_token');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/history?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Clear your entire activity history?')) return;
    setClearing(true);
    try {
      await axios.delete(`${API_BASE_URL}/auth/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory([]);
    } catch {/* ignore */}
    finally { setClearing(false); }
  };

  /* group by date */
  const grouped = history.reduce((acc, item) => {
    const day = item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Unknown';
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  const displayId = user.email || user.phone || '';

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl animate-slide-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-900 px-6 py-6 text-white shrink-0">
          <div className="flex items-start justify-between mb-5">
            <h2 className="font-black text-base uppercase tracking-wider text-emerald-300">My Profile</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
              id="profile-close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Avatar + info */}
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="font-black text-lg text-white leading-tight truncate">{user.name}</p>
              <p className="text-emerald-300 text-xs font-semibold truncate mt-0.5">{displayId}</p>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400/80 text-[10px] font-bold uppercase">Active</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: 'Activities', value: history.length },
              { label: 'Crops Viewed', value: history.filter(h => h.action_type === 'crop_viewed').length },
              { label: 'AI Uses', value: history.filter(h => ['ai_diagnosis','chat_message'].includes(h.action_type)).length },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-white font-black text-lg leading-none">{s.value}</p>
                <p className="text-emerald-300/80 text-[9px] font-bold uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── History ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
            <h3 className="font-black text-gray-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              Activity History
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchHistory}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                title="Refresh"
                id="profile-refresh"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  disabled={clearing}
                  className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-50"
                  id="profile-clear"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
              <p className="text-gray-400 text-xs font-semibold">Loading history…</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 px-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-gray-300" />
              </div>
              <p className="font-bold text-gray-500 text-sm">No activity yet</p>
              <p className="text-gray-400 text-xs">
                Browse crops, run AI diagnostics, or explore states — your history will appear here.
              </p>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-5">
              {Object.entries(grouped).map(([day, items]) => (
                <div key={day}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">{day}</p>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const meta  = ACTION_META[item.action_type] || { icon: Activity, color: 'bg-gray-100 text-gray-600', label: item.action_type };
                      const Icon  = meta.icon;
                      return (
                        <div key={item.id} className="flex items-start space-x-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className={`p-2 rounded-lg shrink-0 ${meta.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-gray-800 text-xs font-bold leading-snug truncate">{item.description}</p>
                            <p className="text-gray-400 text-[10px] font-semibold mt-0.5">{meta.label}</p>
                          </div>
                          <span className="text-gray-400 text-[10px] font-semibold shrink-0 pt-0.5">
                            {timeAgo(item.created_at)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer: Sign Out ── */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <button
            onClick={onSignOut}
            id="profile-signout"
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold text-sm transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
