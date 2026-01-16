import { Outlet } from "react-router-dom";
import { useState } from "react";
import { UnifiedSidebar } from "../features/business/unified";
import "../styles/Layout.css"; // Import CSS file
import MainHeader from "../components/Business/MainHeader";

export default function BusinessManagementLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setIsSidebarOpen((v) => !v);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="main-layout">
      <UnifiedSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      <div className="main-content">
        <MainHeader onMenuClick={handleToggleSidebar} />
        <main className="main-outlet">
          <Outlet />
        </main>
      </div>
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={handleCloseSidebar} aria-hidden="true" />
      )}
    </div>
  );
}
