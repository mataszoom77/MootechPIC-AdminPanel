import { authFetch } from './authFetch';

export async function getAllRequests() {
  return await authFetch('/requests');
}

export async function deleteRequest(id) {
  return await authFetch(`/requests/${id}`, { method: 'DELETE' });
}

export async function updateRequestStatus(id, status) {
  return await authFetch(`/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  });
}

export async function getUserById(id) {
  return await authFetch(`/users/${id}`);
}

export async function submitAdminResponse(data) {
    return await authFetch("/adminresponses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

export async function getRequestById(id) {
  return await authFetch(`/requests/${id}`);
}
export async function postAdminResponse(requestId, payload) {
    return await authFetch(`/requests/${requestId}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  
  export async function getAdminResponses(requestId) {
    return await authFetch(`/requests/${requestId}/responses`);
  }

  export async function getAdminResponsesForRequest(requestId) {
    return await authFetch(`/requests/${requestId}/responses`);
  }
  