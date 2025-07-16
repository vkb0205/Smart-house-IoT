import React, { useState } from "react";
import styles from "../../styles/BottomNavBar.module.css";

const BottomNavBar = () => {
  const [activeTab, setActiveTab] = useState("Home");

  const navItems = [
    { name: "Home", icon: "🏠" },
    { name: "Libraries", icon: "📚" },
    { name: "AI Assistant", icon: "🤖" },
  ];

  return (
    <div className={styles.bottomNavBar}>
      {navItems.map((item) => (
        <button
          key={item.name}
          className={`${styles.navButton} ${
            activeTab === item.name ? styles.active : ""
          }`}
          onClick={() => setActiveTab(item.name)}
        >
          <span style={{ marginRight: "6px" }}>{item.icon}</span>
          {item.name}
        </button>
      ))}
    </div>
  );
};

export default BottomNavBar;
