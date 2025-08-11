import React, { useState, useEffect, useCallback } from "react";
import styles from "../../styles/IrrigationSystem.module.css";
import styles1 from "../../styles/GasDetection.module.css";
import { getDatabase, onValue, ref, get, set } from "firebase/database";
import { initializeApp } from "firebase/app";
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
interface IrrigationSystemProps {
  onBack?: () => void;
}

interface SensorData {
  soil: boolean;
  temperature: number;
  humidity: number;
  // lightLevel: number;
  timestamp: number;
  time: string;
}

interface Zone {
  id: number;
  name: string;
  isActive: boolean;
  moistureLevel: number;
  // waterUsage: number;
  threshold: number;
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
    soil: false,
    temperature: 0,
    humidity: 0,
    // lightLevel: 0,
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString(),
  });

  
  const [zones, setZones] = useState<Zone[]>([
    {
      id: 1,
      name: "Garden Bed A",
      isActive: true,
      moistureLevel: 30,
      // waterUsage: 2.5,
      threshold: 0,
      schedule: "6:00 AM",
      plantType: "Vegetables",
    },
    {
      id: 2,
      name: "Lawn Area",
      isActive: false,
      moistureLevel: 20,
      // waterUsage: 8.2,
      threshold: 0,
      schedule: "7:00 AM",
      plantType: "Grass",
    },
    {
      id: 3,
      name: "Flower Garden",
      isActive: true,
      moistureLevel: 50,
      // waterUsage: 1.8,
      threshold: 0,
      schedule: "6:30 AM",
      plantType: "Flowers",
    },
    {
      id: 4,
      name: "Herb Garden",
      isActive: false,
      moistureLevel: 40,
      // waterUsage: 1.2,
      threshold: 0,
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
  // const [warningThreshold, setWarningThreshold] = useState(() => {
  //   return parseInt(localStorage.getItem("Threshold") || "50");
  // });
  const [notification, setNotification] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(true);
  const [waterSaving, setWaterSaving] = useState(true);
  const [systemStatus, setSystemStatus] = useState<"active" | "idle" | "error">(
    "active"
  );
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Simulate real-time sensor data
  useEffect(() => {
    console.log("🔥 Dashboard connecting to Firebase for real sensor data...");
    const sensorRef = ref(db, "sensors/current");
    const interval = setInterval(() => {
      get(sensorRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const firebaseData = snapshot.val();
            console.log("📊 Sensor data fetched:", firebaseData);
            updateUIWithFirebaseData(firebaseData);
          }
          else {
            console.warn("⚠️ No sensor data found in Firebase");
            setIsConnected(false);
            showNotification("⚠️ No real-time sensor data available");
          }
          })
        .catch((error) => {
          console.error("❌ Firebase fetch error on sensor:", error);
          setIsConnected(false);
          showNotification("⚠️ Could not fetch sensor data from Firebase");
        });
      
      

      // setCurrentData(newData);
      // setDataHistory((prev) => [...prev.slice(-19), newData]);

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
          if (zone.moistureLevel < zone.threshold && !zone.isActive) {
            toggleZone(zone.id);
            showNotification(`🌱 Auto-watering started for ${zone.name}`);
          }
        });
        zones.forEach((zone) => {
          if (zone.moistureLevel > zone.threshold && zone.isActive) {
            toggleZone(zone.id);
            showNotification(`🌱 Auto-watering started for ${zone.name}`);
          }
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoMode, zones, showNotification]);
const updateUIWithFirebaseData = (firebaseData: any) => {
    console.log(
      "🔄 Processing REAL-TIME Firebase data structure:",
      Object.keys(firebaseData)
    );
    console.log("🔄 Raw REAL-TIME Firebase data:", firebaseData);
    // Debug: Show all possible gas-related fields
    console.log("🔍 Checking all gas-related fields:");
    console.log("  gas-value:", firebaseData["gas-value"]);
    console.log("  gasValue:", firebaseData.gasValue);
    console.log("  gasLevel:", firebaseData.gasLevel);
    console.log("  gas_value:", firebaseData.gas_value);
    console.log("  gas:", firebaseData.gas);
    // Check data source priority
    const isRealTimeSource = firebaseData["gas-value"] !== undefined;
    const isBackupSource =
      firebaseData.gasLevel !== undefined && !isRealTimeSource;
    console.log("🎯 Data source analysis:");
    console.log("  Is real-time source (has gas-value):", isRealTimeSource);
    console.log("  Is backup source (has gasLevel only):", isBackupSource);
//     if (isBackupSource) {

//       console.log("⏭️ SKIPPING backup source - we prioritize real-time data");

//       return; // Skip processing old data structure

//     }



    const now = Date.now();

    const timeStamp = new Date().toLocaleTimeString();



    // Extract data from different possible Firebase structures

    let gasLevel, temperature, humidity, soil;



    // Handle different data structures - prioritize gas-value field

    if (firebaseData["gasLevel"] !== undefined) {
      gasLevel = parseFloat(firebaseData["gasLevel"]);
      console.log(
        "✅ Found gas-value field:",
        firebaseData["gasLevel"],
        "-> parsed:",
        gasLevel
      );
    } else if (firebaseData.gasLevel !== undefined) {
      gasLevel = parseFloat(firebaseData.gasLevel);
      console.log(
        "✅ Found gasLevel field:",
        firebaseData.gasLevel,
        "-> parsed:",
        gasLevel
      );
    } else if (firebaseData.gas !== undefined) {
      gasLevel = parseFloat(firebaseData.gas);
      console.log(
        "✅ Found gas field:",
        firebaseData.gas,
        "-> parsed:",
        gasLevel
      );
    } else if (firebaseData.gasValue !== undefined) {
      gasLevel = parseFloat(firebaseData.gasValue);
      console.log(
        "✅ Found gasValue field:",
        firebaseData.gasValue,
        "-> parsed:",
        gasLevel
      );
    } else if (firebaseData.gasLevel !== undefined) {
      gasLevel = parseFloat(firebaseData.gasLevel);
      console.log(
        "✅ Found gasLevel field:",
        firebaseData.gasLevel,
        "-> parsed:",
        gasLevel
      );
    } else {
      console.warn(
        "⚠️ Gas level not found in Firebase data - available fields:",
        Object.keys(firebaseData)
      );
      gasLevel = 0;
    }

    if (firebaseData.temperature !== undefined) {
      temperature = parseFloat(firebaseData.temperature);
      console.log(
        "✅ Found temperature field:",
        firebaseData.temperature,
        "-> parsed:",
        temperature
      );
    } else {
      console.warn("⚠️ Temperature not found in Firebase data");
      temperature = 0;
    }

    if (firebaseData.humidity !== undefined) {
      humidity = parseFloat(firebaseData.humidity);
      console.log(
        "✅ Found humidity field:",
        firebaseData.humidity,
        "-> parsed:",
        humidity
      );
    } else {
      console.warn("⚠️ Humidity not found in Firebase data");
      humidity = 0;
    }

    if (firebaseData.soil !== undefined) {
      soil = parseFloat(firebaseData.soil);
      console.log(
        "✅ Found soil field:",
        firebaseData.soil,
        "-> parsed:",
        soil
      );
    } else {
      console.warn("⚠️ soil not found in Firebase data");
      soil = 0;
    }
    console.log(
      "📈 Extracted REAL-TIME values - Gas:",
      gasLevel,
      "ppm, Temp:",
      temperature,
      "°C, Humidity:",
      humidity,
      "%, Soil Moisture:",
      soil,
      "%"
    );

    // Extra validation to ensure we're using the right gas value

    if (

      firebaseData["gas-value"] &&

      gasLevel !== parseFloat(firebaseData["gas-value"])

    ) {

      console.error(

        "❌ Gas level mismatch! Expected:",

        firebaseData["gas-value"],

        "Got:",

        gasLevel

      );

      gasLevel = parseFloat(firebaseData["gas-value"]); // Force correct value

      console.log("🔧 Corrected gas level to:", gasLevel);

    }



    // If this Firebase data doesn't have gas-value but we've seen it before, ignore old data

    if (!firebaseData["gasLevel"] && firebaseData.gasLevel !== undefined) {

      console.warn("⚠️ Ignoring old data structure without gas-value field");

      console.warn(

        "   This data has gasLevel:",

        firebaseData.gasLevel,

        "but we want gas-value"

      );

      return; // Skip this update

    }



    // Validate the extracted data

    if (gasLevel === 0 && temperature === 0 && humidity === 0) {

      console.error(

        "❌ All sensor values are 0 - this might be dummy data or extraction failed"

      );

      showNotification("⚠️ Received invalid sensor data from Firebase");

      return;

    }


    // Update states with real Firebase data
    const fullData: SensorData = {
      temperature: temperature,
      humidity: humidity,
      soil: soil > 0 ? true : false, // Convert soil moisture to boolean
      time: timeStamp,
//       lightLevel: Math.round(Math.random() * 100), // Simulate light level
      timestamp: now,
    };
    setCurrentData(fullData);
    // Create environment data for history
    // const newData: SensorData = {
    //   soil: soil > 0 ? true : false, // Convert soil moisture to boolean
    //   temperature: temp || temperature,
    //   humidity: humid || humidity,
    //   safety: gasValue ? Math.max(0, 100 - gasValue) : safety,
    //   timestamp: Date.now(),
    //   airQuality:
    //     gasValue && gasValue > 50
    //       ? "Poor"
    //       : gasValue && gasValue > 30
    //       ? "Moderate"
    //       : "Good",
    //   powerUsage: parseFloat((0.5 + Math.random() * 2).toFixed(1)), // Keep simulated for now
    // };

    setIsConnected(true);
    // setLastUpdate(new Date().toLocaleTimeString());

    // Auto temperature adjustment with real data
    // if (autoMode && temperature) {
    //   const tempDiff = Math.abs(temperature - desiredTemp);
    //   if (tempDiff > 2) {
    //     showNotification(
    //       `🤖 Auto-adjusting climate system (${tempDiff.toFixed(
    //         1
    //       )}°C difference)`
    //     );
    //   }
    // }
  };

  const handleThresholdChange = (zoneId: number, newThreshold: number) => {
    const updatedThreshold = isNaN(newThreshold) ? 0 : newThreshold;

    setZones(currentZones => 
      currentZones.map(zone => 
        zone.id === zoneId 
          ? { ...zone, threshold: updatedThreshold }
          : zone
      )
    );
  };
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

  // const getTotalWaterUsage = () => {
  //   return zones.reduce(
  //     (total, zone) => total + (zone.isActive ? zone.waterUsage : 0),
  //     0
  //   );
  // };

  const getActiveZonesCount = () =>
    zones.filter((zone) => zone.isActive).length;

  const getMoistureStatus = (level: boolean) => {
    if (level == true) return { status: "low", color: "#ef4444", icon: "🚨" };
    // if (level < 60) return { status: "medium", color: "#f59e0b", icon: "⚠️" };
    return { status: "good", color: "#10b981", icon: "✅" };
  };

  const getWeatherIcon = (temp:number) => {
    if (temp >= 32) return "☀️";
    if (temp <32 && temp >= 27) return "☁️";
    if (temp <27 && temp >=23)  return "🌧️";
    if (temp < 23 && temp >= 20) return "⛈️";
  };
  const getWeatherCondition = (temp: number) => {
    if (temp >= 32) return "Sunny";
    if (temp < 32 && temp >= 27) return "Cloudy";
    if (temp < 27 && temp >= 23) return "Rainy";
    if (temp < 23 && temp >= 20) return "Stormy";
    return "Unknown";
  }
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
                  color: getMoistureStatus(currentData.soil).color,
                }}
              >
                {getMoistureStatus(currentData.soil).icon}
              </span>
            </span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.waterStat}`}>
          <div className={styles.statIcon}>💧</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Water Usage</span>
            {/* <span className={styles.statValue}>
              {getTotalWaterUsage().toFixed(1)}L/h
              {waterSaving && <span className={styles.ecoMode}>ECO</span>}
            </span> */}
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.weatherStat}`}>
          <div className={styles.statIcon}>{getWeatherIcon(currentData.temperature)}</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Weather</span>
            <span className={styles.statValue}>
              {getWeatherCondition(currentData.temperature)}
              <span className={styles.tempIndicator}>
                {currentData.temperature}°C
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
                    <div className={styles1.thresholdControl}>
                      <div className={styles1.formcontrol}>
                        <label className={styles1.controlLabel}>
                          <span className={styles1.labelIcon}></span>
                          Threshold (%)
                        </label>
                        <input
                          type="number"
                          value={zone.threshold} 
                          onChange={(e) =>
                            handleThresholdChange(zone.id, parseInt(e.target.value))
                          }
                          className={styles1.thresholdInput}
                          min="10"
                          max="100" 
                        />
                      </div>
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
                          color: getMoistureStatus(zone.moistureLevel>50 ? true:false).color,
                        }}
                      >
                        {Math.round(zone.moistureLevel)}%
                      </span>
                    </div>
                    <div className={styles.zoneStat}>
                      <span className={styles.statLabel}>Usage</span>
                      {/* <span className={styles.statValue}>
                        {zone.waterUsage}L/h
                      </span> */}
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
                        backgroundColor: getMoistureStatus(zone.moistureLevel>50? true:false)
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
                  {/* <span className={styles.sensorValue}>
                    {currentData.lightLevel}%
                  </span> */}
                </div>
              </div>
              <div className={styles.sensorCard}>
                <div className={styles.sensorIcon}>🌱</div>
                <div className={styles.sensorData}>
                  <span className={styles.sensorLabel}>Soil Moisture</span>
                  <span className={styles.sensorValue}>
                    {Math.round(currentData.soil==true?80:20)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationSystem;
