const ORDER_STATUSES = ["new", "preparing", "ready", "delivered"];

const ALLOWED_TRANSITIONS = {
  new: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: null,
};

function isKnownStatus(status) {
  return ORDER_STATUSES.includes(status);
}

function canTransition(fromStatus, toStatus) {
  return ALLOWED_TRANSITIONS[fromStatus] === toStatus;
}

module.exports = {
  ORDER_STATUSES,
  isKnownStatus,
  canTransition,
};
