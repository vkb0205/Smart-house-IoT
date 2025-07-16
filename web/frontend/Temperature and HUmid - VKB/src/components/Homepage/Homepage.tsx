import React, { useState } from "react";
import styles from "../../styles/Homepage.module.css";
import Dashboard from "../TempHumidFunction/Dashboard";
import GasDetection from "../GasDetection/GasDetection";
import IrrigationSystem from "../IrrigationSystem/IrrigationSystem";
import UniversalNavBar from "../UniversalNavBar";

interface HomepageProps {
  onNavigate?: (page: string) => void;
}

const Homepage: React.FC<HomepageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("Monitoring");
  const [currentView, setCurrentView] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "home":
        setCurrentView("home");
        break;
      case "profile":
        showNotification("Profile settings coming soon!");
        break;
      case "settings":
        showNotification("System settings coming soon!");
        break;
      default:
        break;
    }
  };

  // If user navigated to dashboard, show the Dashboard component
  if (currentView === "dashboard") {
    return (
      <>
        <Dashboard onBack={() => setCurrentView("home")} />
        <UniversalNavBar
          currentView={currentView}
          onNavigate={(view: string) => {
            setCurrentView(view);
          }}
          onShowNotification={showNotification}
        />
      </>
    );
  }

  // If user navigated to gas detection, show the GasDetection component
  if (currentView === "gas") {
    return (
      <>
        <GasDetection onBack={() => setCurrentView("home")} />
        <UniversalNavBar
          currentView={currentView}
          onNavigate={(view: string) => {
            setCurrentView(view);
          }}
          onShowNotification={showNotification}
        />
      </>
    );
  }

  // If user navigated to irrigation system, show the IrrigationSystem component
  if (currentView === "irrigation") {
    return (
      <>
        <IrrigationSystem onBack={() => setCurrentView("home")} />
        <UniversalNavBar
          currentView={currentView}
          onNavigate={(view: string) => {
            setCurrentView(view);
          }}
          onShowNotification={showNotification}
        />
      </>
    );
  }

  const systemCards = [
    {
      title: "Smart Thermostat",
      description: "Control temperature and climate",
      temperature: "23°C",
      icon: "🌡️",
      status: "active",
    },
    {
      title: "Irrigation System",
      description: "Automated garden watering",
      moisture: "36%",
      icon: "💧",
      status: "idle",
    },
    {
      title: "Gas Detection",
      description: "Safety monitoring system",
      level: "560 ppm",
      icon: "🛡️",
      status: "normal",
    },
    {
      title: "Security System",
      description: "Home protection & monitoring",
      devices: "4 active",
      icon: "🔒",
      status: "armed",
    },
  ];

  const quickStats = [
    { label: "Temperature", value: "23°C", icon: "🌡️" },
    { label: "Humidity", value: "48%", icon: "💧" },
    { label: "Air Quality", value: "Good", icon: "🌿" },
    { label: "Security", value: "Armed", icon: "🔒" },
  ];

  return (
    <div className={styles.homepage}>
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
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search devices, rooms, or settings..."
            className={styles.searchBar}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.actionButton}
            onClick={() => handleQuickAction("home")}
            title="Home"
          >
            🏠
          </button>
          <button
            className={styles.actionButton}
            onClick={() => handleQuickAction("profile")}
            title="Profile"
          >
            👤
          </button>
          <button
            className={styles.actionButton}
            onClick={() => handleQuickAction("settings")}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.navigationTabs}>
        {["Monitoring", "Irrigation System", "Gas Detection System"].map(
          (tab) => (
            <button
              key={tab}
              className={`${styles.navTab} ${
                activeTab === tab ? styles.active : ""
              }`}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== "Monitoring") {
                  showNotification(`${tab} dashboard coming soon!`);
                }
              }}
            >
              {tab}
              {tab === "Monitoring" && (
                <span className={styles.tabBadge}>Active</span>
              )}
              {tab !== "Monitoring" && (
                <span className={styles.tabBadge}>Soon</span>
              )}
            </button>
          )
        )}
      </nav>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Current Weather/Status */}
        <div className={styles.weatherSection}>
          <div className={styles.weatherIcon}>🌤️</div>
          <div className={styles.weatherInfo}>
            <h1 className={styles.temperature}>23°C</h1>
            <div className={styles.dateInfo}>
              <h2>Thursday</h2>
              <p>July 10, 2025</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          {quickStats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statInfo}>
                <h3>{stat.label}</h3>
                <p>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* System Cards */}
        <div className={styles.systemGrid}>
          {systemCards.map((system, index) => (
            <div
              key={index}
              className={`${styles.systemCard} ${
                system.title === "Smart Thermostat" ||
                system.title === "Gas Detection" ||
                system.title === "Irrigation System"
                  ? styles.clickable
                  : styles.comingSoon
              }`}
              onClick={() => {
                if (system.title === "Smart Thermostat") {
                  setCurrentView("dashboard");
                } else if (system.title === "Gas Detection") {
                  setCurrentView("gas");
                } else if (system.title === "Irrigation System") {
                  setCurrentView("irrigation");
                } else {
                  // Show coming soon notification
                  showNotification(`${system.title} feature coming soon!`);
                }
              }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{system.icon}</span>
                <span
                  className={`${styles.status} ${styles[system.status]}`}
                ></span>
              </div>
              <h3 className={styles.cardTitle}>{system.title}</h3>
              <p className={styles.cardDescription}>{system.description}</p>
              <div className={styles.cardValue}>
                {system.temperature ||
                  system.moisture ||
                  system.level ||
                  system.devices}
              </div>
              {(system.title === "Smart Thermostat" ||
                system.title === "Gas Detection" ||
                system.title === "Irrigation System") && (
                <div className={styles.actionIndicator}>
                  <span>Click to control →</span>
                </div>
              )}
              {system.title !== "Smart Thermostat" &&
                system.title !== "Gas Detection" &&
                system.title !== "Irrigation System" && (
                  <div className={styles.comingSoonIndicator}>
                    <span>Coming Soon</span>
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className={styles.chartSection}>
          <h3>System Performance</h3>
          <div className={styles.chartPlaceholder}>
            <svg className={styles.chartSvg} viewBox="0 0 800 200">
              <path
                d="M 50 150 Q 150 100 250 120 T 450 110 T 650 130 T 750 120"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="150" cy="100" r="4" fill="white" />
              <circle cx="350" cy="110" r="4" fill="white" />
              <circle cx="550" cy="130" r="4" fill="white" />
              <circle cx="750" cy="120" r="4" fill="white" />
            </svg>
            <div className={styles.chartLabels}>
              <span>6</span>
              <span>12</span>
              <span>18</span>
              <span>24</span>
              <span>30</span>
              <span>36</span>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={styles.notificationToast}>{notification}</div>
        )}
      </div>

      {/* Universal Navigation Bar */}
      <UniversalNavBar
        currentView={currentView}
        onNavigate={(view: string) => {
          setCurrentView(view);
        }}
        onShowNotification={showNotification}
      />
    </div>
  );
};

export default Homepage;
