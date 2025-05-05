import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { fetchDashboardSummary } from "../api/dashboard";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardSummary(token).then(setData).catch(console.error);
  }, [token]);

  if (!data)
    return (
      <Layout>
        <p className="p-8 text-gray-600">Loading...</p>
      </Layout>
    );

  const ordersData = data.ordersPerDay.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    orders: d.count,
  }));

  const requestsData = data.requestsPerDay.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    requests: d.count,
  }));
  return (
    <Layout>
      <div>
        <h2 className="text-3xl font-semibold text-moodark mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-moodark">
            <h3 className="text-xl font-bold text-gray-800">Total Products</h3>
            <p className="text-3xl mt-2 text-gray-800 font-semibold">
              {data.productCount}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-moodark">
            <h3 className="text-xl font-bold text-gray-800">Spare Parts</h3>
            <p className="text-3xl mt-2 text-gray-800 font-semibold">
              {data.sparePartCount}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-moodark">
            <h3 className="text-xl font-bold text-gray-800">
              Pending Requests
            </h3>
            <p className="text-3xl mt-2 text-gray-800 font-semibold">
              {data.pendingRequestCount}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-moodark">
            <h3 className="text-xl font-bold text-gray-800">Orders</h3>
            <p className="text-3xl mt-2 text-gray-800 font-semibold">
              {data.orderCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders Chart */}
          <div className="bg-white p-6 shadow rounded-lg">
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              Orders Over Time
            </h4>
            <div className="h-64">
              {ordersData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--color-moodark)"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No orders yet
                </div>
              )}
            </div>
          </div>

          {/* Requests Chart */}
          <div className="bg-white p-6 shadow rounded-lg">
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              Requests Over Time
            </h4>
            <div className="h-64">
              {requestsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={requestsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="var(--color-moogreen)"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No requests yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
