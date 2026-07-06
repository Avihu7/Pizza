import { useState } from "react";
import { createOrder, getOrder } from "../api";
import StatusBadge from "./StatusBadge";

const MAX_TOPPINGS_PER_PIZZA = 3;
const MAX_PIZZAS_PER_ORDER = 5;

function findById(list, id) {
  return list.find((item) => item.id === id);
}

function calculatePizzaPrice(menu, pizzaId, sizeId, toppingIds) {
  const pizza = findById(menu.pizzas, pizzaId);
  const size = findById(menu.sizes, sizeId);
  if (!pizza || !size) return 0;
  const toppingsTotal = toppingIds.reduce((sum, toppingId) => {
    const topping = findById(menu.toppings, toppingId);
    return sum + (topping ? topping.price : 0);
  }, 0);
  return pizza.price + size.price + toppingsTotal;
}

function PizzaBuilder({ menu, onAddToCart, disabled }) {
  const [pizzaId, setPizzaId] = useState(menu.pizzas[0]?.id ?? "");
  const [sizeId, setSizeId] = useState(menu.sizes[0]?.id ?? "");
  const [toppingIds, setToppingIds] = useState([]);

  function toggleTopping(toppingId) {
    setToppingIds((current) => {
      if (current.includes(toppingId)) {
        return current.filter((id) => id !== toppingId);
      }
      if (current.length >= MAX_TOPPINGS_PER_PIZZA) {
        return current;
      }
      return [...current, toppingId];
    });
  }

  function handleAdd() {
    onAddToCart({ pizzaId, sizeId, toppingIds });
    setToppingIds([]);
  }

  return (
    <div className="pizza-builder">
      <div className="builder-grid">
        <label>
          פיצה
          <select value={pizzaId} onChange={(e) => setPizzaId(e.target.value)}>
            {menu.pizzas.map((pizza) => (
              <option key={pizza.id} value={pizza.id}>
                {pizza.name} (₪{pizza.price})
              </option>
            ))}
          </select>
        </label>

        <label>
          גודל
          <select value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
            {menu.sizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.name} (+₪{size.price})
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend>תוספות (עד {MAX_TOPPINGS_PER_PIZZA})</legend>
        {menu.toppings.map((topping) => (
          <label key={topping.id} className="topping-option">
            <input
              type="checkbox"
              checked={toppingIds.includes(topping.id)}
              onChange={() => toggleTopping(topping.id)}
              disabled={
                !toppingIds.includes(topping.id) &&
                toppingIds.length >= MAX_TOPPINGS_PER_PIZZA
              }
            />
            {topping.name} (+₪{topping.price})
          </label>
        ))}
      </fieldset>

      <div className="builder-footer">
        <span className="builder-price">
          מחיר משוער לפיצה זו:{" "}
          <strong>₪{calculatePizzaPrice(menu, pizzaId, sizeId, toppingIds).toFixed(2)}</strong>
        </span>
        <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={disabled}>
          ➕ הוסף לעגלה
        </button>
      </div>
      {disabled && (
        <p className="error-text">לא ניתן להוסיף יותר מ-{MAX_PIZZAS_PER_ORDER} פיצות להזמנה</p>
      )}
    </div>
  );
}

function describePizza(menu, item) {
  const pizza = findById(menu.pizzas, item.pizzaId);
  const size = findById(menu.sizes, item.sizeId);
  const toppingNames = item.toppingIds
    .map((id) => findById(menu.toppings, id)?.name)
    .filter(Boolean);
  return {
    title: `${pizza?.name ?? "?"} - ${size?.name ?? "?"}`,
    toppingsText: toppingNames.length > 0 ? toppingNames.join(", ") : "ללא תוספות",
    price: calculatePizzaPrice(menu, item.pizzaId, item.sizeId, item.toppingIds),
  };
}

function MenuDisplay({ menu }) {
  return (
    <div className="menu-display">
      <div className="menu-group">
        <h3>
          <span aria-hidden="true">🍕</span> פיצות
        </h3>
        <ul>
          {menu.pizzas.map((pizza) => (
            <li key={pizza.id}>
              <span>{pizza.name}</span>
              <span className="menu-price">₪{pizza.price}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="menu-group">
        <h3>
          <span aria-hidden="true">📐</span> גדלים
        </h3>
        <ul>
          {menu.sizes.map((size) => (
            <li key={size.id}>
              <span>{size.name}</span>
              <span className="menu-price">+₪{size.price}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="menu-group">
        <h3>
          <span aria-hidden="true">✨</span> תוספות
        </h3>
        <ul>
          {menu.toppings.map((topping) => (
            <li key={topping.id}>
              <span>{topping.name}</span>
              <span className="menu-price">+₪{topping.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function OrderConfirmation({ order }) {
  return (
    <div data-testid="order-confirmation" className="order-confirmation">
      <div className="order-confirmation-icon" aria-hidden="true">✓</div>
      <div>
        <h3>ההזמנה נשלחה בהצלחה!</h3>
        <p className="confirmation-row">
          מספר הזמנה: <code>{order.id}</code>
        </p>
        <p className="confirmation-row">
          מצב הזמנה: <StatusBadge status={order.status} />
        </p>
        <p className="confirmation-row">
          מחיר כולל: <strong>₪{order.totalPrice.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}

export default function CustomerView({ menu }) {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");

  function addToCart(item) {
    setCart((current) => [...current, { ...item, key: crypto.randomUUID() }]);
  }

  function removeFromCart(key) {
    setCart((current) => current.filter((item) => item.key !== key));
  }

  const total = cart.reduce(
    (sum, item) => sum + describePizza(menu, item).price,
    0
  );

  async function handleCheckout() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      // Payment is simulated locally before the request is sent to the server.
      const paymentApproved = true;
      if (!paymentApproved) {
        throw new Error("התשלום המדומה נכשל");
      }

      const order = await createOrder({
        customerName,
        phone,
        deliveryAddress,
        pizzas: cart.map(({ pizzaId, sizeId, toppingIds }) => ({
          pizzaId,
          sizeId,
          toppingIds,
        })),
      });

      setConfirmedOrder(order);
      setCart([]);
      setCustomerName("");
      setPhone("");
      setDeliveryAddress("");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLookup() {
    setLookupError("");
    setLookupResult(null);
    try {
      const order = await getOrder(lookupId.trim());
      setLookupResult(order);
    } catch (error) {
      setLookupError(error.message);
    }
  }

  const canCheckout =
    cart.length > 0 &&
    customerName.trim() &&
    phone.trim() &&
    deliveryAddress.trim() &&
    !isSubmitting;

  return (
    <div className="customer-view">
      <section data-testid="menu-list" className="menu-list">
        <h2>תפריט</h2>
        <MenuDisplay menu={menu} />
      </section>

      <section className="pizza-builder-section">
        <h2>בניית פיצה</h2>
        <PizzaBuilder
          menu={menu}
          onAddToCart={addToCart}
          disabled={cart.length >= MAX_PIZZAS_PER_ORDER}
        />
      </section>

      <section data-testid="cart" className="cart">
        <h2>עגלת הזמנה</h2>
        {cart.length === 0 && (
          <p className="empty-state">🛒 העגלה ריקה - הוסיפו פיצה מהבנאי למעלה</p>
        )}
        <ul className="cart-list">
          {cart.map((item) => {
            const { title, toppingsText, price } = describePizza(menu, item);
            return (
              <li key={item.key} className="cart-row">
                <div>
                  <p className="cart-item-title">{title}</p>
                  <p className="cart-item-toppings">{toppingsText}</p>
                </div>
                <div className="cart-row-end">
                  <span className="cart-item-price">₪{price.toFixed(2)}</span>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="הסר פריט"
                    onClick={() => removeFromCart(item.key)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section data-testid="order-summary-panel" className="order-summary-panel">
        <h2>סיכום הזמנה</h2>
        {cart.length === 0 ? (
          <p className="empty-state">אין עדיין פריטים בהזמנה</p>
        ) : (
          <ul className="summary-list">
            {cart.map((item) => {
              const { title, price } = describePizza(menu, item);
              return (
                <li key={item.key}>
                  <span>{title}</span>
                  <span>₪{price.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="summary-total">
          <span>מחיר משוער כולל</span>
          <strong>₪{total.toFixed(2)}</strong>
        </div>
        <p className="hint">המחיר הסופי מחושב ומוצג בשרת לאחר שליחת ההזמנה</p>

        <div className="form-grid">
          <label>
            שם מלא
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </label>
          <label>
            טלפון
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            כתובת למשלוח
            <input
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </label>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          data-testid="checkout-button"
          onClick={handleCheckout}
          disabled={!canCheckout}
        >
          {isSubmitting ? "שולח..." : "💳 בצע תשלום מדומה ושלח הזמנה"}
        </button>
        {submitError && <p className="error-text">{submitError}</p>}
      </section>

      {confirmedOrder && <OrderConfirmation order={confirmedOrder} />}

      <section className="order-lookup">
        <h2>בדיקת מצב הזמנה</h2>
        <div className="lookup-row">
          <label>
            מזהה הזמנה
            <input value={lookupId} onChange={(e) => setLookupId(e.target.value)} />
          </label>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLookup}
            disabled={!lookupId.trim()}
          >
            בדוק מצב
          </button>
        </div>
        {lookupError && <p className="error-text">{lookupError}</p>}
        {lookupResult && (
          <p className="lookup-result">
            מצב הזמנה <code>{lookupResult.id}</code>:{" "}
            <StatusBadge status={lookupResult.status} />
          </p>
        )}
      </section>
    </div>
  );
}
