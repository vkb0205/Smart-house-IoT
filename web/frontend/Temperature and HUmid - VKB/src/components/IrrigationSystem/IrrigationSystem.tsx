import React, { useState, useEffect, useCallback } from "react";
import styles from "../../styles/IrrigationSystem.module.css";

interface IrrigationSystemProps {
  onBack?: () => void;
}

interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lightLevel: number;
  timestamp: number;
  time: string;
}

interface Zone {
  id: number;
  name: string;
  isActive: boolean;
  moistureLevel: number;
  waterUsage: number;
  schedule: string;
  plantType: string;
}

interface WeatherData {
  condition: "Sunny" | "Cloudy" | "Rainy" | "Stormy";
  temperature: number;
  humidity: number;
  rainfall: number;
}

const IrrigationSystem: React.FC<IrrigationSystemProps> = ({ onBack }) => {
  const [currentData, setCurrentData] = useState<SensorData>({
    soilMoisture: 45,
    temperature: 26,
    humidity: 65,
    lightLevel: 75,
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString(),
  });

  const [zones, setZones] = useState<Zone[]>([
    {
      id: 1,
      name: "Garden Bed A",
      isActive: true,
      moistureLevel: 45,
      waterUsage: 2.5,
      schedule: "6:00 AM",
      plantType: "Vegetables",
    },
    {
      id: 2,
      name: "Lawn Area",
      isActive: false,
      moistureLevel: 68,
      waterUsage: 8.2,
      schedule: "7:00 AM",
      plantType: "Grass",
    },
    {
      id: 3,
      name: "Flower Garden",
      isActive: true,
      moistureLevel: 52,
      waterUsage: 1.8,
      schedule: "6:30 AM",
      plantType: "Flowers",
    },
    {
      id: 4,
      name: "Herb Garden",
      isActive: false,
      moistureLevel: 71,
      waterUsage: 1.2,
      schedule: "8:00 AM",
      plantType: "Herbs",
    },
  ]);

  const [weatherData, setWeatherData] = useState<WeatherData>({
    condition: "Sunny",
    temperature: 28,
    humidity: 60,
    rainfall: 0,
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(true);
  const [waterSaving, setWaterSaving] = useState(true);
  const [systemStatus, setSystemStatus] = useState<"active" | "idle" | "error">(
    "active"
  );
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Simulate real-time sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      const newData: SensorData = {
        soilMoisture: Math.max(20, Math.min(100, 40 + Math.random() * 40)),
        temperature: parseFloat((24 + Math.random() * 8).toFixed(1)),
        humidity: Math.floor(50 + Math.random() * 30),
        lightLevel: Math.floor(60 + Math.random() * 40),
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString(),
      };

      setCurrentData(newData);
      setDataHistory((prev) => [...prev.slice(-19), newData]);

      // Update zones with slight variations
      setZones((prev) =>
        prev.map((zone) => ({
          ...zone,
          moistureLevel: Math.max(
            20,
            Math.min(100, zone.moistureLevel + (Math.random() - 0.5) * 5)
          ),
        }))
      );

      // Auto irrigation logic
      if (autoMode) {
        zones.forEach((zone) => {
          if (zone.moistureLevel < 30 && !zone.isActive) {
            toggleZone(zone.id);
            showNotification(`🌱 Auto-watering started for ${zone.name}`);
          }
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoMode, zones, showNotification]);

  const toggleZone = (zoneId: number) => {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === zoneId ? { ...zone, isActive: !zone.isActive } : zone
      )
    );

    const zone = zones.find((z) => z.id === zoneId);
    if (zone) {
      const action = zone.isActive ? "stopped" : "started";
      showNotification(`💧 Irrigation ${action} for ${zone.name}`);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "settings":
        showNotification("⚙️ Opening irrigation settings...");
        break;
      case "schedule":
        showNotification("📅 Schedule manager coming soon!");
        break;
      case "weather":
        showNotification("🌤️ Weather forecast updated");
        break;
      default:
        break;
    }
  };

  const getTotalWaterUsage = () => {
    return zones.reduce(
      (total, zone) => total + (zone.isActive ? zone.waterUsage : 0),
      0
    );
  };

  const getActiveZonesCount = () =>
    zones.filter((zone) => zone.isActive).length;

  const getMoistureStatus = (level: number) => {
    if (level < 30) return { status: "low", color: "#ef4444", icon: "🚨" };
    if (level < 60) return { status: "medium", color: "#f59e0b", icon: "⚠️" };
    return { status: "good", color: "#10b981", icon: "✅" };
  };

  const getWeatherIcon = () => {
    switch (weatherData.condition) {
      case "Sunny":
        return "☀️";
      case "Cloudy":
        return "☁️";
      case "Rainy":
        return "🌧️";
      case "Stormy":
        return "⛈️";
      default:
        return "🌤️";
    }
  };

  return (
    <div className={styles.irrigationContainer}>
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

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button className={styles.backButton} onClick={onBack}>
              <span className={styles.backIcon}>←</span>
              <span>Back to Home</span>
            </button>
          )}
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>💧 Smart Irrigation System</h1>
            <p className={styles.pageSubtitle}>
              Intelligent Water Management & Plant Care
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
            title="Schedule Manager"
            onClick={() => handleQuickAction("schedule")}
          >
            📅
          </button>
          <button
            className={styles.actionButton}
            title="Weather Info"
            onClick={() => handleQuickAction("weather")}
          >
            🌤️
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={`${styles.statCard} ${styles.moistureStat}`}>
          <div className={styles.statIcon}>🌱</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Avg Soil Moisture</span>
            <span className={styles.statValue}>
              {Math.round(
                zones.reduce((sum, zone) => sum + zone.moistureLevel, 0) /
                  zones.length
              )}
              %
              <span
                className={styles.statIndicator}
                style={{
                  color: getMoistureStatus(currentData.soilMoisture).color,
                }}
              >
                {getMoistureStatus(currentData.soilMoisture).icon}
              </span>
            </span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.waterStat}`}>
          <div className={styles.statIcon}>💧</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Water Usage</span>
            <span className={styles.statValue}>
              {getTotalWaterUsage().toFixed(1)}L/h
              {waterSaving && <span className={styles.ecoMode}>ECO</span>}
            </span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.weatherStat}`}>
          <div className={styles.statIcon}>{getWeatherIcon()}</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Weather</span>
            <span className={styles.statValue}>
              {weatherData.condition}
              <span className={styles.tempIndicator}>
                {weatherData.temperature}°C
              </span>
            </span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.zonesStat}`}>
          <div className={styles.statIcon}>🏡</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Zones</span>
            <span className={styles.statValue}>
              {getActiveZonesCount()}/{zones.length}
              <span
                className={styles.statusIndicator}
                style={{
                  color: systemStatus === "active" ? "#10b981" : "#f59e0b",
                }}
              >
                {systemStatus === "active" ? "🟢" : "🟡"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Control Modes */}
      <div className={styles.controlModes}>
        <div className={styles.modeCard}>
          <div className={styles.modeInfo}>
            <span className={styles.modeIcon}>🤖</span>
            <div>
              <h3>Auto Mode</h3>
              <p>Smart watering based on soil moisture and weather</p>
            </div>
          </div>
          <label className={styles.modeToggle}>
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
        <div className={styles.modeCard}>
          <div className={styles.modeInfo}>
            <span className={styles.modeIcon}>🌿</span>
            <div>
              <h3>Water Saving</h3>
              <p>Optimize water usage and reduce waste</p>
            </div>
          </div>
          <label className={styles.modeToggle}>
            <input
              type="checkbox"
              checked={waterSaving}
              onChange={(e) => {
                setWaterSaving(e.target.checked);
                showNotification(
                  e.target.checked
                    ? "🌿 Water saving enabled"
                    : "💧 Normal mode enabled"
                );
              }}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Panel: Zone Control */}
        <div className={styles.leftPanel}>
          <div className={styles.zonesCard}>
            <h3 className={styles.cardTitle}>🏡 Irrigation Zones</h3>
            <div className={styles.zonesList}>
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`${styles.zoneItem} ${
                    zone.isActive ? styles.active : ""
                  }`}
                >
                  <div className={styles.zoneHeader}>
                    <div className={styles.zoneInfo}>
                      <h4>{zone.name}</h4>
                      <span className={styles.plantType}>{zone.plantType}</span>
                    </div>
                    <button
                      className={`${styles.zoneToggle} ${
                        zone.isActive ? styles.on : styles.off
                      }`}
                      onClick={() => toggleZone(zone.id)}
                    >
                      {zone.isActive ? "ON" : "OFF"}
                    </button>
                  </div>
                  <div className={styles.zoneStats}>
                    <div className={styles.zoneStat}>
                      <span className={styles.statLabel}>Moisture</span>
                      <span
                        className={styles.statValue}
                        style={{
                          color: getMoistureStatus(zone.moistureLevel).color,
                        }}
                      >
                        {Math.round(zone.moistureLevel)}%
                      </span>
                    </div>
                    <div className={styles.zoneStat}>
                      <span className={styles.statLabel}>Usage</span>
                      <span className={styles.statValue}>
                        {zone.waterUsage}L/h
                      </span>
                    </div>
                    <div className={styles.zoneStat}>
                      <span className={styles.statLabel}>Schedule</span>
                      <span className={styles.statValue}>{zone.schedule}</span>
                    </div>
                  </div>
                  <div className={styles.moistureBar}>
                    <div
                      className={styles.moistureFill}
                      style={{
                        width: `${zone.moistureLevel}%`,
                        backgroundColor: getMoistureStatus(zone.moistureLevel)
                          .color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Monitoring */}
        <div className={styles.rightPanel}>
          <div className={styles.monitoringCard}>
            <h3 className={styles.cardTitle}>📊 Environmental Monitoring</h3>

            {/* Sensor Readings */}
            <div className={styles.sensorGrid}>
              <div className={styles.sensorCard}>
                <div className={styles.sensorIcon}>🌡️</div>
                <div className={styles.sensorData}>
                  <span className={styles.sensorLabel}>Temperature</span>
                  <span className={styles.sensorValue}>
                    {currentData.temperature}°C
                  </span>
                </div>
              </div>
              <div className={styles.sensorCard}>
                <div className={styles.sensorIcon}>💧</div>
                <div className={styles.sensorData}>
                  <span className={styles.sensorLabel}>Humidity</span>
                  <span className={styles.sensorValue}>
                    {currentData.humidity}%
                  </span>
                </div>
              </div>
              <div className={styles.sensorCard}>
                <div className={styles.sensorIcon}>☀️</div>
                <div className={styles.sensorData}>
                  <span className={styles.sensorLabel}>Light Level</span>
                  <span className={styles.sensorValue}>
                    {currentData.lightLevel}%
                  </span>
                </div>
              </div>
              <div className={styles.sensorCard}>
                <div className={styles.sensorIcon}>🌱</div>
                <div className={styles.sensorData}>
                  <span className={styles.sensorLabel}>Soil Moisture</span>
                  <span className={styles.sensorValue}>
                    {Math.round(currentData.soilMoisture)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className={styles.chartContainer}>
              <h4>Soil Moisture Trend</h4>
              <div className={styles.chart}>
                <svg width="100%" height="200" className={styles.chartSvg}>
                  <defs>
                    <linearGradient
                      id="moistureGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[...Array(5)].map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={40 + i * 32}
                      x2="100%"
                      y2={40 + i * 32}
                      stroke="rgba(255,255,255,0.1)"
                      strokeDasharray="2,2"
                    />
                  ))}

                  {/* Data area */}
                  {dataHistory.length > 1 && (
                    <polygon
                      fill="url(#moistureGradient)"
                      points={`0,200 ${dataHistory
                        .map(
                          (d, i) =>
                            `${
                              (i / Math.max(dataHistory.length - 1, 1)) * 100
                            }%,${200 - (d.soilMoisture / 100) * 160}`
                        )
                        .join(" ")} ${
                        ((dataHistory.length - 1) /
                          Math.max(dataHistory.length - 1, 1)) *
                        100
                      }%,200`}
                    />
                  )}

                  {/* Data line */}
                  {dataHistory.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      points={dataHistory
                        .map(
                          (d, i) =>
                            `${
                              (i / Math.max(dataHistory.length - 1, 1)) * 100
                            }%,${200 - (d.soilMoisture / 100) * 160}`
                        )
                        .join(" ")}
                    />
                  )}

                  {/* Data points */}
                  {dataHistory.map((d, i) => (
                    <circle
                      key={i}
                      cx={`${(i / Math.max(dataHistory.length - 1, 1)) * 100}%`}
                      cy={200 - (d.soilMoisture / 100) * 160}
                      r="4"
                      fill="#10b981"
                      className={styles.dataPoint}
                    >
                      <title>{`${d.time}: ${Math.round(
                        d.soilMoisture
                      )}%`}</title>
                    </circle>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationSystem;
