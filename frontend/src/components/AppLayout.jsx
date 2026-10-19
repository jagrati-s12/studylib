import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import FloatingPomodoroMini from './FloatingPomodoroMini';
import { useTheme } from '@/context/ThemeContext';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isNotion, isDark } = useTheme();

  return (
    <div
      className={`flex min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-base)] font-sans antialiased transition-colors duration-200 ${
        isNotion
          ? isDark
            ? 'selection:bg-[#373737] selection:text-white'
            : 'selection:bg-[#E9E9E7] selection:text-black'
          : 'selection:bg-[#B46A72] selection:text-white'
      }`}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <main
        className={`flex-1 min-h-screen overflow-x-hidden overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-18' : 'ml-64'
        }`}
      >
        <Outlet />
      </main>
      <FloatingPomodoroMini />
    </div>
  );
}

export default AppLayout;
