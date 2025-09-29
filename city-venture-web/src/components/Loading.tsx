import "./styles/Loading.css"; // for styling

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <span className="loading-text">Loading...</span>
    </div>
  );
}
