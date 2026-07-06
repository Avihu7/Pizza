import { useEffect, useState } from "react";
import "./App.css";
import { getMenu } from "./api";
import CustomerView from "./components/CustomerView";
import EmployeeView from "./components/EmployeeView";
import CourierView from "./components/CourierView";

const TABS = [
  { id: "customer", label: "לקוח" },
  { id: "employee", label: "עובד מסעדה" },
  { id: "courier", label: "שליח" },
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
      <h1>מערכת הזמנת פיצה</h1>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {menuError && <p className="error-text">שגיאה בטעינת התפריט: {menuError}</p>}
      {!menu && !menuError && <p>טוען תפריט...</p>}

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
