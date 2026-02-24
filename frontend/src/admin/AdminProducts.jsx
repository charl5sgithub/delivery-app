import React, { useEffect, useState } from 'react';
import { getItems, createItem, updateItem, deleteItem } from '../services/api';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        image: ''
    });

    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getItems();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', price: '', category: '', image: '' });
        setModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image
        });
        setModalOpen(true);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await updateItem(editingProduct.id, formData);
            } else {
                await createItem(formData);
            }
            setModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = (product) => {
        setDialogConfig({
            isOpen: true,
            title: 'Delete Product',
            message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await deleteItem(product.id);
                    setDialogConfig(prev => ({ ...prev, isOpen: false }));
                    fetchProducts();
                } catch (error) {
                    console.error('Error deleting product:', error);
                }
            }
        });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Product Management</h2>
                <div className="admin-actions">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search products..."
                        value={search}
                        onChange={handleSearch}
                    />
                    <button className="cta-button" style={{ marginTop: 0 }} onClick={openCreateModal}>
                        + Add Product
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading products...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No products found.</td></tr>
                        ) : (
                            filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                                    <td>
                                        <span className="status-badge" style={{ background: '#e5e7eb', color: '#374151' }}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600, color: '#10b981' }}>£{product.price}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => openEditModal(product)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target.className.includes('modal-overlay')) setModalOpen(false); }}>
                <div className="modal-content">
                    <button className="close-modal" onClick={() => setModalOpen(false)}>×</button>
                    <div className="modal-header">
                        <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                        <p>{editingProduct ? `Updating ${editingProduct.name}` : 'Fill in the details below to create a new product.'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="checkout-form" style={{ maxWidth: '100%', marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Product Name *</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="form-input"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder="e.g. King Fish"
                            />
                        </div>
                        <div className="form-group">
                            <label>Price (£) *</label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                required
                                className="form-input"
                                value={formData.price}
                                onChange={handleFormChange}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                name="category"
                                required
                                className="form-input"
                                value={formData.category}
                                onChange={handleFormChange}
                            >
                                <option value="">Select Category</option>
                                <option value="Fish">Fish</option>
                                <option value="Seafood">Seafood</option>
                                <option value="Chicken">Chicken</option>
                                <option value="Meat">Meat</option>
                                <option value="Grocery">Grocery</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Image URL *</label>
                            <input
                                name="image"
                                type="text"
                                required
                                className="form-input"
                                value={formData.image}
                                onChange={handleFormChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="cta-button"
                                style={{ flex: 2, marginTop: 0 }}
                            >
                                {editingProduct ? 'Update Product' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={dialogConfig.isOpen}
                title={dialogConfig.title}
                message={dialogConfig.message}
                onConfirm={dialogConfig.onConfirm}
                onCancel={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
                confirmText="Delete"
            />
        </div>
    );
}
