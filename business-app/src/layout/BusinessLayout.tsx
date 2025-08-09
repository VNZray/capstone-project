import { Outlet } from "react-router-dom";
import "../styles/Layout.css"; // Import CSS file

export default function BusinessLayout() {
  return (
    <div className="business-layout">
        <Outlet />
    </div>
  );
}
