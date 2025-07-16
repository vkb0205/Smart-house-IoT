import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "../../../styles/WeeklyChart.module.css";

const data = [
  { day: "Mon", temp: 90 },
  { day: "Tue", temp: 80 },
  { day: "Wed", temp: 78 },
  { day: "Thu", temp: 15 },
  { day: "Fri", temp: 20 },
  { day: "Sat", temp: 75 },
  { day: "Sun", temp: 35 },
];

const WeeklyChart = () => (
  <div className={styles.chartContainer}>
    <h3 className="text-md font-semibold mb-2 text-center">
      Weekly Average Temperature
    </h3>
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="temp" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default WeeklyChart;
