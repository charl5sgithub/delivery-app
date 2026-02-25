const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export async function getItems() {
  const res = await fetch(`${API_URL}/api/items`);
  return res.json();
}

export async function createItem(itemData) {
  const res = await fetch(`${API_URL}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData)
  });
  return res.json();
}

export async function updateItem(id, itemData) {
  const res = await fetch(`${API_URL}/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData)
  });
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API_URL}/api/items/${id}`, {
    method: "DELETE"
  });
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
