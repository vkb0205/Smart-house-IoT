import React from "react";
import { FaSnowflake, FaFire, FaSmile, FaUser } from "react-icons/fa";
import styles from "../../../styles/ModeButtons.module.css";

const ModeButtons = () => {
  return (
    <div className={styles.modeButtonsContainer}>
      <button className={styles.modeButton} title="Cool">
        <FaSnowflake />
      </button>
      <button className={styles.modeButton} title="Heat">
        <FaFire />
      </button>
      <button className={styles.modeButton} title="Auto">
        <FaSmile />
      </button>
      <button className={styles.modeButton} title="Manual">
        <FaUser />
      </button>
    </div>
  );
};

export default ModeButtons;
