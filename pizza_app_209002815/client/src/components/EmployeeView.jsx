import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../api";
import StatusBadge from "./StatusBadge";

const NEXT_STATUS = {
  new: "preparing",
  preparing: "ready",
};

const ACTION_LABEL = {
  new: "▶️ התחל הכנה",
  preparing: "✅ סמן כמוכן",
};

function describeToppings(pizza) {
  return pizza.toppings.length > 0
    ? pizza.toppings.map((t) => t.name).join(", ")
    : "ללא תוספות";
}

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
      <div className="section-header">
        <h2>הזמנות פעילות</h2>
        <button type="button" className="btn btn-secondary btn-sm" onClick={loadOrders}>
          🔄 רענן רשימה
        </button>
      </div>
      {loadError && <p className="error-banner">{loadError}</p>}
      {orders.length === 0 && (
        <p className="empty-state">👨‍🍳 אין הזמנות פעילות כרגע</p>
      )}
      <ul className="order-card-list">
        {orders.map((order) => (
          <li key={order.id} className="order-card">
            <div className="order-card-header">
              <div>
                <p className="order-card-id">
                  הזמנה <code>{order.id}</code>
                </p>
                <p className="order-card-customer">{order.customerName}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <ul className="pizza-lines">
              {order.pizzas.map((pizza, index) => (
                <li key={index}>
                  <span className="pizza-line-name">
                    {pizza.pizzaName} ({pizza.sizeName})
                  </span>
                  <span className="pizza-line-toppings">{describeToppings(pizza)}</span>
                </li>
              ))}
            </ul>

            <div className="order-card-footer">
              <span className="order-card-price">₪{order.totalPrice.toFixed(2)}</span>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleAdvance(order)}>
                {ACTION_LABEL[order.status]}
              </button>
            </div>
            {errorsByOrderId[order.id] && (
              <p className="error-text">{errorsByOrderId[order.id]}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
