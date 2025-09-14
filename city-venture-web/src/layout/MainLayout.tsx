import { Outlet } from "react-router-dom";
import "../styles/Layout.css"; // Import CSS file
import Header from "../components/Main/Header";

export default function MainLayout() {
  return (
    <div className="landing-page-layout">
      <Header />
      <Outlet />
    </div>
  );
}
