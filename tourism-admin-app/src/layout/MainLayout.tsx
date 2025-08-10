import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/MainHeader";
import "../styles/Layout.css"; // Import CSS file

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="main-outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
