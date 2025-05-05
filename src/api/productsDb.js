
import { authFetch } from './authFetch';

export async function fetchAllProducts() {
  return await authFetch(`/products`);
}

export async function fetchAllSpareParts() {
  return await authFetch(`/spareparts`);
}


export async function deleteProduct(id) {
  return await authFetch(`/products/${id}`, { method: "DELETE" });
}

export async function deleteSparePart(id) {
  return await authFetch(`/spareparts/${id}`, { method: "DELETE" });
}

export async function getProductById(id) {
  return await authFetch(`/products/${id}`);
}

export async function getSparePartById(id) {
  return await authFetch(`/spareparts/${id}`);
}

export async function updateProduct(id, data) {
  return await authFetch(`/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function updateSparePart(id, data) {
  return await authFetch(`/spareparts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function fetchAllCategories() {
  return await authFetch(`/categories`);
}

export async function uploadProductImages(productId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return await authFetch(
    `/images/upload-multiple?itemId=${productId}&itemType=Product`,
    { method: "POST", body: formData }
  );
}

export async function uploadSparePartImages(sparePartId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return await authFetch(
    `/images/upload-multiple?itemId=${sparePartId}&itemType=SparePart`,
    { method: "POST", body: formData }
  );
}

export async function linkSparePartToProduct(productId, sparePartId) {
  return await authFetch(`/products/${productId}/spareparts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sparePartId })
  });
}

export async function unlinkSparePartFromProduct(productId, sparePartId) {
  return await authFetch(`/products/${productId}/spareparts/${sparePartId}`, {
    method: "DELETE"
  });
}

export async function fetchSparePartsForProduct(productId) {
  return await authFetch(`/products/${productId}/spareparts`);
}

export async function fetchProductsForSparePart(sparePartId) {
  return await authFetch(`/spareparts/${sparePartId}/products`);
}

export async function linkProductToSparePart(sparePartId, productId) {
  return await authFetch(`/spareparts/${sparePartId}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId })
  });
}

export async function unlinkProductFromSparePart(sparePartId, productId) {
  return await authFetch(`/spareparts/${sparePartId}/products/${productId}`, {
    method: "DELETE"
  });
}

export async function removeProductImage(productId, imageUrl) {
  return await authFetch(`/products/${productId}/images`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl })
  });
}

export async function createProduct(data) {
  return await authFetch(`/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function createSparePart(data) {
  return await authFetch(`/spareparts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}
