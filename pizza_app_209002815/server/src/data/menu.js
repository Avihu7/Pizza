const pizzas = [
  { id: "pizza-margherita", name: "Margherita", price: 35 },
  { id: "pizza-vegetarian", name: "Vegetarian", price: 39 },
  { id: "pizza-pepperoni", name: "Pepperoni", price: 42 },
];

const sizes = [
  { id: "size-small", name: "Small", price: 0 },
  { id: "size-medium", name: "Medium", price: 8 },
  { id: "size-large", name: "Large", price: 15 },
];

const toppings = [
  { id: "topping-olives", name: "Olives", price: 4 },
  { id: "topping-mushrooms", name: "Mushrooms", price: 4 },
  { id: "topping-corn", name: "Corn", price: 4 },
  { id: "topping-onion", name: "Onion", price: 4.5 },
  { id: "topping-extra-cheese", name: "Extra Cheese", price: 3.5 },
];

function findPizza(id) {
  return pizzas.find((p) => p.id === id);
}

function findSize(id) {
  return sizes.find((s) => s.id === id);
}

function findTopping(id) {
  return toppings.find((t) => t.id === id);
}

module.exports = {
  pizzas,
  sizes,
  toppings,
  findPizza,
  findSize,
  findTopping,
};
