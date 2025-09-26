import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Admin/Sidebar";
import "../styles/Layout.css"; // Import CSS file
import MainHeader from "../components/Admin/MainHeader";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => setIsSidebarOpen((v) => !v);
  const handleCloseSidebar = () => setIsSidebarOpen(false);
  return (
    <div className="main-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      <div className="main-content">
        <MainHeader onMenuClick={handleToggleSidebar} />
        <main className="main-outlet">
          <Outlet />
        </main>
      </div>
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
