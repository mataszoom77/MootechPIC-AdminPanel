const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function loginAdmin(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();

  // Optional: check role is Admin (if you want to restrict login)
  if (data.user.role !== 'Admin') {
    throw new Error('Not an admin account.');
  }

  return data; // contains { token, refreshToken, user }
}
