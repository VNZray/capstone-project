import { Outlet } from "react-router-dom";
import Sidebar from "../components/Admin/Sidebar";
import "../styles/Layout.css"; // Import CSS file
import MainHeader from "../components/Admin/MainHeader";

export default function AdminLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <MainHeader />
        <main className="main-outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
