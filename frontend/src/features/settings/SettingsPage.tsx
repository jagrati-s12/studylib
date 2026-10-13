import { useState, useEffect } from 'react';
import {
  User,
  Sun,
  Moon,
  CloudCog,
  Info,
} from 'lucide-react';

export default function SettingsPage() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-surface-500 mt-0.5">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile */}
      <Card title="Profile" icon={<User size={18} />}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-bold text-lg">
            J
          </div>
          <div>
            <p className="font-medium text-surface-800">Jaggu</p>
            <p className="text-sm text-surface-400">jaggu@example.com</p>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card title="Appearance" icon={dark ? <Moon size={18} /> : <Sun size={18} />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-surface-800">Theme</p>
            <p className="text-sm text-surface-400">
              {dark ? 'Dark mode is active' : 'Light mode is active'}
            </p>
          </div>
          <button
            onClick={() => setDark((prev) => !prev)}
            className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
            style={{
              backgroundColor: dark ? '#3b82f6' : '#cbd5e1',
            }}
          >
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform"
              style={{ transform: dark ? 'translateX(22px)' : 'translateX(4px)' }}
            >
              {dark ? (
                <Moon size={12} className="text-primary-600" />
              ) : (
                <Sun size={12} className="text-surface-400" />
              )}
            </span>
          </button>
        </div>
      </Card>

      {/* Storage */}
      <Card title="Storage" icon={<CloudCog size={18} />}>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <p className="text-sm text-surface-600">Cloud storage connected</p>
        </div>
        <p className="text-xs text-surface-400 mt-2">
          Files and documents are synced across your devices automatically.
        </p>
      </Card>

      {/* About */}
      <Card title="About" icon={<Info size={18} />}>
        <div className="space-y-1 text-sm">
          <p className="text-surface-600">
            <span className="font-medium">Personal Study Library</span>
          </p>
          <p className="text-surface-400">v0.1.0 — MVP</p>
          <p className="text-surface-400">
            Organize subjects, serial-numbered indexes, PDFs, handwritten notes,
            and digital notes in one application.
          </p>
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-surface-500">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
