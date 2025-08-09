import { Outlet } from "react-router-dom";
import "../styles/Layout.css"; // Import CSS file

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Outlet />
      </div>
    </div>
  );
}
