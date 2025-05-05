import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  createProduct,
  uploadProductImages,
  updateProduct,
  fetchAllCategories,
  fetchAllSpareParts,
  linkSparePartToProduct,
} from "../api/productsDb";

export default function CreateProduct() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrls: [],
  });

  const [categories, setCategories] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [linkedParts, setLinkedParts] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    fetchAllCategories().then(setCategories);
    fetchAllSpareParts().then(setSpareParts);
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

  const handleLinkPart = () => {
    if (!selectedPartId || linkedParts.some((p) => p.id === selectedPartId))
      return;
    const part = spareParts.find((p) => p.id === selectedPartId);
    if (part) {
      setLinkedParts((prev) => [...prev, part]);
      setSelectedPartId("");
    }
  };

  const handleUnlinkPart = (id) => {
    setLinkedParts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    toast.promise(
      (async () => {
        let created;
  
        try {
          created = await createProduct({ ...form, imageUrls: [] });
        } catch (err) {
          console.error('❌ createProduct failed:', err);
          throw err;
        }
  
        let uploadedImageUrls = [];
        if (newImages.length > 0) {
          try {
            uploadedImageUrls = await uploadProductImages(created.id, newImages);
          } catch (err) {
            console.error('❌ uploadProductImages failed:', err);
            throw err;
          }
  
          try {
            await updateProduct(created.id, {
              ...form,
              id: created.id,
              imageUrls: uploadedImageUrls,
            });
          } catch (err) {
            console.error('❌ updateProduct failed:', err);
            throw err;
          }
        }
  
        for (const part of linkedParts) {
          try {
            await linkSparePartToProduct(created.id, part.id);
          } catch (err) {
            console.error(`❌ linkSparePartToProduct failed for ${part.name}:`, err);
            throw err;
          }
        }
  
        navigate('/products');
      })(),
      {
        loading: 'Creating product...',
        success: 'Product created!',
        error: 'Failed to create product',
      }
    );
  };
  

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold text-moodark mb-6">
          Add New Product
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
            <label className="block font-medium text-gray-700">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              required
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
              Related Spare Parts
            </h4>
            {linkedParts.length > 0 && (
              <div className="space-y-3 mb-3">
                {linkedParts.map((sp) => {
                  const image = sp.imageUrls?.[0] || "/Logo.svg";
                  return (
                    <div
                      key={sp.id}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={image}
                          alt={sp.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="text-gray-800 font-medium text-sm">
                          {sp.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnlinkPart(sp.id)}
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
              value={selectedPartId}
              onChange={(e) => setSelectedPartId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            >
              <option value="">Select spare part...</option>
              {spareParts.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleLinkPart}
              className="mt-2 bg-moogreen hover:bg-moodark text-white py-2 px-4 rounded-full transition"
            >
              Add Spare Part
            </button>
          </div>

          <button
            type="submit"
            className="bg-moogreen hover:bg-moodark text-white font-semibold py-3 px-6 rounded-full transition"
          >
            Create Product
          </button>
        </form>
      </div>
    </Layout>
  );
}
