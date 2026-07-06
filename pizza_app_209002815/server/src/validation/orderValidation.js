const { findPizza, findSize, findTopping } = require("../data/menu");

const MAX_TOPPINGS_PER_PIZZA = 3;
const MAX_PIZZAS_PER_ORDER = 5;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validatePizzaItem(pizza, index) {
  if (typeof pizza !== "object" || pizza === null || Array.isArray(pizza)) {
    return `Pizza at index ${index} must be an object`;
  }

  const { pizzaId, sizeId, toppingIds } = pizza;

  if (!isNonEmptyString(pizzaId)) {
    return `Pizza at index ${index} is missing pizzaId`;
  }
  if (!findPizza(pizzaId)) {
    return `Pizza at index ${index} has unknown pizzaId "${pizzaId}"`;
  }

  if (!isNonEmptyString(sizeId)) {
    return `Pizza at index ${index} is missing sizeId`;
  }
  if (!findSize(sizeId)) {
    return `Pizza at index ${index} has unknown sizeId "${sizeId}"`;
  }

  if (toppingIds === undefined) {
    return null;
  }
  if (!Array.isArray(toppingIds)) {
    return `Pizza at index ${index} toppingIds must be an array`;
  }
  if (toppingIds.length > MAX_TOPPINGS_PER_PIZZA) {
    return `Pizza at index ${index} exceeds the maximum of ${MAX_TOPPINGS_PER_PIZZA} toppings`;
  }
  for (const toppingId of toppingIds) {
    if (!isNonEmptyString(toppingId) || !findTopping(toppingId)) {
      return `Pizza at index ${index} has unknown toppingId "${toppingId}"`;
    }
  }

  return null;
}

function validateOrderPayload(body) {
  if (typeof body !== "object" || body === null) {
    return "Request body must be a JSON object";
  }

  const { customerName, phone, deliveryAddress, pizzas } = body;

  if (!isNonEmptyString(customerName)) {
    return "customerName is required";
  }
  if (!isNonEmptyString(phone)) {
    return "phone is required";
  }
  if (!isNonEmptyString(deliveryAddress)) {
    return "deliveryAddress is required";
  }
  if (!Array.isArray(pizzas) || pizzas.length === 0) {
    return "pizzas must be a non-empty array";
  }
  if (pizzas.length > MAX_PIZZAS_PER_ORDER) {
    return `An order cannot contain more than ${MAX_PIZZAS_PER_ORDER} pizzas`;
  }

  for (let i = 0; i < pizzas.length; i += 1) {
    const error = validatePizzaItem(pizzas[i], i);
    if (error) {
      return error;
    }
  }

  return null;
}

module.exports = {
  validateOrderPayload,
  MAX_TOPPINGS_PER_PIZZA,
  MAX_PIZZAS_PER_ORDER,
};
