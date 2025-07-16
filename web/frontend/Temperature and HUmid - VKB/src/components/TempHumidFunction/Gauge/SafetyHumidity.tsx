import React from "react";
import styles from "../../../styles/SafetyHumidity.module.css";
interface Props {
  safety: number;
  humidity: number;
}

const SafetyHumidity: React.FC<Props> = ({ safety, humidity }) => {
  return (
    <div className={styles.safetyContainer}>
      <div className={styles.boxStat}>
        <p className="text-sm text-gray-600">Safety Score</p>
        <h2 className="text-2xl font-bold">{safety}/100</h2>
      </div>
      <div className={styles.boxStat}>
        <p className="text-sm text-gray-600">Humidity</p>
        <h2 className="text-2xl font-bold">{humidity}%</h2>
      </div>
    </div>
  );
};

export default SafetyHumidity;
