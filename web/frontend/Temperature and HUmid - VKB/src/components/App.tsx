import React from "react";
import "./App.css";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import AuthForm from "./Auth/AuthForm";
import Homepage from "./Homepage/Homepage";
import { initializeApp } from "firebase/app";

import {getDatabase, onValue,ref } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyB8vZA9_zqopzXn_ug4vMqHtHAwJgA1n8c",
  authDomain: "smarthouse-iot-lab.firebaseapp.com",
  databaseURL: "https://smarthouse-iot-lab-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "smarthouse-iot-lab",
  storageBucket: "smarthouse-iot-lab.appspot.com",
  messagingSenderId: "556659966348",
  appId: "1:556659966348:web:smarthouse-iot-lab"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const distanceRef = ref(db, 'sensor');
onValue(distanceRef, (snapshot) => {
  const data = snapshot.val();
  console.log("Distance data:", data);
});
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
