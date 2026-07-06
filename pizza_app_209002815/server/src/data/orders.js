const orders = [];

function addOrder(order) {
  orders.push(order);
  return order;
}

function getOrderById(id) {
  return orders.find((order) => order.id === id);
}

function getOrders(status) {
  if (!status) {
    return orders;
  }
  return orders.filter((order) => order.status === status);
}

module.exports = {
  addOrder,
  getOrderById,
  getOrders,
};
