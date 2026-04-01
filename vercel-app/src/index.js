import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
          <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", maxWidth: "480px" }}>
            <h1 style={{ color: "#E40000", fontWeight: "bold", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
            <p style={{ color: "#374151", marginBottom: "0.5rem" }}>The app failed to load.</p>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", fontFamily: "monospace" }}>
              {this.state.error?.message || "Unknown error"}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
