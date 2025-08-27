import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Layout.css"; // Import CSS file
import MainHeader from "../components/MainHeader";
import { BusinessProvider } from "@/src/context/BusinessContext";

export default function MainLayout() {
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
