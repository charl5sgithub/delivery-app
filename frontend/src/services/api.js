const API_URL = import.meta.env.VITE_API_URL;

export async function getItems() {
  const res = await fetch(`${API_URL}/api/items`);
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  });
  return res.json();
}
