import React, { useState, useEffect, useCallback } from "react";
import styles from "../../styles/GasDetection.module.css";

interface GasDetectionProps {
  onBack?: () => void;
}

interface GasData {
  gasLevel: number;
  temperature: number;
  humidity: number;
  time: string;
  timestamp: number;
}

interface SystemStatus {
  isCalibrating: boolean;
  isConnected: boolean;
  lastUpdate: number;
  alertActive: boolean;
}

const GasDetection: React.FC<GasDetectionProps> = ({ onBack }) => {
  const [data, setData] = useState<GasData>({
    gasLevel: 0,
    temperature: 22.5,
    humidity: 45,
    time: new Date().toLocaleTimeString(),
    timestamp: Date.now(),
  });

  const [warningThreshold, setWarningThreshold] = useState(() => {
    return parseInt(localStorage.getItem("gasWarningThreshold") || "50");
  });

  const [criticalThreshold, setCriticalThreshold] = useState(() => {
    return parseInt(localStorage.getItem("gasCriticalThreshold") || "80");
  });

  const [history, setHistory] = useState<GasData[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isCalibrating: false,
    isConnected: true,
    lastUpdate: Date.now(),
    alertActive: false,
  });

  const [settings, setSettings] = useState({
    alertSound: true,
    autoRefresh: true,
    refreshInterval: 3000,
    dataRetention: 100, // number of points to keep
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "5min" | "15min" | "30min" | "1hour"
  >("15min");

  const getStatus = useCallback(() => {
    if (data.gasLevel >= criticalThreshold) return "critical";
    if (data.gasLevel >= warningThreshold) return "warning";
    return "safe";
  }, [data.gasLevel, warningThreshold, criticalThreshold]);

  const status = getStatus();

  // Mock data function - replace with real ESP32 data fetching
  const mockGasData = (): Omit<GasData, "time" | "timestamp"> => ({
    gasLevel: Math.floor(Math.random() * 100),
    temperature: parseFloat((20 + Math.random() * 15).toFixed(1)),
    humidity: parseFloat((40 + Math.random() * 20).toFixed(1)),
  });

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const playAlertSound = useCallback(() => {
    if (!settings.alertSound) return;

    try {
      const context = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = status === "critical" ? 1000 : 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        context.currentTime + 0.5
      );

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.log("Audio context not available");
    }
  }, [settings.alertSound, status]);

  const handleCalibration = useCallback(() => {
    setSystemStatus((prev) => ({ ...prev, isCalibrating: true }));
    showNotification("🔧 Starting sensor calibration...");

    setTimeout(() => {
      setSystemStatus((prev) => ({ ...prev, isCalibrating: false }));
      showNotification("✅ Sensor calibration completed successfully!");
    }, 3000);
  }, [showNotification]);

  // Real-time data simulation
  useEffect(() => {
    if (!settings.autoRefresh) return;

    const interval = setInterval(() => {
      const newData = mockGasData();
      const now = Date.now();
      const timeStamp = new Date().toLocaleTimeString();
      const fullData = { ...newData, time: timeStamp, timestamp: now };

      setData(fullData);
      setHistory((prev) => {
        const updated = [...prev, fullData];
        return updated.slice(-settings.dataRetention);
      });

      setSystemStatus((prev) => ({ ...prev, lastUpdate: now }));
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval, settings.dataRetention]);

  // Save thresholds to localStorage
  useEffect(() => {
    localStorage.setItem("gasWarningThreshold", warningThreshold.toString());
    localStorage.setItem("gasCriticalThreshold", criticalThreshold.toString());
  }, [warningThreshold, criticalThreshold]);

  // Alert handling
  useEffect(() => {
    const isAlert = status === "warning" || status === "critical";

    if (isAlert && !systemStatus.alertActive) {
      const message =
        status === "critical"
          ? `🚨 CRITICAL GAS LEVEL: ${data.gasLevel} ppm!`
          : `⚠️ High gas level detected: ${data.gasLevel} ppm`;

      showNotification(message);
      playAlertSound();
      setSystemStatus((prev) => ({ ...prev, alertActive: true }));
    } else if (!isAlert && systemStatus.alertActive) {
      setSystemStatus((prev) => ({ ...prev, alertActive: false }));
    }
  }, [
    status,
    data.gasLevel,
    systemStatus.alertActive,
    showNotification,
    playAlertSound,
  ]);

  const getStatusColor = () => {
    switch (status) {
      case "critical":
        return "#dc2626";
      case "warning":
        return "#f59e0b";
      default:
        return "#10b981";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "critical":
        return "🚨";
      case "warning":
        return "⚠️";
      default:
        return "✅";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "critical":
        return "CRITICAL";
      case "warning":
        return "WARNING";
      default:
        return "SAFE";
    }
  };

  const getSystemStatusText = () => {
    if (systemStatus.isCalibrating) return "CALIBRATING SENSORS";
    if (!systemStatus.isConnected) return "DISCONNECTED";

    switch (status) {
      case "critical":
        return "CRITICAL GAS DETECTED";
      case "warning":
        return "HIGH GAS LEVEL";
      default:
        return "NORMAL OPERATION";
    }
  };

  return (
    <div className={styles.gasContainer}>
      {/* Notification */}
      {notification && (
        <div
          className={`${styles.notification} ${
            status === "critical" ? styles.danger : ""
          }`}
        >
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
            <h1 className={styles.pageTitle}>🛡️ Gas Detection System</h1>
            <p className={styles.pageSubtitle}>
              Real-time Gas Monitoring & Safety Alert
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.actionButton}
            title="Settings"
            onClick={() => showNotification("Settings panel coming soon!")}
          >
            ⚙️
          </button>
          <button
            className={styles.actionButton}
            title="Calibrate Sensor"
            onClick={handleCalibration}
            disabled={systemStatus.isCalibrating}
          >
            {systemStatus.isCalibrating ? "⏳" : "🔧"}
          </button>
          <button
            className={styles.actionButton}
            title="View History"
            onClick={() => showNotification("History view coming soon!")}
          >
            📊
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div
          className={`${styles.statCard} ${
            status !== "safe" ? styles[status] : ""
          }`}
        >
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Gas Level</span>
            <span className={styles.statValue}>{data.gasLevel} ppm</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌡️</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Temperature</span>
            <span className={styles.statValue}>{data.temperature}°C</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💧</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Humidity</span>
            <span className={styles.statValue}>{data.humidity}%</span>
          </div>
        </div>
        <div
          className={`${styles.statCard} ${
            status !== "safe" ? styles[status] : styles.safe
          }`}
        >
          <div className={styles.statIcon}>{getStatusIcon()}</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Status</span>
            <span
              className={styles.statValue}
              style={{ color: getStatusColor() }}
            >
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Panel: Controls */}
        <div className={styles.leftPanel}>
          <div className={styles.controlCard}>
            <h3 className={styles.cardTitle}>⚙️ System Controls</h3>

            <div className={styles.thresholdControl}>
              <label className={styles.controlLabel}>
                <span className={styles.labelIcon}>⚠️</span>
                Warning Threshold (ppm)
              </label>
              <input
                type="number"
                value={warningThreshold}
                onChange={(e) =>
                  setWarningThreshold(parseInt(e.target.value) || 50)
                }
                className={styles.thresholdInput}
                min="10"
                max="200"
              />
            </div>

            <div className={styles.thresholdControl}>
              <label className={styles.controlLabel}>
                <span className={styles.labelIcon}>🚨</span>
                Critical Threshold (ppm)
              </label>
              <input
                type="number"
                value={criticalThreshold}
                onChange={(e) =>
                  setCriticalThreshold(parseInt(e.target.value) || 80)
                }
                className={styles.thresholdInput}
                min="50"
                max="300"
              />
            </div>

            <div className={styles.statusIndicator}>
              <div
                className={styles.statusLight}
                style={{ backgroundColor: getStatusColor() }}
              ></div>
              <span className={styles.statusText}>
                System Status:{" "}
                <strong style={{ color: getStatusColor() }}>
                  {getSystemStatusText()}
                </strong>
              </span>
            </div>
          </div>

          <div className={styles.controlCard}>
            <h3 className={styles.cardTitle}>📊 Recent Readings</h3>
            <div className={styles.recentReadings}>
              {history
                .slice(-5)
                .reverse()
                .map((reading, index) => (
                  <div
                    key={reading.timestamp || index}
                    className={styles.reading}
                  >
                    <span className={styles.readingTime}>{reading.time}</span>
                    <span className={styles.readingValue}>
                      {reading.gasLevel} ppm
                    </span>
                    <span className={`${styles.readingStatus}`}>
                      {reading.gasLevel >= criticalThreshold
                        ? "🚨"
                        : reading.gasLevel >= warningThreshold
                        ? "⚠️"
                        : "✅"}
                    </span>
                  </div>
                ))}
              {history.length === 0 && (
                <div className={styles.reading}>
                  <span className={styles.readingTime}>No data</span>
                  <span className={styles.readingValue}>-- ppm</span>
                  <span className={styles.readingStatus}>⏳</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.controlCard}>
            <h3 className={styles.cardTitle}>🔧 Settings</h3>
            <div className={styles.thresholdControl}>
              <label className={styles.controlLabel}>
                <span className={styles.labelIcon}>🔊</span>
                Alert Sound
                <input
                  type="checkbox"
                  checked={settings.alertSound}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      alertSound: e.target.checked,
                    }))
                  }
                  style={{ marginLeft: "auto" }}
                />
              </label>
            </div>
            <div className={styles.thresholdControl}>
              <label className={styles.controlLabel}>
                <span className={styles.labelIcon}>🔄</span>
                Auto Refresh
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoRefresh: e.target.checked,
                    }))
                  }
                  style={{ marginLeft: "auto" }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Panel: Chart */}
        <div className={styles.rightPanel}>
          <div className={styles.chartCard}>
            <div className={styles.chartCardContent}>
              <h3 className={styles.cardTitle}>📈 Gas Level History</h3>

              {/* Time Range Selector */}
              <div
                style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
              >
                {(["5min", "15min", "30min", "1hour"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    style={{
                      padding: "0.5rem 1rem",
                      background:
                        selectedTimeRange === range
                          ? "#3b82f6"
                          : "rgba(255,255,255,0.1)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <div className={styles.chartContainer}>
                <div className={styles.chart}>
                  <svg width="100%" height="300" className={styles.chartSvg}>
                    <defs>
                      <linearGradient
                        id="gasGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor={getStatusColor()}
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor={getStatusColor()}
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                      <linearGradient
                        id="warningGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#f59e0b"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#f59e0b"
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[...Array(6)].map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={50 + i * 40}
                        x2="100%"
                        y2={50 + i * 40}
                        stroke="rgba(255,255,255,0.1)"
                        strokeDasharray="2,2"
                      />
                    ))}

                    {/* Critical threshold line */}
                    <line
                      x1="0"
                      y1={300 - (criticalThreshold / 100) * 200}
                      x2="100%"
                      y2={300 - (criticalThreshold / 100) * 200}
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />

                    {/* Warning threshold line */}
                    <line
                      x1="0"
                      y1={300 - (warningThreshold / 100) * 200}
                      x2="100%"
                      y2={300 - (warningThreshold / 100) * 200}
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />

                    {/* Data area */}
                    {history.length > 1 && (
                      <polygon
                        fill="url(#gasGradient)"
                        points={`0,300 ${history
                          .map(
                            (d, i) =>
                              `${
                                (i / Math.max(history.length - 1, 1)) * 100
                              }%,${300 - (d.gasLevel / 100) * 200}`
                          )
                          .join(" ")} ${
                          ((history.length - 1) /
                            Math.max(history.length - 1, 1)) *
                          100
                        }%,300`}
                      />
                    )}

                    {/* Data line */}
                    {history.length > 1 && (
                      <polyline
                        fill="none"
                        stroke={getStatusColor()}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={history
                          .map(
                            (d, i) =>
                              `${
                                (i / Math.max(history.length - 1, 1)) * 100
                              }%,${300 - (d.gasLevel / 100) * 200}`
                          )
                          .join(" ")}
                      />
                    )}

                    {/* Data points */}
                    {history.map((d, i) => (
                      <circle
                        key={i}
                        cx={`${(i / Math.max(history.length - 1, 1)) * 100}%`}
                        cy={300 - (d.gasLevel / 100) * 200}
                        r="4"
                        fill={
                          d.gasLevel >= criticalThreshold
                            ? "#dc2626"
                            : d.gasLevel >= warningThreshold
                            ? "#f59e0b"
                            : "#10b981"
                        }
                        className={styles.dataPoint}
                        style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
                      >
                        <title>{`${d.time}: ${d.gasLevel} ppm`}</title>
                      </circle>
                    ))}

                    {/* Current value indicator */}
                    {history.length > 0 && (
                      <circle
                        cx="100%"
                        cy={300 - (data.gasLevel / 100) * 200}
                        r="6"
                        fill={getStatusColor()}
                        stroke="white"
                        strokeWidth="2"
                        className={styles.dataPoint}
                        style={{
                          filter: "drop-shadow(0 0 8px currentColor)",
                          animation: "pulse 2s ease-in-out infinite",
                        }}
                      />
                    )}
                  </svg>
                </div>
                <div className={styles.chartLabels}>
                  <span>0 ppm</span>
                  <span>{warningThreshold} ppm</span>
                  <span>{criticalThreshold} ppm</span>
                  <span>100 ppm</span>
                </div>
              </div>

              {/* Chart Info */}
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "0.75rem",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Last update: {data.time}</span>
                  <span>Data points: {history.length}</span>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <span>🟢 Safe: &lt; {warningThreshold} ppm</span>
                  <span>
                    🟡 Warning: {warningThreshold}-{criticalThreshold} ppm
                  </span>
                  <span>🔴 Critical: &gt; {criticalThreshold} ppm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasDetection;
