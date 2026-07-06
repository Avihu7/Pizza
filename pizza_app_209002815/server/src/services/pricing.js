const { findPizza, findSize, findTopping } = require("../data/menu");

function buildPizzaLine(pizzaInput) {
  const pizza = findPizza(pizzaInput.pizzaId);
  const size = findSize(pizzaInput.sizeId);
  const toppingIds = pizzaInput.toppingIds || [];
  const toppings = toppingIds.map((toppingId) => findTopping(toppingId));

  const price =
    pizza.price + size.price + toppings.reduce((sum, t) => sum + t.price, 0);

  return {
    pizzaId: pizza.id,
    pizzaName: pizza.name,
    sizeId: size.id,
    sizeName: size.name,
    toppings: toppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
    price,
  };
}

function buildOrderPizzas(pizzasInput) {
  return pizzasInput.map(buildPizzaLine);
}

function calculateTotalPrice(orderPizzas) {
  return orderPizzas.reduce((sum, pizza) => sum + pizza.price, 0);
}

module.exports = {
  buildOrderPizzas,
  calculateTotalPrice,
};
