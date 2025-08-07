import React, { useEffect, useState, useCallback } from "react";
import LeftPanel from "./LeftPanel";
import SafetyHumidity from "./Gauge/SafetyHumidity";
import WeeklyChart from "./Gauge/WeeklyChart";
import DeviceSwitchGrid from "./Gauge/DeviceSwitchGrid";
import RightPanel from "./RightPanel";

// Firebase imports
import { getDatabase, ref, get, set } from "firebase/database";
import { initializeApp } from "firebase/app";

//styles
import styles from "../../styles/Dashboard.module.css";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8vZA9_zqopzXn_ug4vMqHtHAwJgA1n8c",
  authDomain: "smarthouse-iot-lab.firebaseapp.com",
  databaseURL:
    "https://smarthouse-iot-lab-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "smarthouse-iot-lab",
  storageBucket: "smarthouse-iot-lab.appspot.com",
  messagingSenderId: "556659966348",
  appId: "1:556659966348:web:smarthouse-iot-lab",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

interface DashboardProps {
  onBack?: () => void;
}

interface EnvironmentData {
  temperature: number;
  humidity: number;
  safety: number;
  timestamp: number;
  airQuality: "Good" | "Moderate" | "Poor";
  powerUsage: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [temperature, setTemperature] = useState(24);
  const [desiredTemp, setDesiredTemp] = useState(24);
  const [humidity, setHumidity] = useState(45);
  const [safety, setSafety] = useState(85);
  // Map Firebase device fields to our device array
  // Index 0: buzzer, 1: fan, 2: led, 3: water_pump, 4-5: future devices
  const [devices, setDevices] = useState([
    false, // buzzer
    false, // fan
    false, // led
    false, // water_pump
    false, // future device 1
    false, // future device 2
  ]);
  const [notification, setNotification] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dataHistory, setDataHistory] = useState<EnvironmentData[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Real Firebase data fetching - using only the real-time sensor path
  useEffect(() => {
    console.log("🔥 Dashboard connecting to Firebase for real sensor data...");

    // Use only the real-time sensor path (same as GasDetection)
    const sensorRef = ref(db, "sensor"); // Real-time data path
    const deviceRef = ref(db, "device"); // Device control path

    const intervalId = setInterval(() => {
      // Fetch sensor data
      get(sensorRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const firebaseData = snapshot.val();
            console.log(
              "📊 Dashboard received Firebase data from 'sensor' (REAL-TIME):",
              firebaseData
            );
            updateUIWithFirebaseData(firebaseData);
          } else {
            console.warn("⚠️ No sensor data found at 'sensor' path");
            setIsConnected(false);
            showNotification("⚠️ No real-time sensor data available");
          }
        })
        .catch((error) => {
          console.error("❌ Firebase fetch error on sensor:", error);
          setIsConnected(false);
          showNotification("⚠️ Could not fetch sensor data from Firebase");
        });

      // Fetch device states
      get(deviceRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const deviceData = snapshot.val();
            console.log("🔌 Dashboard received device states:", deviceData);
            updateDeviceStates(deviceData);
          } else {
            console.warn("⚠️ No device data found at 'device' path");
          }
        })
        .catch((error) => {
          console.error("❌ Firebase fetch error on device:", error);
        });
    }, 3000); // Fetch every 3 seconds

    return () => clearInterval(intervalId);
  }, [desiredTemp, autoMode, showNotification]);

  // Helper function to update UI with Firebase data
  const updateUIWithFirebaseData = (firebaseData: any) => {
    console.log(
      "🔄 Dashboard updating UI with real-time data structure:",
      Object.keys(firebaseData)
    );
    console.log("🔄 Raw real-time Firebase data:", firebaseData);

    // Handle the real-time data structure from 'sensor' path
    let temp, humid, gasValue;

    // Extract temperature
    if (firebaseData.temperature !== undefined) {
      temp = parseFloat(firebaseData.temperature);
      console.log(
        "🌡️ Found temperature:",
        firebaseData.temperature,
        "-> parsed:",
        temp
      );
    } else {
      console.warn("⚠️ Temperature not found in Firebase data");
    }

    // Extract humidity
    if (firebaseData.humidity !== undefined) {
      humid = parseFloat(firebaseData.humidity);
      console.log(
        "💧 Found humidity:",
        firebaseData.humidity,
        "-> parsed:",
        humid
      );
    } else {
      console.warn("⚠️ Humidity not found in Firebase data");
    }

    // Extract gas value for safety calculation
    if (firebaseData["gas-value"] !== undefined) {
      gasValue = parseFloat(firebaseData["gas-value"]);
      console.log(
        "🔥 Found gas-value:",
        firebaseData["gas-value"],
        "-> parsed:",
        gasValue
      );
    } else if (firebaseData.gasValue !== undefined) {
      gasValue = parseFloat(firebaseData.gasValue);
      console.log(
        "🔥 Found gasValue:",
        firebaseData.gasValue,
        "-> parsed:",
        gasValue
      );
    } else {
      console.log("ℹ️ No gas data found (this is normal for Dashboard)");
    }

    // Update states with real Firebase data
    if (temp !== undefined && !isNaN(temp)) {
      console.log("✅ Updating Dashboard temperature to:", temp);
      setTemperature(temp);
    }
    if (humid !== undefined && !isNaN(humid)) {
      console.log("✅ Updating Dashboard humidity to:", humid);
      setHumidity(humid);
    }

    // Create environment data for history
    const newData: EnvironmentData = {
      temperature: temp || temperature,
      humidity: humid || humidity,
      safety: gasValue ? Math.max(0, 100 - gasValue) : safety,
      timestamp: Date.now(),
      airQuality:
        gasValue && gasValue > 50
          ? "Poor"
          : gasValue && gasValue > 30
          ? "Moderate"
          : "Good",
      powerUsage: parseFloat((0.5 + Math.random() * 2).toFixed(1)), // Keep simulated for now
    };

    setDataHistory((prev) => [...prev.slice(-20), newData]);
    setIsConnected(true);
    setLastUpdate(new Date().toLocaleTimeString());

    // Auto temperature adjustment with real data
    if (autoMode && temp) {
      const tempDiff = Math.abs(temp - desiredTemp);
      if (tempDiff > 2) {
        showNotification(
          `🤖 Auto-adjusting climate system (${tempDiff.toFixed(
            1
          )}°C difference)`
        );
      }
    }
  };

  // Helper function to update device states from Firebase
  const updateDeviceStates = (deviceData: any) => {
    console.log("🔌 Processing device data:", deviceData);

    // Map Firebase device data to our device array
    const newDevices = [
      Boolean(deviceData.buzzer), // Index 0: buzzer
      Boolean(deviceData.fan), // Index 1: fan
      Boolean(deviceData.led), // Index 2: led
      Boolean(deviceData.water_pump), // Index 3: water_pump
      false, // Index 4: future device 1
      false, // Index 5: future device 2
    ];

    console.log("🔄 Updating device states:", {
      buzzer: newDevices[0],
      fan: newDevices[1],
      led: newDevices[2],
      water_pump: newDevices[3],
    });

    setDevices(newDevices);
  };

  const toggleDevice = async (index: number) => {
    const updated = [...devices];
    updated[index] = !updated[index];
    setDevices(updated);

    // Map device array index to Firebase field names
    const deviceNames = [
      "buzzer", // Index 0
      "fan", // Index 1
      "led", // Index 2
      "water_pump", // Index 3
      "future_1", // Index 4 (future device)
      "future_2", // Index 5 (future device)
    ];

    const displayNames = [
      "Buzzer",
      "Fan",
      "LED",
      "Water Pump",
      "Air Purifier",
      "Dehumidifier",
    ];

    const deviceField = deviceNames[index];
    const displayName = displayNames[index];
    const newValue = updated[index];

    // Update Firebase device state
    if (index < 4) {
      // Only update real devices, not future ones
      try {
        const deviceRef = ref(db, `device/${deviceField}`);
        await set(deviceRef, newValue);
        console.log(`✅ Updated ${deviceField} to ${newValue} in Firebase`);

        const action = newValue ? "turned on" : "turned off";
        showNotification(`🔌 ${displayName} ${action}`);
      } catch (error) {
        console.error(`❌ Failed to update ${deviceField}:`, error);
        showNotification(`⚠️ Failed to control ${displayName}`);

        // Revert the change if Firebase update failed
        const revertedDevices = [...devices];
        revertedDevices[index] = !newValue;
        setDevices(revertedDevices);
      }
    } else {
      // For future devices, just show local notification
      const action = newValue ? "turned on" : "turned off";
      showNotification(`${displayName} ${action} (local only)`);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "settings":
        showNotification("⚙️ Opening system settings...");
        break;
      case "analytics":
        showNotification("📊 Analytics dashboard coming soon!");
        break;
      case "notifications":
        showNotification("🔔 You have 3 new notifications");
        break;
      default:
        break;
    }
  };

  const getTemperatureStatus = () => {
    const diff = Math.abs(temperature - desiredTemp);
    if (diff <= 1) return { status: "optimal", color: "#10b981", icon: "✅" };
    if (diff <= 3) return { status: "good", color: "#f59e0b", icon: "⚠️" };
    return { status: "needs_adjustment", color: "#ef4444", icon: "🔧" };
  };

  const getActiveDevicesCount = () => devices.filter(Boolean).length;

  const tempStatus = getTemperatureStatus();

  return (
    <div className={styles.dashboardContainer}>
      {/* Notification */}
      {notification && (
        <div className={styles.notification}>
          <span>{notification}</span>
          <button
            className={styles.notificationClose}
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Header with Back Button and Title */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button className={styles.backButton} onClick={onBack}>
              <span className={styles.backIcon}>←</span>
              <span>Back to Home</span>
            </button>
          )}
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>
              🌡️ Smart Thermostat
              <span
                style={{
                  marginLeft: "1rem",
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  background: isConnected ? "#10b981" : "#ef4444",
                  color: "white",
                }}
              >
                {isConnected ? "🟢 LIVE" : "🔴 OFFLINE"}
              </span>
            </h1>
            <p className={styles.pageSubtitle}>
              Intelligent Climate Control & Monitoring
              {lastUpdate && (
                <span
                  style={{
                    marginLeft: "1rem",
                    fontSize: "0.8rem",
                    opacity: 0.7,
                  }}
                >
                  (Last update: {lastUpdate})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.actionButton}
            title="System Settings"
            onClick={() => handleQuickAction("settings")}
          >
            ⚙️
          </button>
          <button
            className={styles.actionButton}
            title="Analytics & Reports"
            onClick={() => handleQuickAction("analytics")}
          >
            📊
          </button>
          <button
            className={styles.actionButton}
            title="Notifications"
            onClick={() => handleQuickAction("notifications")}
          >
            🔔
          </button>
        </div>
      </header>

      {/* Enhanced Quick Stats Bar */}
      <div className={styles.quickStatsBar}>
        <div className={`${styles.quickStat} ${styles.temperatureStat}`}>
          <div className={styles.statIcon}>🌡️</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Current Temp</span>
            <span className={styles.statValue}>
              {temperature}°C
              <span
                className={styles.statIndicator}
                style={{ color: tempStatus.color }}
              >
                {tempStatus.icon}
              </span>
            </span>
          </div>
        </div>
        <div className={`${styles.quickStat} ${styles.targetStat}`}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Target Temp</span>
            <span className={styles.statValue}>
              {desiredTemp}°C
              {autoMode && <span className={styles.autoMode}>AUTO</span>}
            </span>
          </div>
        </div>
        <div className={`${styles.quickStat} ${styles.humidityStat}`}>
          <div className={styles.statIcon}>💧</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Humidity</span>
            <span className={styles.statValue}>
              {humidity}%
              <span className={styles.trendIndicator}>
                {humidity > 50 ? "↗️" : humidity < 35 ? "↘️" : "→"}
              </span>
            </span>
          </div>
        </div>
        <div className={`${styles.quickStat} ${styles.devicesStat}`}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Devices</span>
            <span className={styles.statValue}>
              {getActiveDevicesCount()}/6
              <span className={styles.deviceIndicator}>
                {isConnected ? "🟢" : "🔴"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Auto Mode Toggle */}
      <div className={styles.autoModeSection}>
        <div className={styles.autoModeCard}>
          <div className={styles.autoModeInfo}>
            <span className={styles.autoModeIcon}>🤖</span>
            <div>
              <h3>Smart Auto Mode</h3>
              <p>
                Automatically adjust temperature based on preferences and
                schedule
              </p>
            </div>
          </div>
          <label className={styles.autoModeToggle}>
            <input
              type="checkbox"
              checked={autoMode}
              onChange={(e) => {
                setAutoMode(e.target.checked);
                showNotification(
                  e.target.checked
                    ? "🤖 Auto mode enabled"
                    : "👤 Manual mode enabled"
                );
              }}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Left Panel: Temperature Control */}
        <div className={styles.leftSection}>
          <LeftPanel
            temperature={temperature}
            desiredTemp={desiredTemp}
            onTempChange={(temp) => {
              setDesiredTemp(temp);
              showNotification(`🎯 Target temperature set to ${temp}°C`);
            }}
          />
        </div>

        {/* Right Panel: Analytics and Controls */}
        <div className={styles.rightSection}>
          <RightPanel
            safety={safety}
            humidity={humidity}
            devices={devices}
            onToggle={toggleDevice}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
