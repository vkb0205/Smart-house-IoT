import React from "react";
import styles from "../styles/UniversalNavBar.module.css";

interface UniversalNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onShowNotification?: (message: string) => void;
}

const UniversalNavBar: React.FC<UniversalNavBarProps> = ({
  currentView,
  onNavigate,
  onShowNotification,
}) => {
  const navItems = [
    {
      name: "Home",
      icon: "🏠",
      view: "home",
      description: "Main Dashboard",
    },
    {
      name: "Thermostat",
      icon: "🌡️",
      view: "dashboard",
      description: "Temperature Control",
    },
    {
      name: "Gas Safety",
      icon: "⛽",
      view: "gas",
      description: "Gas Detection",
    },
    {
      name: "Irrigation",
      icon: "💧",
      view: "irrigation",
      description: "Smart Irrigation System",
    },
    {
      name: "Settings",
      icon: "⚙️",
      view: "settings",
      description: "System Settings",
    },
  ];

  const handleNavigation = (item: (typeof navItems)[0]) => {
    if (item.view === "settings") {
      // Show coming soon notification for settings
      const message = `${item.name} feature coming soon!`;
      if (onShowNotification) {
        onShowNotification(message);
      } else {
        alert(message);
      }
      return;
    }
    onNavigate(item.view);
  };

  return (
    <div className={styles.universalNavBar}>
      <div className={styles.navContainer}>
        {navItems.map((item) => (
          <button
            key={item.view}
            className={`${styles.navButton} ${
              currentView === item.view ? styles.active : ""
            } ${item.view === "settings" ? styles.disabled : ""}`}
            onClick={() => handleNavigation(item)}
            title={item.description}
          >
            <div className={styles.navIcon}>{item.icon}</div>
            <span className={styles.navLabel}>{item.name}</span>
            {item.view === "settings" && (
              <div className={styles.comingSoonBadge}>Soon</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UniversalNavBar;
