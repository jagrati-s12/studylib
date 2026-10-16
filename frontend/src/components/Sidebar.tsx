import { NavLink } from 'react-router-dom';
import {
  ListTodo,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  topicCount?: number;
}

export function Sidebar({ collapsed = false, onToggle, topicCount = 14 }: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col h-screen transition-all duration-300 select-none border-r ${
        isDark
          ? 'bg-[#280B0F] border-[#3B1319] text-[#C6B39A]'
          : 'bg-[#FFF5F6] border-[#F7C8D3] text-[#2D3A47]'
      } ${collapsed ? 'w-18' : 'w-64'}`}
    >
      {/* Brand & Badge Header */}
      <div className="flex items-center justify-between h-18 px-5 border-b border-inherit">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F7C8D3] text-[#2D3A47] shrink-0 shadow-sm overflow-hidden p-1 border border-[#B46A72]/30">
            <svg viewBox="0 0 512 512" className="w-full h-full object-contain">
              <path d="M 160 360 C 160 300 200 240 280 230 C 360 220 410 270 410 330 C 410 380 370 395 320 390 C 270 385 200 395 160 360 Z" fill="#FFFFFF" stroke="#2D3A47" strokeWidth="20" strokeLinejoin="round" />
              <polygon points="210,245 235,210 260,240" fill="#FFFFFF" stroke="#2D3A47" strokeWidth="18" strokeLinejoin="round" />
              <polygon points="360,255 385,225 400,260" fill="#FFFFFF" stroke="#2D3A47" strokeWidth="18" strokeLinejoin="round" />
              <ellipse cx="230" cy="315" rx="22" ry="14" fill="#F7C8D3" transform="rotate(-10 230 315)" />
              <ellipse cx="258" cy="298" rx="6" ry="10" fill="#2D3A47" />
              <ellipse cx="306" cy="298" rx="6" ry="10" fill="#2D3A47" />
              <path d="M 268 310 Q 275 318 282 310 Q 289 318 296 310" stroke="#2D3A47" strokeWidth="12" fill="none" strokeLinecap="round" />
              <path d="M 245 285 L 365 245 C 375 245 375 355 365 355 L 245 395 C 235 395 235 285 245 285 Z" fill="#8F9BB3" stroke="#2D3A47" strokeWidth="16" strokeLinejoin="round" />
              <path d="M 305 305 C 305 298 315 293 320 300 C 325 293 335 298 335 305 C 335 315 320 325 320 325 C 320 325 305 315 305 305 Z" fill="#FF8DA1" />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-tight text-inherit">
                  notie
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-[#3B1319] text-[#C6B39A] border-[#7B694E]/40'
                      : 'bg-[#F7C8D3]/50 text-[#B46A72] border-[#F7C8D3]'
                  }`}
                >
                  Tasks {topicCount}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] opacity-70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8B58A] animate-pulse" />
                <span>Activities</span>
              </div>
            </div>
          )}
        </div>

        {onToggle && !collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#3B1319] text-[#C6B39A]' : 'hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
            }`}
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3.5 py-4 space-y-6 overflow-y-auto">
        {/* MAIN section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-bold tracking-wider uppercase opacity-50">
              MAIN
            </p>
          )}
          <nav className={`space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
            <NavItem
              to="/todo"
              icon={ListTodo}
              label="Todo"
              collapsed={collapsed}
              isDark={isDark}
            />
            <NavItem
              to="/schedule"
              icon={Calendar}
              label="Schedule"
              collapsed={collapsed}
              isDark={isDark}
            />
            <NavItem
              to="/notes"
              icon={FileText}
              label="Notes"
              collapsed={collapsed}
              isDark={isDark}
            />
          </nav>
        </div>

        {/* RECORDS section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-bold tracking-wider uppercase opacity-50">
              RECORDS
            </p>
          )}
          <nav className="space-y-1">
            <NavItem
              to="/settings"
              icon={Settings}
              label="Settings"
              collapsed={collapsed}
              isDark={isDark}
            />
          </nav>
        </div>

        {/* Study Quick Tip Callout */}
        {!collapsed && (
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              isDark
                ? 'bg-[#3B1319]/60 border-[#7B694E]/30 text-[#C6B39A]'
                : 'bg-[#F7C8D3]/20 border-[#F7C8D3] text-[#2D3A47]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1 text-[#B46A72]">
              <Sparkles size={14} />
              <span>Study Focus</span>
            </div>
            <p className="opacity-80">
              Dual-pane workspace is ready for your notes & PDFs. Press <kbd className="px-1 py-0.5 rounded bg-black/10 font-mono text-[10px]">⌘K</kbd> to search anytime.
            </p>
          </div>
        )}
      </div>

      {/* Footer Profile & Theme Toggle */}
      <div
        className={`p-3 border-t border-inherit ${
          isDark ? 'bg-[#280B0F]' : 'bg-[#FFF5F6]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#B46A72] text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-white/20">
                BS
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#A8B58A] ring-2 ring-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate leading-tight text-inherit">
                  jagrati sharma 
                </p>
                <p className="text-[11px] opacity-60 truncate">
                  tobegiven@gamil.com
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mood (Vanilla Cream)' : 'Switch to Dark Mood (Italian Roast)'}
            className={`p-2 rounded-xl transition-all ${
              isDark
                ? 'bg-[#3B1319] text-[#C6B39A] hover:bg-[#7B694E]/40'
                : 'bg-[#F7C8D3]/30 text-[#2D3A47] hover:bg-[#F7C8D3]/50'
            }`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {collapsed && onToggle && (
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={onToggle}
              className="p-1 rounded-lg opacity-60 hover:opacity-100"
              title="Expand sidebar"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
  isDark,
}: {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  collapsed: boolean;
  isDark: boolean;
}) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? isDark
              ? 'bg-[#3B1319] text-white shadow-sm font-semibold'
              : 'bg-[#2D3A47] text-white shadow-sm font-semibold'
            : isDark
            ? 'text-[#C6B39A]/80 hover:bg-[#3B1319]/50 hover:text-white'
            : 'text-[#2D3A47]/80 hover:bg-[#F7C8D3]/30 hover:text-[#2D3A47]'
        } ${collapsed ? 'justify-center px-2 w-12 h-12 mx-auto' : ''}`
      }
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default Sidebar;
