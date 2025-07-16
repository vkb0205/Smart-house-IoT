import React from "react";
import styles from "../../styles/RightPanel.module.css";
import WeeklyChart from "./Gauge/WeeklyChart";
import DeviceSwitchGrid from "./Gauge/DeviceSwitchGrid";
import SafetyHumidity from "./Gauge/SafetyHumidity";

interface RightPanelProps {
  safety: number;
  humidity: number;
  devices: boolean[];
  onToggle: (index: number) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  safety,
  humidity,
  devices,
  onToggle,
}) => {
  return (
    <div className={styles.RightPanel}>
      <div className={styles.graph}>
        <WeeklyChart />
      </div>
      <div className={styles.safetyStat}>
        <SafetyHumidity safety={safety} humidity={humidity} />
      </div>
      <div className={styles.devicesToggle}>
        <DeviceSwitchGrid devices={devices} onToggle={onToggle} />
      </div>
    </div>
  );
};

export default RightPanel;
