import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useCallback, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-base)] font-sans antialiased selection:bg-[#B46A72] selection:text-white transition-colors duration-200">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <GlobalSearch open={searchOpen} onClose={closeSearch} />
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
