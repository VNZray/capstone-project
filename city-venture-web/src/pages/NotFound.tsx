import React from "react";
import { Link } from "react-router-dom";
import "../styles/NotFound.css"; // Import your CSS file

export default function NotFound(): React.ReactElement {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-message">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <p className="notfound-subtext">
          It might have been moved or deleted.
        </p>
        <Link to="/" className="notfound-button">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
