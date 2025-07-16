import React from "react";
import styles from "../../../styles/ThermostatSlider.module.css";

interface Props {
  value: number;
  onChange: (val: number) => void;
}

const ThermostatSlider: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className={styles.sliderWrapper}>
      <input
        type="range"
        min="16"
        max="40"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={styles.slider}
      />
      <div className={styles.valueDisplay}>{value}°C</div>
    </div>
  );
};

export default ThermostatSlider;
