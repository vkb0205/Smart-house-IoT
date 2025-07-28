import React from "react";
import "./App.css";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import AuthForm from "./Auth/AuthForm";
import Homepage from "./Homepage/Homepage";

// Protected App Content
const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  return (
    <div>
      {/* Main application */}
      <Homepage />
    </div>
  );
};

// Main App with Authentication Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
