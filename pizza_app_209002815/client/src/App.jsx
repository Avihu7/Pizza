import { useEffect, useState } from "react";
import "./App.css";
import { getMenu } from "./api";
import CustomerView from "./components/CustomerView";
import EmployeeView from "./components/EmployeeView";
import CourierView from "./components/CourierView";

const TABS = [
  { id: "customer", label: "לקוח", icon: "🍕" },
  { id: "employee", label: "עובד מסעדה", icon: "👨‍🍳" },
  { id: "courier", label: "שליח", icon: "🛵" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("customer");
  const [menu, setMenu] = useState(null);
  const [menuError, setMenuError] = useState("");

  useEffect(() => {
    getMenu()
      .then(setMenu)
      .catch((error) => setMenuError(error.message));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="app-logo" aria-hidden="true">🍕</span>
          <div>
            <h1>מערכת הזמנת פיצה</h1>
            <p className="app-subtitle">הזמנה, הכנה ומשלוח - הכל במקום אחד</p>
          </div>
        </div>

        <nav className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {menuError && (
        <p className="error-banner">שגיאה בטעינת התפריט: {menuError}</p>
      )}
      {!menu && !menuError && <p className="loading-text">טוען תפריט...</p>}

      {menu && (
        <main>
          {activeTab === "customer" && <CustomerView menu={menu} />}
          {activeTab === "employee" && <EmployeeView />}
          {activeTab === "courier" && <CourierView />}
        </main>
      )}
    </div>
  );
}
