import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../api";

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
      <h2>הזמנות מוכנות למשלוח</h2>
      <button type="button" onClick={loadOrders}>
        רענן רשימה
      </button>
      {loadError && <p className="error-text">{loadError}</p>}
      {orders.length === 0 && <p>אין הזמנות מוכנות למשלוח כרגע</p>}
      <ul>
        {orders.map((order) => (
          <li key={order.id} className="order-row">
            <p>הזמנה {order.id}</p>
            <p>לקוח: {order.customerName} | טלפון: {order.phone}</p>
            <p>כתובת: {order.deliveryAddress}</p>
            <button type="button" onClick={() => handleDeliver(order)}>
              סמן כנמסרה
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
