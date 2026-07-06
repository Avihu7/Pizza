import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../api";

const NEXT_STATUS = {
  new: "preparing",
  preparing: "ready",
};

const ACTION_LABEL = {
  new: "התחל הכנה",
  preparing: "סמן כמוכן",
};

export default function EmployeeView() {
  const [orders, setOrders] = useState([]);
  const [errorsByOrderId, setErrorsByOrderId] = useState({});
  const [loadError, setLoadError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoadError("");
    try {
      const [newOrders, preparingOrders] = await Promise.all([
        getOrders("new"),
        getOrders("preparing"),
      ]);
      setOrders([...newOrders, ...preparingOrders]);
    } catch (error) {
      setLoadError(error.message);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleAdvance(order) {
    const nextStatus = NEXT_STATUS[order.status];
    setErrorsByOrderId((current) => ({ ...current, [order.id]: "" }));
    try {
      await updateOrderStatus(order.id, nextStatus);
      await loadOrders();
    } catch (error) {
      setErrorsByOrderId((current) => ({ ...current, [order.id]: error.message }));
    }
  }

  return (
    <section data-testid="employee-orders" className="employee-orders">
      <h2>הזמנות פעילות</h2>
      <button type="button" onClick={loadOrders}>
        רענן רשימה
      </button>
      {loadError && <p className="error-text">{loadError}</p>}
      {orders.length === 0 && <p>אין הזמנות פעילות כרגע</p>}
      <ul>
        {orders.map((order) => (
          <li key={order.id} className="order-row">
            <p>
              הזמנה {order.id} - {order.customerName}
            </p>
            <p>
              {order.pizzas.map((p) => `${p.pizzaName} (${p.sizeName})`).join(", ")}
            </p>
            <p>
              מחיר: ₪{order.totalPrice.toFixed(2)} | מצב: {order.status}
            </p>
            <button type="button" onClick={() => handleAdvance(order)}>
              {ACTION_LABEL[order.status]}
            </button>
            {errorsByOrderId[order.id] && (
              <p className="error-text">{errorsByOrderId[order.id]}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
