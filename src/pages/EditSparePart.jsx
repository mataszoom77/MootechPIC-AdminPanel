import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  getSparePartById,
  updateSparePart,
  uploadSparePartImages,
  fetchAllProducts,
  fetchProductsForSparePart,
  linkProductToSparePart, // ✅ this was missing
  unlinkProductFromSparePart, // ✅ also needed
} from "../api/productsDb";

export default function EditSparePart() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [sparePart, setSparePart] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrls: [],
  });
  const [newImages, setNewImages] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  useEffect(() => {
    Promise.all([
      getSparePartById(token, id),
      fetchAllProducts(token),
      fetchProductsForSparePart(token, id),
    ])
      .then(([data, allProds, linkedProds]) => {
        setSparePart(data);
        setForm({
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrls: [...data.imageUrls],
        });
        setAllProducts(allProds);
        setRelatedProducts(linkedProds);
      })
      .catch(console.error);
  }, [token, id]);
  const handleLinkProduct = async () => {
    if (!selectedProductId) return;
    await linkProductToSparePart(token, id, selectedProductId);
    const updated = await fetchProductsForSparePart(token, id);
    setRelatedProducts(updated);
    setSelectedProductId("");
  };

  const handleUnlinkProduct = async (productId) => {
    await unlinkProductFromSparePart(token, id, productId);
    setRelatedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (url) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((img) => img !== url),
    }));
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...form.imageUrls];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setForm((prev) => ({ ...prev, imageUrls: reordered }));
    setDragIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    toast.promise(
      (async () => {
        let uploadedImageUrls = [];
        if (newImages.length > 0) {
          uploadedImageUrls = await uploadSparePartImages(token, id, newImages);
        }

        const updatedForm = {
          ...form,
          id,
          imageUrls: [...form.imageUrls, ...uploadedImageUrls],
        };

        await updateSparePart(token, id, updatedForm);
      })().then(() => navigate("/products")),
      {
        loading: "Saving changes...",
        success: "Spare part updated!",
        error: "Failed to update spare part",
      }
    );
  };

  if (!sparePart)
    return (
      <Layout>
        <p className="p-8">Loading...</p>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold text-moodark mb-6">
          Edit Spare Part
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Price (€)</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              required
            />
          </div>

          {/* Image preview with drag-and-drop */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              Current Photos (Drag to Reorder)
            </h4>
            <div className="flex gap-3 flex-wrap">
              {form.imageUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                >
                  <img
                    src={url}
                    alt={`img-${i}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* New image upload */}
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-2">
              Add New Images
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-500"
            >
              Drag & drop images here or
              <label className="block mt-2 text-moogreen cursor-pointer">
                <span className="underline">Browse files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            {newImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {newImages.map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${i}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(i)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          {/* Related products */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-2">
              Related Products
            </h4>
            {relatedProducts.length > 0 ? (
              <div className="space-y-3">
                {relatedProducts.map((prod) => {
                  const image = prod.imageUrls?.[0] || "/Logo.svg";
                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={image}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="text-gray-800 font-medium text-sm">
                          {prod.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnlinkProduct(prod.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Unlink
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No related products.</p>
            )}
          </div>
          <div className="mt-4">
            <label className="block font-medium text-gray-700 mb-1">
              Link Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            >
              <option value="">Select product...</option>
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleLinkProduct}
              className="mt-2 bg-moogreen hover:bg-moodark text-white py-2 px-4 rounded-full transition"
            >
              Add Product
            </button>
          </div>
          <button
            type="submit"
            className="bg-moogreen hover:bg-moodark text-white font-semibold py-3 px-6 rounded-full transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </Layout>
  );
}
