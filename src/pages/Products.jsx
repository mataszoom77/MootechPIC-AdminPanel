import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  fetchAllProducts,
  fetchAllSpareParts,
  fetchAllCategories,
  deleteProduct,
  deleteSparePart,
} from "../api/productsDb";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Products() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    Promise.all([
      fetchAllProducts(),
      fetchAllSpareParts(),
      fetchAllCategories()
    ])
      .then(([productsData, sparePartsData, categoriesData]) => {
        setProducts(productsData);
        setSpareParts(sparePartsData);
        setCategories(categoriesData);
      })
      .catch(console.error);
  }, [token]);

  const filteredProducts = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoryName === selectedCategory;
    return matchesName && matchesCategory;
  });

  const filteredSpareParts = spareParts.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleDeleteProduct = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    toast.promise(
      deleteProduct(id).then(() =>
        setProducts((p) => p.filter((prod) => prod.id !== id))
      ),
      {
        loading: "Deleting product...",
        success: "Product deleted!",
        error: "Failed to delete product",
      }
    );
  };

  const handleDeleteSparePart = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this spare part?");
    if (!confirmed) return;

    toast.promise(
      deleteSparePart(id).then(() =>
        setSpareParts((p) => p.filter((part) => part.id !== id))
      ),
      {
        loading: "Deleting spare part...",
        success: "Spare part deleted!",
        error: "Failed to delete spare part",
      }
    );
  };

  return (
    <Layout>
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-3xl font-semibold text-moodark">
            Products & Spare Parts
          </h2>
          <div className="flex gap-3 flex-wrap">
            <button className="bg-moogreen hover:bg-moodark text-white px-4 py-2 rounded-full transition" onClick={() => navigate("/products/create")}>Add Product</button>
            <button className="bg-moogreen hover:bg-moodark text-white px-4 py-2 rounded-full transition" onClick={() => navigate("/spare-part/create")}>Add Spare Part</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setSelectedCategory("");
            }}
            className="border px-4 py-2 rounded-lg"
          >
            <option value="all">All</option>
            <option value="product">Products</option>
            <option value="sparepart">Spare Parts</option>
          </select>

          {filterType === "product" && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border px-4 py-2 rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-6 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-moogreen"
          />
        </div>

        {(filterType === "all" || filterType === "product") && (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Products</h3>
            <div className="grid gap-6 mb-10">
              {filteredProducts.map((product) => {
                const image = product.imageUrls.length > 0 ? product.imageUrls[0] : "/Logo.svg";
                return (
                  <div key={product.id} className="flex items-start gap-4 bg-white shadow rounded-xl p-6 border border-gray-100">
                    <img src={image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800">{product.name}</h4>
                      <p className="text-gray-600 mb-1">{product.description}</p>
                      <p className="text-gray-500 text-sm">
                        <span className="font-medium">Category:</span> {product.categoryName} &nbsp;|&nbsp;
                        <span className="font-medium">Price:</span> €{product.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/products/${product.id}/edit`)} className="text-sm text-white bg-moogreen px-4 py-1.5 rounded-full hover:bg-moodark transition">Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-sm text-white bg-red-500 px-4 py-1.5 rounded-full hover:bg-red-600 transition">Delete</button>
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && <p className="text-gray-500 italic text-center">No matching products found.</p>}
            </div>
          </>
        )}

        {(filterType === "all" || filterType === "sparepart") && (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Spare Parts</h3>
            <div className="grid gap-6">
              {filteredSpareParts.map((part) => {
                const image = part.imageUrls.length > 0 ? part.imageUrls[0] : "/Logo.svg";
                return (
                  <div key={part.id} className="flex items-start gap-4 bg-white shadow rounded-xl p-6 border border-gray-100">
                    <img src={image} alt={part.name} className="w-24 h-24 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800">{part.name}</h4>
                      <p className="text-gray-600 mb-1">{part.description}</p>
                      <p className="text-gray-500 text-sm">
                        <span className="font-medium">Price:</span> €{part.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/spareparts/${part.id}/edit`)} className="text-sm text-white bg-moogreen px-4 py-1.5 rounded-full hover:bg-moodark transition">Edit</button>
                      <button onClick={() => handleDeleteSparePart(part.id)} className="text-sm text-white bg-red-500 px-4 py-1.5 rounded-full hover:bg-red-600 transition">Delete</button>
                    </div>
                  </div>
                );
              })}
              {filteredSpareParts.length === 0 && <p className="text-gray-500 italic text-center">No matching spare parts found.</p>}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
