import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: ''
  })
  const [editId, setEditId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null)

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL + "/products/")
      setProducts(response.data.products || [])
    } catch (error) {
      setError("Error fetching products")
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e) {
    if (e) e.preventDefault(); // Prevents page reload
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_URL}/products/search/?name=${searchQuery}`)
      setProducts(response.data.products || [])
    } catch (error) {
      setError("Error searching products")
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("");
    fetchProducts();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.quantity) {
      setError("All fields are required")
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (editId) {
        await axios.put(`${API_URL}/products/${editId}`, form)
        setError("Product updated successfully")
      } else {
        await axios.post(`${API_URL}/products/`, form)
        setError("Product added successfully")
      }
      setForm({ name: '', description: '', price: '', quantity: '' })
      setEditId(null)
      fetchProducts()
    } catch (error) {
      setError("Error adding/updating product")
    } finally {
      setLoading(false)
    } 
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`${API_URL}/products/${id}`)
      fetchProducts()
    } catch (error) {
      setError("Error deleting product")
    }
  }

  async function handleEdit(product) {
    setEditId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity
    })
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    setForm({...form, [name]: value})
  }

  const startEdit = (product) => {
    setEditId(product._id)
      setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity
    })
  }

  const resetForm = () => {
    setEditId(null);
    setForm({ name: '', description: '', price: '', quantity: '' });
    setError(null);
  };
  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <span className="logo-badge">⚡</span>
          <div>
            <h1>FastAPI Product Control Center</h1>
          </div>
        </div>
      </header>
      {error && (
        <div className="error-alert">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="error-close-btn">&times;</button>
        </div>
      )}
      <div className="dashboard-grid">
        {/* Left Side: Create / Edit Form */}
        <section className="panel-card form-panel">
          <h2>{editId ? '📝 Edit Product' : '➕ Add Product'}</h2>
          <form onSubmit={handleSubmit} className="crud-form">
            <div className="input-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Mechanical Keyboard"
                required
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Product details..."
                rows={3}
              />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-submit" disabled={loading}>
                {editId ? 'Update Item' : 'Create Item'}
              </button>
              {editId && (
                <button type="button" onClick={resetForm} className="btn btn-cancel">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
        {/* Right Side: Product List & Search */}
        <section className="panel-card list-panel">
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name..."
              />
              <button type="submit" className="btn btn-search">Search</button>
              {searchQuery && (
                <button type="button" onClick={clearSearch} className="btn btn-clear">
                  Reset
                </button>
              )}
            </form>
          </div>
          {loading && products.length === 0 ? (
            <div className="skeleton-list">
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-card skeleton-pulse">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-desc"></div>
                  <div className="skeleton-footer"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-placeholder">
              <span className="empty-graphic">📦</span>
              <h3>No Products Available</h3>
              <p>Add a new product or adjust your search.</p>
            </div>
          ) : (
            <div className="product-layout-grid">
              {products.map((product) => {
                const isEditing = product._id === editId;
                return (
                  <div
                    key={product._id}
                    className={`product-card-item ${isEditing ? 'editing' : ''}`}
                  >
                    <div className="card-top">
                      <h3>{product.name}</h3>
                      <span className="price-tag">${parseFloat(product.price).toFixed(2)}</span>
                    </div>
                    <p className="card-desc">
                      {product.description || 'No description provided.'}
                    </p>
                    <div className="card-bottom">
                      <span className="stock-level">
                        In Stock: <strong>{product.quantity}</strong>
                      </span>
                      <div className="card-actions">
                        <button
                          onClick={() => startEdit(product)}
                          className="btn-card btn-card-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="btn-card btn-card-delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
  