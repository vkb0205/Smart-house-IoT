import React, { useState, useEffect } from "react";
import { rtdb } from "../../firebase/config";
import { ref, set, onValue, push } from "firebase/database";

interface SensorData {
  temperature: number;
  humidity: number;
  gasLevel: string;
  timestamp: string;
}

const RealtimeTest: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    console.log("🔥 Attempting to connect to Firebase Realtime Database...");
    console.log(
      "Database URL:",
      "https://smarthouse-iot-lab-default-rtdb.firebaseio.com/"
    );

    // Listen to real-time updates
    const sensorRef = ref(rtdb, "sensors/current");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        console.log("📊 Firebase snapshot received:", snapshot.val());
        const data = snapshot.val();
        if (data) {
          setSensorData(data);
          setConnectionStatus("Connected ✅");
        } else {
          setConnectionStatus("Connected - No data yet");
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("❌ Firebase error:", error);
        setError(error.message);
        setLoading(false);
        setConnectionStatus("Connection failed ❌");
      }
    );

    return () => unsubscribe();
  }, []);

  const simulateESP32Data = async () => {
    console.log("🚀 Attempting to send data to Firebase...");
    const testData: SensorData = {
      temperature: Math.round((Math.random() * 15 + 20) * 10) / 10, // 20-35°C
      humidity: Math.round((Math.random() * 40 + 30) * 10) / 10, // 30-70%
      gasLevel: Math.random() > 0.7 ? "Warning" : "Good",
      timestamp: new Date().toISOString(),
    };

    console.log("📤 Sending data:", testData);

    try {
      // Write to current sensor data
      await set(ref(rtdb, "sensors/current"), testData);

      // Also push to history
      await push(ref(rtdb, "sensors/history"), testData);

      console.log("✅ Data sent to Firebase successfully!");
      setConnectionStatus("Data sent successfully ✅");
    } catch (error: any) {
      console.error("❌ Error sending data:", error);
      setError(`Failed to send data: ${error.message}`);
      setConnectionStatus("Send failed ❌");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>🔥 Firebase Realtime Database Test</h2>
        <div
          style={{
            background: "#fef3c7",
            padding: "1rem",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <p>🔄 {connectionStatus}</p>
          <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
            Check the browser console (F12) for detailed logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h2>🔥 Firebase Realtime Database Test</h2>

      {/* Connection Status */}
      <div
        style={{
          background: error ? "#fee2e2" : "#dcfce7",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: error ? "1px solid #fecaca" : "1px solid #bbf7d0",
        }}
      >
        <p style={{ margin: 0, color: error ? "#991b1b" : "#166534" }}>
          Status: {connectionStatus}
        </p>
        {error && (
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontSize: "0.875rem",
              color: "#991b1b",
            }}
          >
            Error: {error}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={simulateESP32Data}
          style={{
            background: "#4f46e5",
            color: "white",
            padding: "1rem 2rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          📡 Simulate ESP32 Data
        </button>
      </div>

      {sensorData ? (
        <div
          style={{
            background: "#f8fafc",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h3>🌡️ Live Sensor Data</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <strong>Temperature:</strong> {sensorData.temperature}°C
            </div>
            <div>
              <strong>Humidity:</strong> {sensorData.humidity}%
            </div>
            <div>
              <strong>Gas Level:</strong>
              <span
                style={{
                  color: sensorData.gasLevel === "Good" ? "#059669" : "#dc2626",
                  fontWeight: "bold",
                  marginLeft: "0.5rem",
                }}
              >
                {sensorData.gasLevel}
              </span>
            </div>
            <div>
              <strong>Last Update:</strong>{" "}
              {new Date(sensorData.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#fef2f2",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #fecaca",
            color: "#991b1b",
          }}
        >
          No sensor data available. Click the button to simulate ESP32 data!
        </div>
      )}

      <div
        style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#6b7280" }}
      >
        <p>💡 This simulates how your ESP32 will send data to Firebase.</p>
        <p>🔄 Data updates in real-time without page refresh!</p>
      </div>
    </div>
  );
};

export default RealtimeTest;
