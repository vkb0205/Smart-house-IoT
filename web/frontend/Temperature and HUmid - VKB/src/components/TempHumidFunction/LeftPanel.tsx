import React from "react";
import styles from "../../styles/LeftPanel.module.css";
import TemperatureGauge from "./Gauge/TemperatureGauge";

interface Props {
  temperature: number;
  desiredTemp: number;
  onTempChange: (temp: number) => void;
}

const LeftPanel: React.FC<Props> = ({
  temperature,
  desiredTemp,
  onTempChange,
}) => {
  return (
    <div className={styles.leftPanel}>
      <TemperatureGauge
        temperature={temperature}
        desiredTemp={desiredTemp}
        onTempChange={onTempChange}
      />
    </div>
  );
};

export default LeftPanel;
