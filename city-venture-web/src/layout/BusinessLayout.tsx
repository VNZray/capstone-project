import { Outlet, useLocation } from "react-router-dom";
import "../styles/Layout.css"; // Import CSS file
import Header from "../components/Business/Header";

export default function BusinessLayout() {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/+$/, "");
  const hideHeader = pathname === "/business" || pathname === "/business/register";
  return (
    <div className="business-layout">
      {!hideHeader && <Header />}
      <Outlet />
    </div>
  );
}
