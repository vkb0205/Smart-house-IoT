import React, { useEffect, useState, useCallback } from "react";
import LeftPanel from "./LeftPanel";
import SafetyHumidity from "./Gauge/SafetyHumidity";
import WeeklyChart from "./Gauge/WeeklyChart";
import DeviceSwitchGrid from "./Gauge/DeviceSwitchGrid";
import RightPanel from "./RightPanel";

//styles
import styles from "../../styles/Dashboard.module.css";

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
  const [devices, setDevices] = useState([
    true,
    true,
    false,
    true,
    false,
    true,
  ]);
  const [notification, setNotification] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [dataHistory, setDataHistory] = useState<EnvironmentData[]>([]);
  const [autoMode, setAutoMode] = useState(false);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Enhanced data simulation with more realistic values
  useEffect(() => {
    const interval = setInterval(() => {
      const newData: EnvironmentData = {
        temperature: parseFloat((22 + Math.random() * 8).toFixed(1)),
        humidity: Math.floor(35 + Math.random() * 30),
        safety: Math.floor(75 + Math.random() * 20),
        timestamp: Date.now(),
        airQuality:
          Math.random() > 0.7
            ? "Good"
            : Math.random() > 0.3
            ? "Moderate"
            : "Poor",
        powerUsage: parseFloat((0.5 + Math.random() * 2).toFixed(1)),
      };

      setTemperature(newData.temperature);
      setHumidity(newData.humidity);
      setSafety(newData.safety);

      setDataHistory((prev) => [...prev.slice(-20), newData]);

      // Auto temperature adjustment
      if (autoMode) {
        const tempDiff = Math.abs(newData.temperature - desiredTemp);
        if (tempDiff > 2) {
          showNotification(
            `🤖 Auto-adjusting climate system (${tempDiff.toFixed(
              1
            )}°C difference)`
          );
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [desiredTemp, autoMode, showNotification]);

  const toggleDevice = (index: number) => {
    const updated = [...devices];
    updated[index] = !updated[index];
    setDevices(updated);

    const deviceNames = [
      "AC Unit",
      "Heater",
      "Humidifier",
      "Fan",
      "Air Purifier",
      "Dehumidifier",
    ];
    const action = updated[index] ? "turned on" : "turned off";
    showNotification(`${deviceNames[index]} ${action}`);
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
            <h1 className={styles.pageTitle}>🌡️ Smart Thermostat</h1>
            <p className={styles.pageSubtitle}>
              Intelligent Climate Control & Monitoring
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
