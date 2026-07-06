import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../api";
import StatusBadge from "./StatusBadge";

export default function CourierView() {
  const [orders, setOrders] = useState([]);
  const [errorsByOrderId, setErrorsByOrderId] = useState({});
  const [loadError, setLoadError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoadError("");
    try {
      const readyOrders = await getOrders("ready");
      setOrders(readyOrders);
    } catch (error) {
      setLoadError(error.message);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleDeliver(order) {
    setErrorsByOrderId((current) => ({ ...current, [order.id]: "" }));
    try {
      await updateOrderStatus(order.id, "delivered");
      await loadOrders();
    } catch (error) {
      setErrorsByOrderId((current) => ({ ...current, [order.id]: error.message }));
    }
  }

  return (
    <section data-testid="delivery-orders" className="delivery-orders">
      <div className="section-header">
        <h2>הזמנות מוכנות למשלוח</h2>
        <button type="button" className="btn btn-secondary btn-sm" onClick={loadOrders}>
          🔄 רענן רשימה
        </button>
      </div>
      {loadError && <p className="error-banner">{loadError}</p>}
      {orders.length === 0 && (
        <p className="empty-state">🛵 אין הזמנות מוכנות למשלוח כרגע</p>
      )}
      <ul className="order-card-list">
        {orders.map((order) => (
          <li key={order.id} className="order-card">
            <div className="order-card-header">
              <p className="order-card-id">
                הזמנה <code>{order.id}</code>
              </p>
              <StatusBadge status={order.status} />
            </div>
            <p className="order-card-customer">{order.customerName} | {order.phone}</p>
            <p className="order-card-address">📍 {order.deliveryAddress}</p>
            <div className="order-card-footer">
              <span className="order-card-price">₪{order.totalPrice.toFixed(2)}</span>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleDeliver(order)}>
                📦 סמן כנמסרה
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
