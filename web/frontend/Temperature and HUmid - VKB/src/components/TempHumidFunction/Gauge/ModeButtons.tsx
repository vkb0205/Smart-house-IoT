import React from "react";
import { FaSnowflake, FaFire, FaSmile, FaUser } from "react-icons/fa";
import styles from "../../../styles/ModeButtons.module.css";

const ModeButtons = () => {
  return (
    <div className={styles.modeButtonsContainer}>
      <button className={styles.modeButton} title="Cool">
        <FaSnowflake style={{ fontSize: "1.2rem" }} />
      </button>
      <button className={styles.modeButton} title="Heat">
        <FaFire style={{ fontSize: "1.2rem" }} />
      </button>
      <button className={styles.modeButton} title="Auto">
        <FaSmile style={{ fontSize: "1.2rem" }} />
      </button>
      <button className={styles.modeButton} title="Manual">
        <FaUser style={{ fontSize: "1.2rem" }} />
      </button>
    </div>
  );
};

export default ModeButtons;
