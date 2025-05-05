import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders } from "../api/ordersDb";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchAllOrders()
      .then(setOrders)
      .catch(console.error);
  }, [token]);

  const filteredOrders = orders.filter((order) =>
    statusFilter === "All" ? true : order.status === statusFilter
  );

  return (
    <Layout>
      <div>
        <h2 className="text-3xl font-semibold text-moodark mb-6">Orders</h2>

        {/* Filter Dropdown */}
        <div className="mb-6">
          <label className="block mb-1 text-sm text-gray-700 font-medium">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-4 py-2 rounded-lg text-sm"
          >
            <option value="All">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border rounded-xl shadow p-6"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">
                  Order #{order.id.slice(0, 8)}
                </h3>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    {order.status}
                  </span>
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="text-sm text-white bg-moogreen px-4 py-1 rounded-full hover:bg-moodark transition"
                  >
                    View
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-1">
                <strong>Created:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Total Price:</strong> €{order.total.toFixed(2)}
              </p>
              <p className="text-gray-600 text-sm italic">
                {order.items.length} item(s)
              </p>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <p className="text-gray-500 italic">No orders found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
