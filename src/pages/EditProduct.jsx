import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  getProductById,
  updateProduct,
  uploadProductImages,
  fetchAllCategories,
  fetchAllSpareParts,
  linkSparePartToProduct,
  unlinkSparePartFromProduct,
  fetchSparePartsForProduct
} from '../api/productsDb';

export default function EditProduct() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', imageUrls: [] });
  const [categories, setCategories] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [relatedParts, setRelatedParts] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [search, setSearch] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    Promise.all([
      getProductById(id),
      fetchAllCategories(),
      fetchAllSpareParts(),
      fetchSparePartsForProduct(id)
    ])
      .then(([productData, categoryData, sparePartData, linkedParts]) => {
        setProduct(productData);
        setForm({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          categoryId: productData.categoryId,
          imageUrls: [...productData.imageUrls]
        });
        setCategories(categoryData);
        setSpareParts(sparePartData);
        setRelatedParts(linkedParts);
      })
      .catch(console.error);
  }, [token, id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setNewImages(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (url) => {
    setForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter(img => img !== url)
    }));
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...form.imageUrls];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setForm(prev => ({ ...prev, imageUrls: reordered }));
    setDragIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    toast.promise(
      (async () => {
        let uploadedImageUrls = [];
        if (newImages.length > 0) {
          uploadedImageUrls = await uploadProductImages(id, newImages);
        }

        const updatedForm = {
          ...form,
          id,
          imageUrls: [...form.imageUrls, ...uploadedImageUrls]
        };

        await updateProduct(id, updatedForm);
      })().then(() => navigate('/products')),
      {
        loading: 'Saving changes...',
        success: 'Product updated!',
        error: 'Failed to update product',
      }
    );
  };

  const handleUnlinkSparePart = async (partId) => {
    toast.promise(
      (async () => {
        await unlinkSparePartFromProduct(id, partId);
        const updated = await fetchSparePartsForProduct(id);
        setRelatedParts(updated);
      })(),
      {
        loading: 'Unlinking...',
        success: 'Spare part removed.',
        error: 'Failed to unlink spare part.'
      }
    );
  };
  

  const handleLinkSparePart = async () => {
    if (!selectedPartId) return;
  
    toast.promise(
      (async () => {
        await linkSparePartToProduct(id, selectedPartId);
        const updated = await fetchSparePartsForProduct(id);
        setRelatedParts(updated);
      })(),
      {
        loading: 'Linking spare part...',
        success: 'Spare part added!',
        error: 'Failed to link spare part'
      }
    );
  
    setSelectedPartId('');
  };
  

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!product) return <Layout><p className="p-8">Loading...</p></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold text-moodark mb-6">Edit Product</h2>

        {/* Image preview with drag-and-drop */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-2">Current Photos (Drag to Reorder)</h4>
          <div className="flex gap-3 flex-wrap">
            {form.imageUrls.map((url, i) => (
              <div
                key={i}
                className="relative cursor-move"
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
              >
                <img src={url} alt={`img-${i}`} className="w-24 h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                >×</button>
              </div>
            ))}
          </div>
        </div>

        {/* New image upload with preview */}
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Add New Images</label>
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
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

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
            <label className="block font-medium text-gray-700">Description</label>
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
            <input
              type="text"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              required
            >
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

        {/* Related spare parts list with image */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Related Spare Parts</h4>
          {relatedParts.length > 0 ? (
            <div className="space-y-3">
              {relatedParts.map(sp => {
                const image = sp.imageUrls?.length > 0 ? sp.imageUrls[0] : '/Logo.svg';
                return (
                  <div key={sp.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <img src={image} alt={sp.name} className="w-10 h-10 object-cover rounded" />
                      <span className="text-gray-800 font-medium text-sm">{sp.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnlinkSparePart(sp.id)}
                      className="text-xs text-red-600 hover:underline"
                    >Unlink</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">No linked spare parts.</p>
          )}
        </div>

          <div className="mt-4">
            <label className="block font-medium text-gray-700 mb-1">Link Spare Part</label>
            <select
              value={selectedPartId}
              onChange={(e) => setSelectedPartId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            >
              <option value="">Select spare part...</option>
              {spareParts.map(sp => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleLinkSparePart}
              className="mt-2 bg-moogreen hover:bg-moodark text-white py-2 px-4 rounded-full transition"
            >Add Spare Part</button>
          </div>

          <button
            type="submit"
            className="bg-moogreen hover:bg-moodark text-white font-semibold py-3 px-6 rounded-full transition"
          >Save Changes</button>
        </form>
      </div>
    </Layout>
  );
}