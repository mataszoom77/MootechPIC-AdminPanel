import { authFetch } from './authFetch';

export async function fetchDashboardSummary() {
  return await authFetch('/dashboard/summary');
}
