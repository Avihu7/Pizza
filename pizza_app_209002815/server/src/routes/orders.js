const express = require("express");
const crypto = require("crypto");

const { validateOrderPayload } = require("../validation/orderValidation");
const { buildOrderPizzas, calculateTotalPrice } = require("../services/pricing");
const { addOrder, getOrderById, getOrders } = require("../data/orders");

const router = express.Router();

router.post("/", (req, res) => {
  const validationError = validateOrderPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { customerName, phone, deliveryAddress, pizzas } = req.body;

  const orderPizzas = buildOrderPizzas(pizzas);
  const totalPrice = calculateTotalPrice(orderPizzas);

  // Payment is simulated on the client before the order is submitted, so by
  // the time it reaches the server the (mock) payment has already gone
  // through — hence paymentStatus starts as "paid" rather than "pending".
  const order = {
    id: crypto.randomUUID(),
    customerName,
    phone,
    deliveryAddress,
    pizzas: orderPizzas,
    totalPrice,
    status: "new",
    paymentStatus: "paid",
    createdAt: new Date().toISOString(),
  };

  addOrder(order);

  res.status(201).json(order);
});

router.get("/", (req, res) => {
  const { status } = req.query;
  res.status(200).json(getOrders(status));
});

router.get("/:id", (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.status(200).json(order);
});

module.exports = router;
