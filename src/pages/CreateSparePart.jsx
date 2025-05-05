import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  createSparePart,
  uploadSparePartImages,
  fetchAllProducts,
  updateSparePart,
  linkProductToSparePart,
} from "../api/productsDb";

export default function CreateSparePart() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrls: [],
  });

  const [products, setProducts] = useState([]);
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    fetchAllProducts().then(setProducts);
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setNewImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setNewImages((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...newImages];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setNewImages(reordered);
    setDragIndex(index);
  };

  const handleLinkProduct = () => {
    if (
      !selectedProductId ||
      linkedProducts.some((p) => p.id.toString() === selectedProductId)
    )
      return;
    const product = products.find((p) => p.id.toString() === selectedProductId);
    if (product) {
      setLinkedProducts((prev) => [...prev, product]);
      setSelectedProductId("");
    }
  };

  const handleUnlinkProduct = (id) => {
    setLinkedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    toast.promise(
      (async () => {
        let created;
        try {
          created = await createSparePart( {
            ...form,
            imageUrls: [],
          });
        } catch (err) {
          console.error("❌ createSparePart failed:", err);
          throw err;
        }

        let uploadedImageUrls = [];
        if (newImages.length > 0) {
          uploadedImageUrls = await uploadSparePartImages(
            created.id,
            newImages
          );

          await updateSparePart(created.id, {
            ...form,
            id: created.id,
            imageUrls: uploadedImageUrls,
          });
        }

        for (const product of linkedProducts) {
            try {
              await linkProductToSparePart(created.id, product.id);
            } catch (err) {
              console.error(`❌ Failed to link product ${product.name}:`, err);
              toast.error(`Failed to link: ${product.name}`);
            }
          }          

        navigate("/products");
      })(),
      {
        loading: "Creating spare part...",
        success: "Spare part created!",
        error: "Failed to create spare part",
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold text-moodark mb-6">
          Add New Spare Part
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

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Images
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
                  <div
                    key={i}
                    className="relative cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                  >
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

          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Related Products
            </h4>
            {linkedProducts.length > 0 && (
              <div className="space-y-3 mb-3">
                {linkedProducts.map((p) => {
                  const image = p.imageUrls?.[0] || "/Logo.svg";
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="text-gray-800 font-medium text-sm">
                          {p.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnlinkProduct(p.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Unlink
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
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
            Create Spare Part
          </button>
        </form>
      </div>
    </Layout>
  );
}
