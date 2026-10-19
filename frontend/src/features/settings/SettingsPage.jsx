import { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  CloudCog,
  Shield,
  Bell,
  Check,
  Sparkles,
  Lock,
  Palette,
  Info,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { isDark, toggleTheme, theme, setTheme, palette, setPalette, isNotion } = useTheme();

  // Active tab state
  const [activeTab, setActiveTab] = useState('account');

  // Form states inspired by the professional settings design
  const [name, setName] = useState('Jagrati Sharma');
  const [email, setEmail] = useState('jagrati@studylib.co');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [bio, setBio] = useState('Engineering student & avid note taker.');

  // Security toggles
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [studyStreakAlerts, setStudyStreakAlerts] = useState(true);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Save feedback
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of Notie?')) {
      localStorage.removeItem('notie_auth');
      window.location.href = '/login';
    }
  };

  const tabs = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: isDark ? Moon : Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'storage', label: 'Storage & Data', icon: CloudCog },
  ];

  const cardStyle = isNotion
    ? isDark
      ? 'bg-[#252525] border-[#373737] text-[#D4D4D4]'
      : 'bg-white border-[#E9E9E7] text-[#37352F] shadow-sm'
    : isDark
      ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
      : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm';

  const inputStyle = isNotion
    ? isDark
      ? 'bg-[#191919] border-[#373737] text-[#D4D4D4] focus:border-[#D4D4D4]'
      : 'bg-white border-[#E9E9E7] text-[#37352F] focus:border-[#37352F]'
    : isDark
      ? 'bg-[#1F080C] border-[#3B1319] text-white focus:border-[#B46A72]'
      : 'bg-white border-slate-200 text-slate-800 focus:border-[#B46A72]';

  const primaryBtnStyle = isNotion
    ? isDark
      ? 'bg-[#2F2F2F] hover:bg-[#373737] text-white border border-[#373737]'
      : 'bg-[#37352F] hover:bg-[#202020] text-white shadow-sm'
    : 'bg-[#B46A72] hover:bg-[#9f5961] text-white shadow-sm';

  const secondaryBtnStyle = isNotion
    ? isDark
      ? 'border-[#373737] hover:bg-[#2F2F2F] text-[#D4D4D4]'
      : 'border-[#E9E9E7] hover:bg-[#EFEFED] text-[#37352F]'
    : isDark
      ? 'border-[#7B694E]/40 hover:bg-[#3B1319] text-white'
      : 'border-[#2D3A47]/20 hover:bg-[#F7C8D3]/30 text-[#2D3A47]';

  const toggleTrackStyle = (isActive) => {
    if (!isActive) return isDark ? 'bg-zinc-700' : 'bg-slate-300';
    if (isNotion) return isDark ? 'bg-[#2383E2]' : 'bg-[#37352F]';
    return 'bg-[#B46A72]';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header with Save Changes Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-inherit">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-inherit">Settings</h1>
          <p className="text-sm opacity-70 mt-1">
            Manage your personal details, security preferences, and app customization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg animate-fade-in border border-emerald-500/20">
              <Check size={14} /> Changes saved successfully!
            </span>
          )}
          <button
            onClick={handleSave}
            type="button"
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer ${primaryBtnStyle}`}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-inherit no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? isNotion
                    ? isDark
                      ? 'bg-[#2F2F2F] text-white shadow-sm border border-[#373737] font-semibold'
                      : 'bg-[#37352F] text-white shadow-sm font-semibold'
                    : isDark
                    ? 'bg-[#3B1319] text-white shadow-sm border border-[#7B694E]/40 font-semibold'
                    : 'bg-[#2D3A47] text-white shadow-sm font-semibold'
                  : isNotion
                  ? isDark
                    ? 'text-[#9B9A97] hover:bg-[#2F2F2F] hover:text-[#D4D4D4]'
                    : 'text-[#787774] hover:bg-[#EFEFED] hover:text-[#37352F]'
                  : isDark
                  ? 'text-[#C6B39A]/70 hover:bg-[#3B1319]/40 hover:text-white'
                  : 'text-[#2D3A47]/70 hover:bg-[#F7C8D3]/30 hover:text-[#2D3A47]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Left/Main Form Fields (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Profile Information Card */}
              <div className={`p-6 rounded-2xl border transition-all ${cardStyle}`}>
                <h2 className="text-lg font-display font-semibold mb-1">Profile Information</h2>
                <p className="text-xs opacity-70 mb-6">
                  Update your photo and personal details.
                </p>

                {/* Avatar Row */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-inherit">
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-full text-white font-bold flex items-center justify-center text-xl shadow-md ${
                        isNotion
                          ? isDark
                            ? 'bg-[#2F2F2F] border border-[#373737]'
                            : 'bg-[#37352F]'
                          : 'bg-[#B46A72] ring-4 ring-[#F7C8D3]/30'
                      }`}
                    >
                      JS
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#A8B58A] ring-2 ring-white" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => alert('Profile picture updated!')}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${secondaryBtnStyle}`}
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Photo removed.')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputStyle}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputStyle}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputStyle}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Academic Major / Bio</label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputStyle}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Security Toggles Card */}
              <div className={`p-6 rounded-2xl border transition-all space-y-6 ${cardStyle}`}>
                <div>
                  <h2 className="text-lg font-display font-semibold mb-1">Security & Authentication</h2>
                  <p className="text-xs opacity-70">
                    Keep your study library secure with extra verification and login alerts.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-inherit bg-black/5">
                    <div>
                      <p className="text-sm font-semibold">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs opacity-70">Add an extra layer of protection to your account.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${toggleTrackStyle(
                        twoFactor
                      )}`}
                    >
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
                          twoFactor ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-inherit bg-black/5">
                    <div>
                      <p className="text-sm font-semibold">Login Alert Notifications</p>
                      <p className="text-xs opacity-70">Get notified when your account is accessed from a new browser or device.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLoginAlerts(!loginAlerts)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${toggleTrackStyle(
                        loginAlerts
                      )}`}
                    >
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
                          loginAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Management Card */}
              <div className={`p-6 rounded-2xl border transition-all space-y-5 ${cardStyle}`}>
                <div>
                  <h2 className="text-lg font-display font-semibold mb-1">Password Management</h2>
                  <p className="text-xs opacity-70">Update your password regularly to secure your study records.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputStyle}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-70">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputStyle}`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputStyle}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div
              className={`p-6 rounded-2xl border transition-all space-y-8 ${
                isNotion
                  ? isDark
                    ? 'bg-[#252525] border-[#373737] text-[#D4D4D4]'
                    : 'bg-white border-[#E9E9E7] text-[#37352F] shadow-sm'
                  : isDark
                    ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
              }`}
            >
              <div>
                <h2 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
                  <Palette size={20} className={isNotion ? 'text-[#37352F] dark:text-[#D4D4D4]' : 'text-[#B46A72]'} />
                  <span>Appearance & Theme System</span>
                </h2>
                <p className="text-xs opacity-70">
                  Select your preferred design aesthetic. Choose between Notion's iconic soft charcoal & clean white palette, or the warm Italian Roast & Vanilla Cream palette.
                </p>
              </div>

              {/* Theme Palettes Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-75">
                    1. Choose Design Palette
                  </label>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-semibold">
                    Active: {palette === 'notion' ? 'Notion Minimal' : 'Warm Italian'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Notion Theme Card */}
                  <div
                    onClick={() => setPalette('notion')}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      palette === 'notion'
                        ? 'border-[#37352F] dark:border-[#D4D4D4] ring-2 ring-[#37352F]/10 dark:ring-white/10 shadow-md bg-black/[0.02] dark:bg-white/[0.03]'
                        : 'border-inherit hover:border-black/20 dark:hover:border-white/20 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {palette === 'notion' && (
                      <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-[#37352F] dark:bg-[#D4D4D4] text-white dark:text-black flex items-center justify-center shadow">
                        <Check size={14} />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base font-bold">Notion Style</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#2383E2]/10 text-[#2383E2] border border-[#2383E2]/30">
                        Minimalist
                      </span>
                    </div>
                    <p className="text-xs opacity-70 mb-4 leading-relaxed">
                      Soft grays rather than pure black everywhere. Crisp white canvas with warm gray sidebar and comfortable dark charcoal.
                    </p>

                    {/* Notion Swatches Preview */}
                    <div className="space-y-1.5 pt-2 border-t border-inherit">
                      <div className="text-[11px] font-semibold opacity-60">Palette Tokens:</div>
                      <div className="grid grid-cols-6 gap-1.5 text-center">
                        <div>
                          <div className="h-6 rounded-md border border-black/15 bg-[#FFFFFF]" title="Canvas: #FFFFFF" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#FFF</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-black/15 bg-[#F7F7F5]" title="Sidebar: #F7F7F5" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#F7F7F5</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-black/15 bg-[#37352F]" title="Text: #37352F" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#37352F</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-white/20 bg-[#191919]" title="Dark Canvas: #191919" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#191919</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-white/20 bg-[#202020]" title="Dark Sidebar: #202020" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#202020</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-white/20 bg-[#373737]" title="Border: #373737" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#373737</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warm Classic Theme Card */}
                  <div
                    onClick={() => setPalette('warm')}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      palette === 'warm'
                        ? 'border-[#B46A72] ring-2 ring-[#B46A72]/20 shadow-md bg-[#B46A72]/[0.03]'
                        : 'border-inherit hover:border-black/20 dark:hover:border-white/20 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {palette === 'warm' && (
                      <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-[#B46A72] text-white flex items-center justify-center shadow">
                        <Check size={14} />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base font-bold">Warm Classic</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#B46A72]/10 text-[#B46A72] border border-[#B46A72]/30">
                        Italian Roast
                      </span>
                    </div>
                    <p className="text-xs opacity-70 mb-4 leading-relaxed">
                      Cozy warm coffeehouse theme with Vanilla Cream daytime surfaces, blush highlights, and deep Italian Roast nights.
                    </p>

                    {/* Warm Swatches Preview */}
                    <div className="space-y-1.5 pt-2 border-t border-inherit">
                      <div className="text-[11px] font-semibold opacity-60">Palette Tokens:</div>
                      <div className="grid grid-cols-6 gap-1.5 text-center">
                        <div>
                          <div className="h-6 rounded-md border border-black/15 bg-[#FFF7E6]" title="Vanilla: #FFF7E6" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#FFF7E6</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-black/15 bg-[#F7C8D3]" title="Blush: #F7C8D3" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#F7C8D3</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-black/15 bg-[#B46A72]" title="Rosewood: #B46A72" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#B46A72</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-white/20 bg-[#280B0F]" title="Roast: #280B0F" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#280B0F</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-white/20 bg-[#3B1319]" title="Tamarind: #3B1319" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#3B1319</span>
                        </div>
                        <div>
                          <div className="h-6 rounded-md border border-white/20 bg-[#C6B39A]" title="Camel: #C6B39A" />
                          <span className="text-[9px] font-mono opacity-60 mt-0.5 block">#C6B39A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Light / Dark Mode Toggle within Selected Theme */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-75">
                    2. Select Mode (Toggles strictly within {palette === 'notion' ? 'Notion' : 'Warm Classic'})
                  </label>
                  <span className="text-xs opacity-60">
                    Current: <strong>{isDark ? 'Dark Mode' : 'Light Mode'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Light Mode Selector */}
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                      !isDark
                        ? palette === 'notion'
                          ? 'border-[#37352F] bg-[#FFFFFF] text-[#37352F] shadow-sm ring-2 ring-[#37352F]/10'
                          : 'border-[#B46A72] bg-white text-[#2D3A47] shadow-sm ring-2 ring-[#B46A72]/20'
                        : 'border-inherit bg-black/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                      <Sun size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          {palette === 'notion' ? 'Notion Light' : 'Vanilla Cream Light'}
                        </span>
                        {!isDark && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-70 mt-0.5 truncate">
                        {palette === 'notion'
                          ? 'Canvas #FFFFFF + Sidebar #F7F7F5'
                          : 'Canvas #FFF7E6 + Divider #F7C8D3'}
                      </p>
                    </div>
                  </button>

                  {/* Dark Mode Selector */}
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                      isDark
                        ? palette === 'notion'
                          ? 'border-[#D4D4D4] bg-[#191919] text-[#D4D4D4] shadow-sm ring-2 ring-white/10'
                          : 'border-[#B46A72] bg-[#280B0F] text-[#F7EFE6] shadow-sm ring-2 ring-[#B46A72]/30'
                        : 'border-inherit bg-black/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Moon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          {palette === 'notion' ? 'Notion Dark' : 'Italian Roast Dark'}
                        </span>
                        {isDark && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-70 mt-0.5 truncate">
                        {palette === 'notion'
                          ? 'Canvas #191919 + Sidebar #202020'
                          : 'Canvas #280B0F + Surface #3B1319'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Explanatory Rule Callout */}
              <div className="p-4 rounded-xl border border-inherit bg-black/5 flex items-start gap-3">
                <Info size={18} className="text-[#2383E2] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-semibold text-inherit">Theme Persistence Guarantee:</p>
                  <p className="opacity-80">
                    Your choice of <strong>{palette === 'notion' ? 'Notion Minimal' : 'Warm Classic'}</strong> is saved in local storage. Whenever you toggle light and dark mode anywhere in the app (like the sidebar button), only <strong>{palette === 'notion' ? 'Notion Light / Dark' : 'Warm Classic Light / Dark'}</strong> will be used until you change your preference here.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={`p-6 rounded-2xl border transition-all space-y-6 ${cardStyle}`}>
              <div>
                <h2 className="text-lg font-display font-semibold mb-1">Notification Preferences</h2>
                <p className="text-xs opacity-70">Select what updates you want to receive regarding your study schedule and deadlines.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-inherit bg-black/5">
                  <div>
                    <p className="text-sm font-semibold">Email Summary Reminders</p>
                    <p className="text-xs opacity-70">Receive a weekly digest of completed topics and upcoming study goals.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailReminders(!emailReminders)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${toggleTrackStyle(
                      emailReminders
                    )}`}
                  >
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
                        emailReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-inherit bg-black/5">
                  <div>
                    <p className="text-sm font-semibold">Study Streak & Goal Alerts</p>
                    <p className="text-xs opacity-70">Friendly reminders when your daily task deadline is approaching.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStudyStreakAlerts(!studyStreakAlerts)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${toggleTrackStyle(
                      studyStreakAlerts
                    )}`}
                  >
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
                        studyStreakAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className={`p-6 rounded-2xl border transition-all space-y-6 ${cardStyle}`}>
              <div>
                <h2 className="text-lg font-display font-semibold mb-1">Storage & Cloud Sync</h2>
                <p className="text-xs opacity-70">Manage local cache, PDF storage quota, and cloud synchronization.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-inherit bg-black/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Cloud Storage Usage</span>
                    <span
                      className={`text-xs font-bold ${
                        isNotion ? (isDark ? 'text-[#2383E2]' : 'text-[#37352F]') : 'text-[#B46A72]'
                      }`}
                    >
                      1.8 GB / 10 GB
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full w-[18%] ${
                        isNotion ? (isDark ? 'bg-[#2383E2]' : 'bg-[#37352F]') : 'bg-[#B46A72]'
                      }`}
                    />
                  </div>
                  <p className="text-xs opacity-70">All your PDFs, handwritten notes, and digital notebooks are securely synced.</p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-inherit bg-black/5">
                  <div>
                    <p className="text-sm font-semibold">Clear Local Cache</p>
                    <p className="text-xs opacity-70">Free up space by clearing temporary PDF viewer cache files.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Local cache cleared successfully!')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Account Actions & Security Status Widget */}
        <div className="space-y-6">
          {/* Logout Action Card */}
          <div className={`p-6 rounded-2xl border transition-all space-y-4 ${cardStyle}`}>
            <div>
              <h3 className="text-sm font-semibold mb-1">Session & Account</h3>
              <p className="text-xs opacity-70">Sign out of your account on this device.</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 border border-rose-500/20"
            >
              Log Out of Notie
            </button>
          </div>

          {/* Quick Security Status Card */}
          <div className={`p-6 rounded-2xl border transition-all space-y-4 ${cardStyle}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Account Security Status</h3>
                <p className="text-xs opacity-70">Protected with 2FA & alerts</p>
              </div>
            </div>
            <div className="text-xs opacity-80 pt-2 border-t border-inherit space-y-1.5">
              <div className="flex justify-between">
                <span>Last Password Change:</span>
                <span className="font-semibold">14 days ago</span>
              </div>
              <div className="flex justify-between">
                <span>Active Sessions:</span>
                <span className="font-semibold">1 (This Device)</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

