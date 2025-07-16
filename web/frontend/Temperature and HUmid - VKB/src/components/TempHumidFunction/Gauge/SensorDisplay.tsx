import React, { useEffect, useState } from "react";

interface TempHumidData {
  temp: number | string;
  hum: number | string;
}

const SensorDisplay = ({ temp, hum }: TempHumidData) => {
  const [data, setData] = useState<TempHumidData>({ temp: "--", hum: "--" });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("http://192.168.4.1/data");
        const result = await response.json();
        setData({ temp: result.temp, hum: result.hum });
      } catch (error) {
        console.error("Error fetching data", error);
        setData({ temp: "--", hum: "--" });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  //JSX
  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        padding: "20px",
        borderRadius: "10px",
        color: "white",
      }}
    >
      <h2>🌡️ Temperature & Humidity</h2>
      <p>
        Temperature: <strong>{data.temp}</strong> °C
      </p>
      <p>
        Humidity: <strong>{data.hum}</strong> %
      </p>
    </div>
  );
};

export default SensorDisplay;
