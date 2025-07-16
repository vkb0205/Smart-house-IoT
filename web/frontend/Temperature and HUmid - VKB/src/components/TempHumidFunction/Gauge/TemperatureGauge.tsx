import React from "react";
import styles from "../../../styles/TemperatureGauge.module.css";
import ThermostatSlider from "./ThermoStatSlider";
import ModeButtons from "./ModeButtons";

interface Props {
  temperature: number;
  desiredTemp: number;
  onTempChange: (temp: number) => void;
}

const TemperatureGauge: React.FC<Props> = ({
  temperature,
  desiredTemp,
  onTempChange,
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Entire House</h2>
      <div className={styles.mainContent}>
        <div className={styles.gauge}>
          <span className={styles.tempValue}>{temperature}°C</span>
        </div>
        <div className={styles.sliderContainer}>
          <ThermostatSlider value={desiredTemp} onChange={onTempChange} />
        </div>
      </div>
      <div className={styles.modeButtons}>
        <ModeButtons />
      </div>
    </div>
  );
};

export default TemperatureGauge;
