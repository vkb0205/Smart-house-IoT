import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "../../styles/Homepage.module.css";
import Dashboard from "../TempHumidFunction/Dashboard";
import GasDetection from "../GasDetection/GasDetection";
import IrrigationSystem from "../IrrigationSystem/IrrigationSystem";
import UniversalNavBar from "../UniversalNavBar";
import Profile from "../Profile/Profile";
import RealtimeTest from "../Test/RealtimeTest";
import { initializeApp } from "firebase/app";
import ReactECharts from "echarts-for-react";
import { getDatabase, ref, onValue, query, orderByChild, startAt, get, onChildAdded } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyB8vZA9_zqopzXn_ug4vMqHtHAwJgA1n8c",
  authDomain: "smarthouse-iot-lab.firebaseapp.com",
  databaseURL: "https://smarthouse-iot-lab-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "smarthouse-iot-lab",
  storageBucket: "smarthouse-iot-lab.appspot.com",
  messagingSenderId: "556659966348",
  appId: "1:556659966348:web:smarthouse-iot-lab"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

interface HomepageProps {
  onNavigate?: (page: string) => void;
}

interface HomeDataProps {
  onBack?: () => void;
}

interface HomeData {
  gas_value: number;
  humidity: number;
  soil: boolean;
  temperature: number;
  time: string;
  timestamp: number;
}

const Homepage: React.FC<HomepageProps & HomeData> = ({ onNavigate }) => {
  const [data, setData] = useState<HomeData>({
    gas_value: 0,
    humidity: 0,
    soil: false,
    temperature: 0,
    time: new Date().toLocaleTimeString(),
    timestamp: Date.now(),
  });

  const [activeTab, setActiveTab] = useState("Monitoring");

  const [currentView, setCurrentView] = useState("home");

  const [searchQuery, setSearchQuery] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  const [history, setHistory] = useState<HomeData[]>([]);
  useEffect(() => {

    const sensorRef = ref(db, "sensors/current");


    const unsubscribe = setInterval(()=> {
      get(sensorRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const firebaseData = snapshot.val();
          console.log(
            "📊 Homepage received REAL-TIME data from 'sensors/current':",
            firebaseData
          );
          // Luôn gọi hàm update vì đây là nguồn dữ liệu duy nhất
          updateHomeDataFromFirebase(firebaseData);
        } else {
          console.warn("⚠️ Path 'sensors/current' does not exist in Firebase.");
        }
      },
      (error) => {
        console.error("❌ Firebase real-time error on 'sensors/current':", error);
      }
    );
    }, 5000); // Fetch every 5 seconds
    // Dọn dẹp khi component unmount
    return () => {
      console.log("🔌 Disconnecting Firebase listener for 'sensors/current'...");
      clearInterval(unsubscribe);
    };
  }, []);

  const showNotification = (message: string) => {

    setNotification(message);

    setTimeout(() => setNotification(null), 3000);

  };



  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    setSearchQuery(e.target.value);

  };



  const handleQuickAction = (action: string) => {

    switch (action) {

      case "home":

        setCurrentView("home");

        break;

      case "profile":

        setCurrentView("profile");

        break;

      case "settings":

        setCurrentView("test");

        break;

      default:

        break;

    }

  };



  // If user navigated to dashboard, show the Dashboard component



  


     

//   }, []);

 

  const updateHomeDataFromFirebase = (firebaseData: any) => {
    console.log(
      "🔄 Processing REAL-TIME Firebase data structure:",
      Object.keys(firebaseData)
    );
    console.log("🔄 Raw REAL-TIME Firebase data:", firebaseData);
    // Debug: Show all possible gas-related fields
    console.log("🔍 Checking all gas-related fields:");
    console.log("  gas-value:", firebaseData["gas-value"]);
    console.log("  gasValue:", firebaseData.gasValue);
    console.log("  gasLevel:", firebaseData.gasLevel);
    console.log("  gas_value:", firebaseData.gas_value);
    console.log("  gas:", firebaseData.gas);
    // Check data source priority
    const isRealTimeSource = firebaseData["gas-value"] !== undefined;
    const isBackupSource =
      firebaseData.gasLevel !== undefined && !isRealTimeSource;
    console.log("🎯 Data source analysis:");
    console.log("  Is real-time source (has gas-value):", isRealTimeSource);
    console.log("  Is backup source (has gasLevel only):", isBackupSource);
//     if (isBackupSource) {

//       console.log("⏭️ SKIPPING backup source - we prioritize real-time data");

//       return; // Skip processing old data structure

//     }



    const now = Date.now();

    const timeStamp = new Date().toLocaleTimeString();



    // Extract data from different possible Firebase structures

    let gasLevel, temperature, humidity, soil;



    // Handle different data structures - prioritize gas-value field

    if (firebaseData["gasLevel"] !== undefined) {
      gasLevel = parseFloat(firebaseData["gasLevel"]);
      console.log(
        "✅ Found gas-value field:",
        firebaseData["gasLevel"],
        "-> parsed:",
        gasLevel
      );
    } else if (firebaseData.gasLevel !== undefined) {
      gasLevel = parseFloat(firebaseData.gasLevel);
      console.log(
        "✅ Found gasLevel field:",
        firebaseData.gasLevel,
        "-> parsed:",
        gasLevel
      );
    } else if (firebaseData.gas !== undefined) {
      gasLevel = parseFloat(firebaseData.gas);
      console.log(
        "✅ Found gas field:",
        firebaseData.gas,
        "-> parsed:",
        gasLevel
      );
    } else if (firebaseData.gasValue !== undefined) {
      gasLevel = parseFloat(firebaseData.gasValue);
      console.log(
        "✅ Found gasValue field:",
        firebaseData.gasValue,
        "-> parsed:",
        gasLevel
      );
    } else if (firebaseData.gasLevel !== undefined) {
      gasLevel = parseFloat(firebaseData.gasLevel);
      console.log(
        "✅ Found gasLevel field:",
        firebaseData.gasLevel,
        "-> parsed:",
        gasLevel
      );
    } else {
      console.warn(
        "⚠️ Gas level not found in Firebase data - available fields:",
        Object.keys(firebaseData)
      );
      gasLevel = 0;
    }


    if (firebaseData.temperature !== undefined) {

      temperature = parseFloat(firebaseData.temperature);

      console.log(

        "✅ Found temperature field:",

        firebaseData.temperature,

        "-> parsed:",

        temperature

      );

    } else {

      console.warn("⚠️ Temperature not found in Firebase data");

      temperature = 0;

    }



    if (firebaseData.humidity !== undefined) {

      humidity = parseFloat(firebaseData.humidity);

      console.log(

        "✅ Found humidity field:",

        firebaseData.humidity,

        "-> parsed:",

        humidity

      );

    } else {

      console.warn("⚠️ Humidity not found in Firebase data");

      humidity = 0;

    }



    if (firebaseData.soil !== undefined) {

      soil = parseFloat(firebaseData.soil);

      console.log(

        "✅ Found soil field:",

        firebaseData.soil,

        "-> parsed:",

        soil

      );

    } else {

      console.warn("⚠️ soil not found in Firebase data");

      soil = 0;

    }

    console.log(

      "📈 Extracted REAL-TIME values - Gas:",

      gasLevel,

      "ppm, Temp:",

      temperature,

      "°C, Humidity:",

      humidity,

      "%, Soil Moisture:",

      soil,

      "%"

    );



    // Extra validation to ensure we're using the right gas value

    if (

      firebaseData["gas-value"] &&

      gasLevel !== parseFloat(firebaseData["gas-value"])

    ) {

      console.error(

        "❌ Gas level mismatch! Expected:",

        firebaseData["gas-value"],

        "Got:",

        gasLevel

      );

      gasLevel = parseFloat(firebaseData["gas-value"]); // Force correct value

      console.log("🔧 Corrected gas level to:", gasLevel);

    }



    // If this Firebase data doesn't have gas-value but we've seen it before, ignore old data

    if (!firebaseData["gasLevel"] && firebaseData.gasLevel !== undefined) {

      console.warn("⚠️ Ignoring old data structure without gas-value field");

      console.warn(

        "   This data has gasLevel:",

        firebaseData.gasLevel,

        "but we want gas-value"

      );

      return; // Skip this update

    }



    // Validate the extracted data

    if (gasLevel === 0 && temperature === 0 && humidity === 0) {

      console.error(

        "❌ All sensor values are 0 - this might be dummy data or extraction failed"

      );

      showNotification("⚠️ Received invalid sensor data from Firebase");

      return;

    }



    // Create the data object with real Firebase values

    const fullData: HomeData = {

      gas_value: gasLevel,

      temperature: temperature,

      humidity: humidity,

      soil: soil > 0 ? true : false, // Convert soil moisture to boolean

      time: timeStamp,

      timestamp: now,

    };



    // Update component state

    setData(fullData);

   



    console.log("✅ Homepage UI updated with REAL-TIME data:", fullData);



    // Show notification for high gas levels (but not repeatedly)

   

  };


  if (currentView === "dashboard") {

    return (

      <>

        <Dashboard onBack={() => setCurrentView("home")} />

        <UniversalNavBar

          currentView={currentView}

          onNavigate={(view: string) => {

            setCurrentView(view);

          }}

          onShowNotification={showNotification}

        />

      </>

    );

  }



  // If user navigated to profile, show the Profile component

  if (currentView === "profile") {

    return (

      <>

        <Profile />

        <UniversalNavBar

          currentView={currentView}

          onNavigate={(view: string) => {

            setCurrentView(view);

          }}

          onShowNotification={showNotification}

        />

      </>

    );

  }



  // If user navigated to test, show the Realtime Database test

  if (currentView === "test") {

    return (

      <>

        <RealtimeTest />

        <UniversalNavBar

          currentView={currentView}

          onNavigate={(view: string) => {

            setCurrentView(view);

          }}

          onShowNotification={showNotification}

        />

      </>

    );

  }



  // If user navigated to gas detection, show the GasDetection component

  if (currentView === "gas") {

    return (

      <>

        <GasDetection onBack={() => setCurrentView("home")} />

        <UniversalNavBar

          currentView={currentView}

          onNavigate={(view: string) => {

            setCurrentView(view);

          }}

          onShowNotification={showNotification}

        />

      </>

    );

  }



  // If user navigated to irrigation system, show the IrrigationSystem component

  if (currentView === "irrigation") {

    return (

      <>

        <IrrigationSystem onBack={() => setCurrentView("home")} />

        <UniversalNavBar

          currentView={currentView}

          onNavigate={(view: string) => {

            setCurrentView(view);

          }}

          onShowNotification={showNotification}

        />

      </>

    );

  }
  const systemCards = [
    {
      title: "Smart Thermostat",
      description: "Control temperature and climate",
      icon: "🌡️",
      status: "active",
      dataKey: "temperature", // Key để lấy dữ liệu từ state 'data'
      unit: "°C"             // Đơn vị chung
    },
    {
      title: "Irrigation System",
      description: "Automated garden watering",
      icon: "💧",
      status: "idle",
      dataKey: "humidity", // Key cho độ ẩm đất
      unit: "%"
    },
    {
      title: "Gas Detection",
      description: "Safety monitoring system",
      icon: "🛡️",
      status: "normal",
      dataKey: "gas_value", // Key cho nồng độ gas
      unit: " ppm"
    },
    {
      title: "Security System",
      description: "Home protection & monitoring",
      icon: "🔒",
      status: "armed",
      // Thẻ này không có dataKey vì nó hiển thị dữ liệu tĩnh
      staticValue: "4 devices active" 
    },
  ];



  const quickStats = [

    { label: "Temperature", value: "°C", icon: "🌡️", dataKey: "temperature" },

    { label: "Humidity", value: "%", icon: "💧", dataKey: "humidity" },

    { label: "Air Quality", value: "Good", icon: "🌿"},

    { label: "Security", value: "Armed", icon: "🔒" },

  ];

 

  return (

    <div className={styles.homepage}>

      {/* Notification */}

      {notification && (

        <div className={styles.notification}>

          <span>{notification}</span>

          <button

            className={styles.notificationClose}

            onClick={() => setNotification(null)}

          >

            ×

          </button>

        </div>

      )}



      {/* Header */}

      <header className={styles.header}>

        <div className={styles.searchContainer}>

          <input

            type="text"

            placeholder="Search devices, rooms, or settings..."

            className={styles.searchBar}

            value={searchQuery}

            onChange={handleSearchChange}

          />

        </div>

        <div className={styles.headerActions}>

          <button

            className={styles.actionButton}

            onClick={() => handleQuickAction("home")}

            title="Home"

          >

            🏠

          </button>

          <button

            className={styles.actionButton}

            onClick={() => handleQuickAction("profile")}

            title="Profile"

          >

            👤

          </button>

          <button

            className={styles.actionButton}

            onClick={() => handleQuickAction("settings")}

            title="Settings"

          >

            ⚙️

          </button>

        </div>

      </header>



      {/* Navigation Tabs */}

      <nav className={styles.navigationTabs}>

        {["Monitoring", "Irrigation System", "Gas Detection System"].map(

          (tab) => (

            <button

              key={tab}

              className={`${styles.navTab} ${

                activeTab === tab ? styles.active : ""

              }`}

              onClick={() => {

                setActiveTab(tab);

                if (tab !== "Monitoring") {

                  showNotification(`${tab} dashboard coming soon!`);

                }

              }}

            >

              {tab}

              {tab === "Monitoring" && (

                <span className={styles.tabBadge}>Active</span>

              )}

              {tab !== "Monitoring" && (

                <span className={styles.tabBadge}>Soon</span>

              )}

            </button>

          )

        )}

      </nav>



      {/* Main Content */}

      <div className={styles.mainContent}>

        {/* Current Weather/Status */}

        <div className={styles.weatherSection}>

          <div className={styles.weatherIcon}>🌤️</div>

          <div className={styles.weatherInfo}>

            <h1 className={styles.temperature}>23°C</h1>

            <div className={styles.dateInfo}>

              <h2>Thursday</h2>

              <p>July 10, 2025</p>

            </div>

          </div>

        </div>



        {/* Quick Stats */}

        <div className={styles.quickStats}>
          {/* Lặp qua mảng cấu hình quickStatsConfig */}
          {quickStats.map((stat, index) => {
            // Lấy key từ cấu hình, ví dụ: "temperature", "humidity"
            const key = stat.dataKey as keyof HomeData;

            // Lấy giá trị động từ state 'data' bằng key tương ứng
            const value = data[key];

            return (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statInfo}>
                  <h3>{stat.label}</h3>
                  <p>
                    {/*
                      Kiểm tra xem giá trị có hợp lệ không.
                      Nếu có, hiển thị giá trị và đơn vị.
                      Nếu không (ví dụ: đang tải), hiển thị dấu gạch ngang.
                    */}
                    {typeof value === 'number'
                      ? `${value.toFixed(1)}${stat.value}`
                      : "--"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>



        {/* System Cards */}

        <div className={styles.systemGrid}>
        {/* Thay đổi map từ () => () thành () => {} để viết logic */}
        {systemCards.map((system, index) => {
          // Lấy dataKey từ cấu hình của thẻ hiện tại
          const key = system.dataKey as keyof HomeData | undefined;
          
          // Dùng key để lấy giá trị động từ state 'data'
          // Nếu không có key, value sẽ là null
          const value = key ? data[key] : null;

          // Phải có return để trả về JSX
          return (
            <div
              key={index}
              className={`${styles.systemCard} ${
                system.title === "Smart Thermostat" ||
                system.title === "Gas Detection" ||
                system.title === "Irrigation System"
                  ? styles.clickable
                  : styles.comingSoon
              }`}
              onClick={() => {
                if (system.title === "Smart Thermostat") {
                  setCurrentView("dashboard");
                } else if (system.title === "Gas Detection") {
                  setCurrentView("gas");
                } else if (system.title === "Irrigation System") {
                  setCurrentView("irrigation");
                } else {
                  showNotification(`${system.title} feature coming soon!`);
                }
              }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{system.icon}</span>
                <span
                  className={`${styles.status} ${styles[system.status]}`}
                ></span>
              </div>
              <h3 className={styles.cardTitle}>{system.title}</h3>
              <p className={styles.cardDescription}>{system.description}</p>
              <div className={styles.cardValue}>
                {
                  // HIỂN THỊ CÓ ĐIỀU KIỆN
                  // Nếu thẻ có dataKey và giá trị là một con số, hiển thị dữ liệu động.
                  // Nếu không, hiển thị giá trị tĩnh (staticValue) hoặc một fallback.
                  key && typeof value === 'number'
                    ? `${value.toFixed(1)}${system.unit}`
                    : (system.staticValue || '--')
                }
              </div>
              {(system.title === "Smart Thermostat" ||

                system.title === "Gas Detection" ||

                system.title === "Irrigation System") && (

                <div className={styles.actionIndicator}>

                  <span>Click to control →</span>

                </div>

              )}

              {system.title !== "Smart Thermostat" &&

                system.title !== "Gas Detection" &&

                system.title !== "Irrigation System" && (

                  <div className={styles.comingSoonIndicator}>

                    <span>Coming Soon</span>

                  </div>

                )}
            </div>
          );
        })}
      </div>



{/*         Chart Section

        <div className={styles.chartSection}>

          <h3>System Performance</h3>

          <div className={styles.chartPlaceholder}>

            <svg className={styles.chartSvg} viewBox="0 0 800 200">

              <path

                d="M 50 150 Q 150 100 250 120 T 450 110 T 650 130 T 750 120"

                stroke="rgba(255,255,255,0.8)"

                strokeWidth="3"

                fill="none"

              />

              <circle cx="150" cy="100" r="4" fill="white" />

              <circle cx="350" cy="110" r="4" fill="white" />

              <circle cx="550" cy="130" r="4" fill="white" />

              <circle cx="750" cy="120" r="4" fill="white" />

            </svg>

            <div className={styles.chartLabels}>

              <span>6</span>

              <span>12</span>

              <span>18</span>

              <span>24</span>

              <span>30</span>

              <span>36</span>

            </div>

          </div>

        </div> */}



        {/* Notification Toast */}

        {notification && (

          <div className={styles.notificationToast}>{notification}</div>

        )}

      </div>



      {/* Universal Navigation Bar */}

      <UniversalNavBar

        currentView={currentView}

        onNavigate={(view: string) => {

          setCurrentView(view);

        }}

        onShowNotification={showNotification}

      />

    </div>

  );

};



export default Homepage;