import { authFetch } from './authFetch';

export async function fetchAllOrders() {
  return await authFetch('/orders');
}

export async function fetchOrderById(id) {
  return await authFetch(`/orders/${id}`);
}
export async function getOrderById(id) {
    return await authFetch(`/orders/${id}`);
  }
  
  export async function updateOrderStatus(id, newStatus) {
    return await authFetch(`/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStatus),
    });
  }
  