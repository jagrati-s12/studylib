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
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();

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
  ] ;

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
            className="px-6 py-2.5 rounded-xl bg-[#B46A72] hover:bg-[#9f5961] text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
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
                  ? isDark
                    ? 'bg-[#3B1319] text-white shadow-sm border border-[#7B694E]/40 font-semibold'
                    : 'bg-[#2D3A47] text-white shadow-sm font-semibold'
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
              <div
                className={`p-6 rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
                }`}
              >
                <h2 className="text-lg font-display font-semibold mb-1">Profile Information</h2>
                <p className="text-xs opacity-70 mb-6">
                  Update your photo and personal details.
                </p>

                {/* Avatar Row */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-inherit">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-[#B46A72] text-white font-bold flex items-center justify-center text-xl shadow-md ring-4 ring-[#F7C8D3]/30">
                      JS
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#A8B58A] ring-2 ring-white" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => alert('Profile picture updated!')}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isDark
                          ? 'border-[#7B694E]/40 hover:bg-[#3B1319] text-white'
                          : 'border-[#2D3A47]/20 hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
                      }`}
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Photo removed.')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all"
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
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                        isDark
                          ? 'bg-[#1F080C] border-[#3B1319] text-white focus:border-[#B46A72]'
                          : 'bg-white border-slate-200 text-slate-800 focus:border-[#B46A72]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                        isDark
                          ? 'bg-[#1F080C] border-[#3B1319] text-white focus:border-[#B46A72]'
                          : 'bg-white border-slate-200 text-slate-800 focus:border-[#B46A72]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                        isDark
                          ? 'bg-[#1F080C] border-[#3B1319] text-white focus:border-[#B46A72]'
                          : 'bg-white border-slate-200 text-slate-800 focus:border-[#B46A72]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Academic Major / Bio</label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                        isDark
                          ? 'bg-[#1F080C] border-[#3B1319] text-white focus:border-[#B46A72]'
                          : 'bg-white border-slate-200 text-slate-800 focus:border-[#B46A72]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Security Toggles Card */}
              <div
                className={`p-6 rounded-2xl border transition-all space-y-6 ${
                  isDark
                    ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
                }`}
              >
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
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        twoFactor ? 'bg-[#B46A72]' : isDark ? 'bg-zinc-700' : 'bg-slate-300'
                      }`}
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
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        loginAlerts ? 'bg-[#B46A72]' : isDark ? 'bg-zinc-700' : 'bg-slate-300'
                      }`}
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
              <div
                className={`p-6 rounded-2xl border transition-all space-y-5 ${
                  isDark
                    ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
                }`}
              >
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
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                        isDark ? 'bg-[#1F080C] border-[#3B1319] text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}
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
                        className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                          isDark ? 'bg-[#1F080C] border-[#3B1319] text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all ${
                          isDark ? 'bg-[#1F080C] border-[#3B1319] text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div
              className={`p-6 rounded-2xl border transition-all space-y-6 ${
                isDark
                  ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
                  : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
              }`}
            >
              <div>
                <h2 className="text-lg font-display font-semibold mb-1">Appearance & Theme</h2>
                <p className="text-xs opacity-70">
                  Customize how Notie looks on your device. Choose between cozy light mode and warm Italian Roast dark mode.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-inherit bg-black/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#B46A72] text-white">
                    {isDark ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {isDark ? 'Dark Theme (Italian Roast)' : 'Light Theme (Vanilla Cream)'}
                    </p>
                    <p className="text-xs opacity-70">Seamlessly toggle between daytime study and night reading.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-5 py-2.5 rounded-xl bg-[#B46A72] hover:bg-[#9f5961] text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div
              className={`p-6 rounded-2xl border transition-all space-y-6 ${
                isDark
                  ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
                  : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
              }`}
            >
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
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      emailReminders ? 'bg-[#B46A72]' : isDark ? 'bg-zinc-700' : 'bg-slate-300'
                    }`}
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
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      studyStreakAlerts ? 'bg-[#B46A72]' : isDark ? 'bg-zinc-700' : 'bg-slate-300'
                    }`}
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
            <div
              className={`p-6 rounded-2xl border transition-all space-y-6 ${
                isDark
                  ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
                  : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
              }`}
            >
              <div>
                <h2 className="text-lg font-display font-semibold mb-1">Storage & Cloud Sync</h2>
                <p className="text-xs opacity-70">Manage local cache, PDF storage quota, and cloud synchronization.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-inherit bg-black/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Cloud Storage Usage</span>
                    <span className="text-xs font-bold text-[#B46A72]">1.8 GB / 10 GB</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden dark:bg-zinc-800">
                    <div className="h-full bg-[#B46A72] rounded-full w-[18%]" />
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
          <div
            className={`p-6 rounded-2xl border transition-all space-y-4 ${
              isDark
                ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
            }`}
          >
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
          <div
            className={`p-6 rounded-2xl border transition-all space-y-4 ${
              isDark
                ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
            }`}
          >
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

