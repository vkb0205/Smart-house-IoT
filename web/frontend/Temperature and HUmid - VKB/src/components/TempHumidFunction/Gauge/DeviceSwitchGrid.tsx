import React from "react";
import styles from "../../../styles/DeviceSwitchGrid.module.css";

interface Props {
  devices: boolean[];
  onToggle: (index: number) => void;
}

const DeviceSwitchGrid: React.FC<Props> = ({ devices, onToggle }) => {
  const deviceNames = [
    "Air Conditioner",
    "Heater",
    "Fan",
    "Humidifier",
    "Dehumidifier",
    "Air Purifier",
  ];

  return (
    <div className={styles.deviceGrid}>
      <h3 className={styles.gridTitle}>Climate Controls</h3>
      {devices.map((status, i) => (
        <div
          key={i}
          className={`${styles.deviceCard} ${status ? styles.active : ""}`}
        >
          <div className={styles.deviceInfo}>
            <span className={styles.deviceIcon}>
              {i === 0
                ? "❄️"
                : i === 1
                ? "🔥"
                : i === 2
                ? "🌀"
                : i === 3
                ? "💨"
                : i === 4
                ? "🌡️"
                : "🌿"}
            </span>
            <span className={styles.deviceName}>
              {deviceNames[i] || `Device ${i + 1}`}
            </span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={status}
              onChange={() => onToggle(i)}
              className={styles.switchInput}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default DeviceSwitchGrid;
