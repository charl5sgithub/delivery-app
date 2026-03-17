/**
 * api.js
 *
 * Central API service. All authenticated requests use authFetch()
 * which automatically attaches the JWT Bearer token from localStorage.
 */

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

/** Returns the stored JWT token, or null if not logged in. */
function getToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Authenticated fetch — automatically adds Authorization: Bearer header.
 * Use for any endpoint that requires the user to be logged in.
 */
async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

// ── Public endpoints (no auth needed) ────────────────────────────────────────

export async function getItems() {
  const res = await fetch(`${API_URL}/api/items`);
  return res.json();
}

// ── Admin-only item endpoints (auth required) ─────────────────────────────────

export async function createItem(itemData) {
  const res = await authFetch(`${API_URL}/api/items`, {
    method: "POST",
    body: JSON.stringify(itemData),
  });
  return res.json();
}

export async function updateItem(id, itemData) {
  const res = await authFetch(`${API_URL}/api/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(itemData),
  });
  return res.json();
}

export async function deleteItem(id) {
  const res = await authFetch(`${API_URL}/api/items/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

// ── Order endpoints ───────────────────────────────────────────────────────────

export async function createOrder(orderData) {
  const res = await authFetch(`${API_URL}/api/orders/checkout`, {
    method: "POST",
    body: JSON.stringify(orderData),
  });
  return res.json();
}

// ── Auth helper (re-exported for convenience) ─────────────────────────────────
export { authFetch, API_URL };
