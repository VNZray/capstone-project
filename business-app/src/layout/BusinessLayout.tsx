import { Outlet } from "react-router-dom";
import "../styles/Layout.css"; // Import CSS file
import Header from "../components/Header";

export default function BusinessLayout() {
  return (
    <div className="business-layout">
      <Header />
        <Outlet />
    </div>
  );
}
