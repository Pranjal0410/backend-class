/**
 * AppLayout Component
 * Main layout wrapper with sidebar and content area
 */
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout({ children, title, searchQuery, onSearchChange }) {
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-layout__sidebar">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="app-layout__main">
        <TopBar
          title={title}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <main className="app-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
