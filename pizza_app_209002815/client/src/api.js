const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function parseJsonOrThrow(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export async function getMenu() {
  const response = await fetch(`${API_BASE_URL}/api/menu`);
  return parseJsonOrThrow(response);
}

export async function createOrder(orderPayload) {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });
  return parseJsonOrThrow(response);
}

export async function getOrder(orderId) {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
  return parseJsonOrThrow(response);
}

export async function getOrders(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/orders${query}`);
  return parseJsonOrThrow(response);
}

export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return parseJsonOrThrow(response);
}
