import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-base)] font-sans antialiased selection:bg-[#B46A72] selection:text-white transition-colors duration-200">
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
    </div>
  );
}

export default AppLayout;
