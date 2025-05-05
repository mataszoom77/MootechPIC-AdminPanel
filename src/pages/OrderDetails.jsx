import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrderById, updateOrderStatus } from "../api/ordersDb";
import { getProductById, getSparePartById } from "../api/productsDb";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [itemDetails, setItemDetails] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    getOrderById(id)
      .then(async (data) => {
        setOrder(data);

        const details = await Promise.all(
          data.items.map(async (item) => {
            if (item.productId) {
              const product = await getProductById(item.productId);
              return { ...item, name: product.name, type: "Product" };
            }
            if (item.sparePartId) {
              const part = await getSparePartById(item.sparePartId);
              return { ...item, name: part.name, type: "Spare Part" };
            }
            return { ...item, name: "Unknown", type: "Unknown" };
          })
        );

        setItemDetails(details);
      })
      .catch(() => toast.error("Failed to load order"));
  }, [token, id]);

  const handleViewItem = async (item) => {
    setModalItem(item);
    const data = item.productId
      ? await getProductById(item.productId)
      : await getSparePartById(item.sparePartId);
    setModalData(data);
  };

  const handleStatusUpdate = () => {
    if (!newStatus) return;

    toast.promise(
      (async () => {
        await updateOrderStatus(id, newStatus);
        navigate("/orders");
      })(),
      {
        loading: "Updating status...",
        success: "Status updated!",
        error: "Failed to update status",
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white border rounded-xl shadow p-6">
        {!order ? (
          <p className="p-6">Loading...</p>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-moodark mb-4">
              Order #{order.id.slice(0, 8)}
            </h2>

            <div className="space-y-2 mb-6 text-sm text-gray-700">
              <p><strong>Status:</strong> <span className="capitalize">{order.status}</span></p>
              <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Total:</strong> €{order.total.toFixed(2)}</p>

              <hr className="my-2" />
              <h4 className="text-sm font-semibold text-moodark mt-4">Shipping Info</h4>
              <p><strong>Name:</strong> {order.shipName}</p>
              <p><strong>Address:</strong> {order.shipAddress}, {order.shipCity}, {order.shipPincode}, {order.shipCountry}</p>
              <p><strong>Delivery Method:</strong> {order.deliveryMethod}</p>
              <p><strong>Delivery Cost:</strong> €{order.deliveryCost?.toFixed(2)}</p>

              <hr className="my-2" />
              <h4 className="text-sm font-semibold text-moodark mt-4">Business Info</h4>
              {order.bizName && <p><strong>Business Name:</strong> {order.bizName}</p>}
              {order.bizAddress && <p><strong>Business Address:</strong> {order.bizAddress}</p>}
              {order.bizVatNumber && <p><strong>VAT Number:</strong> {order.bizVatNumber}</p>}

              <hr className="my-2" />
              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Items</h3>
              <ul className="space-y-2 text-sm">
                {itemDetails.map((item) => (
                  <li
                    key={item.id}
                    className="border rounded px-4 py-2 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {item.name} <span className="italic text-xs text-gray-500">({item.type})</span>
                      </span>
                      <span className="text-sm">x{item.quantity}</span>
                      <button
                        className="text-sm text-moogreen underline ml-2 hover:text-moodark hover:font-medium transition"
                        onClick={() => handleViewItem(item)}
                      >
                        View
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Unit Price: €{item.unitPrice.toFixed(2)} | Line Total: €{item.lineTotal.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Change status...</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>

              <button
                onClick={handleStatusUpdate}
                className="bg-moogreen hover:bg-moodark text-white px-4 py-2 rounded-full transition"
              >
                Update Status
              </button>
            </div>
          </>
        )}
      </div>

      {modalItem && modalData && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center transition-opacity duration-300"
          onClick={() => {
            setModalItem(null);
            setModalData(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative transform transition-transform duration-300 scale-95 hover:scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-600 text-xl font-bold hover:text-red-500 transition"
              onClick={() => {
                setModalItem(null);
                setModalData(null);
              }}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-2">{modalData.name}</h2>
            <div className="flex gap-2 overflow-x-auto mb-4">
              {modalData.imageUrls?.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="img"
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>
            <p className="text-gray-700 mb-1"><strong>Description:</strong> {modalData.description}</p>
            <p className="text-gray-700 mb-1"><strong>Type:</strong> {modalItem.productId ? "Product" : "Spare Part"}</p>
            <p className="text-gray-700 mb-1"><strong>Quantity:</strong> {modalItem.quantity}</p>
            <p className="text-gray-700 mb-1"><strong>Unit Price:</strong> €{modalItem.unitPrice.toFixed(2)}</p>
            <p className="text-gray-700 font-semibold">Line Total: €{modalItem.lineTotal.toFixed(2)}</p>
          </div>
        </div>
      )}
    </Layout>
  );
}
