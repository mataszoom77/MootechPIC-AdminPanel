import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import {
  getRequestById,
  postAdminResponse,
  updateRequestStatus,
} from "../api/requestsDb";
import {
  fetchAllProducts,
  fetchAllSpareParts,
  getProductById,
  getSparePartById,
} from "../api/productsDb";

export default function AnswerRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [previewIndex, setPreviewIndex] = useState(null);
  const [request, setRequest] = useState(null);
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [products, setProducts] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [previousResponses, setPreviousResponses] = useState([]);

  useEffect(() => {
    getRequestById(id).then(async (data) => {
      setRequest(data);
      setStatus(data.status);

      if (data.responses?.length) {
        const enrichedResponses = await Promise.all(
          data.responses.map(async (resp) => {
            const enriched = await Promise.all(
              (resp.attachments || []).map(async (a) => {
                const info =
                  a.itemType === "Product"
                    ? await getProductById(a.itemId)
                    : await getSparePartById(a.itemId);
                return {
                  ...a,
                  name: info.name,
                  price: info.price,
                  imageUrls: info.imageUrls,
                };
              })
            );
            return { ...resp, enrichedAttachments: enriched };
          })
        );
        setPreviousResponses(enrichedResponses);
      }
    });

    fetchAllProducts().then(setProducts);
    fetchAllSpareParts().then(setSpareParts);
  }, [id]);

  const handleAddAttachment = async (type, itemId) => {
    if (!itemId) return;
    const info =
      type === "Product"
        ? await getProductById(itemId)
        : await getSparePartById(itemId);

    setAttachments((prev) => [
      ...prev,
      {
        itemType: type,
        itemId,
        name: info.name,
        price: info.price,
        imageUrls: info.imageUrls,
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) return toast.error("Description is required");

    toast.promise(
      postAdminResponse(id, {
        description,
        attachments: attachments.map(({ itemType, itemId }) => ({
          itemType,
          itemId,
        })),
      }).then(() => updateRequestStatus(id, status)),
      {
        loading: "Sending response...",
        success: () => {
          navigate("/requests");
          return "Response sent!";
        },
        error: "Failed to send response",
      }
    );
  };

  if (!request)
    return (
      <Layout>
        <p className="p-6">Loading...</p>
      </Layout>
    );
  return (
    <>
      <Layout>
        <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-moodark">
            Answer Request
          </h2>

          {/* ✅ Request Info */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Request Details
            </h3>
            <p className="text-gray-700 mb-1">
              <strong>Name:</strong> {request.name || "Unnamed"}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Description:</strong>{" "}
              {request.description || "No description provided"}
            </p>

            {request.imageUrls?.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {request.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Upload ${i + 1}`}
                    onClick={() => setPreviewIndex(i)}
                    className="w-24 h-24 object-cover rounded-md border cursor-pointer hover:scale-105 transition"
                  />
                ))}
              </div>
            )}
          </div>

          {/* ✅ Previous Responses */}
          {previousResponses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Previous Responses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {previousResponses.map((resp, i) => (
                  <div key={i} className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Description:</strong> {resp.description}
                    </p>
                    <div className="grid gap-2">
                      {resp.enrichedAttachments.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 border bg-white rounded"
                        >
                          <img
                            src={item.imageUrls?.[0] || "/Logo.svg"}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold text-sm text-moodark">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.itemType}
                            </p>
                            <p className="text-sm text-gray-700 font-medium">
                              €{item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Response Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Attach Product
              </label>
              <select
                onChange={(e) => {
                  handleAddAttachment("Product", e.target.value);
                  e.target.selectedIndex = 0;
                }}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Attach Spare Part
              </label>
              <select
                onChange={(e) => {
                  handleAddAttachment("SparePart", e.target.value);
                  e.target.selectedIndex = 0;
                }}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="">Select spare part...</option>
                {spareParts.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Request Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="Pending">Pending</option>
                <option value="Answered">Answered</option>
                <option value="Additional Info Required">
                  Additional Info Required
                </option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {attachments.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="relative border rounded-xl shadow-sm p-3 flex gap-4 items-center bg-white hover:shadow-md transition"
                    >
                      <img
                        src={item.imageUrls?.[0] || "/Logo.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-moodark">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500">{item.itemType}</p>
                        <p className="text-sm text-gray-700 font-medium">
                          €{item.price}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        className="absolute top-1 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <button
              type="submit"
              className="bg-moogreen hover:bg-moodark text-white px-6 py-2 rounded-full"
            >
              Submit Response
            </button>
          </form>
        </div>
      </Layout>
      {previewIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setPreviewIndex(null)}
        >
          <div
            className="relative max-w-3xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={request.imageUrls[previewIndex]}
              alt="Preview"
              className="w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
            />
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute top-4 right-12 text-red-700 text-2xl font-bold"
            >
              ×
            </button>

            {/* Prev button */}
            {previewIndex > 0 && (
              <button
                onClick={() => setPreviewIndex(previewIndex - 1)}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white text-3xl font-bold"
              >
                ‹
              </button>
            )}
            {/* Next button */}
            {previewIndex < request.imageUrls.length - 1 && (
              <button
                onClick={() => setPreviewIndex(previewIndex + 1)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white text-3xl font-bold"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
