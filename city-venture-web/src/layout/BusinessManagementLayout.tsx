import { Outlet } from "react-router-dom";
import Sidebar from "../components/Business/Sidebar";
import "../styles/Layout.css"; // Import CSS file
import MainHeader from "../components/Business/MainHeader";

export default function BusinessManagementLayout() {
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
