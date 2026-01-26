import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Sort State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [search, setSearch] = useState('');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Order Selection for Route
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [page, sortBy, sortOrder]); // Auto-refresh when these change

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page,
                limit,
                sortBy,
                sortOrder,
                search
            }).toString();

            const res = await fetch(`${API_URL}/api/orders?${query}`);
            const data = await res.json();

            if (data.data) {
                setOrders(data.data);
                setTotalPages(data.totalPages);
            } else {
                setOrders([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on search
        fetchOrders();
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc'); // Default to desc for new field
        }
    };

    const handleExport = () => {
        // Trigger download
        const query = new URLSearchParams({ search }).toString();
        window.open(`${API_URL}/api/orders/export?${query}`, '_blank');
    };

    const handleRowClick = async (orderId) => {
        setModalOpen(true);
        setDetailsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}`);
            const data = await res.json();
            setSelectedOrder(data);
            setDetailsLoading(false);
        } catch (error) {
            console.error("Error fetching details:", error);
            setDetailsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            // Refresh
            fetchOrders();
            // Close or update modal
            setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedOrder(null);
    };

    // Helper for Sort Icons
    const renderSortIcon = (field) => {
        if (sortBy !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const toggleOrderSelection = (id, e) => {
        e.stopPropagation(); // Don't trigger row click
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
        );
    };

    const handleCalculateRoute = () => {
        if (selectedOrderIds.length === 0) {
            alert("Please select at least one order to calculate a route.");
            return;
        }
        const ids = selectedOrderIds.join(',');
        navigate(`/admin/delivery?orderIds=${ids}`);
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Order Management</h2>
                <div className="admin-actions">
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by customer name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="login-button" style={{ marginTop: 0, width: 'auto' }}>Search</button>
                    </form>
                    <button className="btn-secondary" onClick={handleExport}>
                        Export CSV
                    </button>
                    {selectedOrderIds.length > 0 && (
                        <button className="cta-button" onClick={handleCalculateRoute} style={{ marginTop: 0, width: 'auto', backgroundColor: '#10b981' }}>
                            Calculate Route ({selectedOrderIds.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedOrderIds(orders.map(o => o.order_id));
                                        else setSelectedOrderIds([]);
                                    }}
                                    checked={selectedOrderIds.length === orders.length && orders.length > 0}
                                />
                            </th>
                            <th onClick={() => handleSort('order_id')}>Order ID {renderSortIcon('order_id')}</th>
                            <th>Customer</th>
                            <th onClick={() => handleSort('created_at')}>Date {renderSortIcon('created_at')}</th>
                            <th onClick={() => handleSort('order_status')}>Status {renderSortIcon('order_status')}</th>
                            <th onClick={() => handleSort('total_amount')}>Total {renderSortIcon('total_amount')}</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No orders found.</td></tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.order_id} onClick={() => handleRowClick(order.order_id)}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrderIds.includes(order.order_id)}
                                            onChange={(e) => toggleOrderSelection(order.order_id, e)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                    <td>#{String(order.order_id).substring(0, 8)}...</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{order.customers?.name || 'Guest'}</div>
                                        <small style={{ color: '#6b7280' }}>{order.customers?.email}</small>
                                    </td>
                                    <td>{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                        <span className={`status-badge status-${order.order_status?.toLowerCase()}`}>
                                            {order.order_status}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>₹{order.total_amount}</td>
                                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {order.addresses?.address_line1}, {order.addresses?.city}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="pagination">
                    <span className="page-info">
                        Page {page} of {totalPages}
                    </span>
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => {
                            // Show limited pages if too many
                            if (totalPages > 7 && Math.abs(page - (i + 1)) > 2 && i !== 0 && i !== totalPages - 1) {
                                if (i === 1 || i === totalPages - 2) return <span key={i}>...</span>;
                                return null;
                            }
                            return (
                                <button
                                    key={i}
                                    className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                                    style={page === i + 1 ? { backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' } : {}}
                                    onClick={() => setPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                        <button
                            className="page-btn"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target.className.includes('modal-overlay')) closeModal(); }}>
                <div className="modal-content">
                    <button className="close-modal" onClick={closeModal}>×</button>

                    {detailsLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Details...</div>
                    ) : !selectedOrder ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Select an order to view details.</div>
                    ) : selectedOrder.error ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                            Error loading details: {selectedOrder.error}
                        </div>
                    ) : (
                        <>
                            <div className="modal-header">
                                <h3>Order #{selectedOrder.order_id}</h3>
                                <p>Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Customer Details</h4>
                                <div className="detail-row">
                                    <span className="detail-label">Name</span>
                                    <span className="detail-value">{selectedOrder.customers?.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value">{selectedOrder.customers?.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Phone</span>
                                    <span className="detail-value">{selectedOrder.customers?.phone}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Delivery Address</h4>
                                <div style={{ color: '#1f2937', fontWeight: 500 }}>
                                    {selectedOrder.addresses?.address_line1}<br />
                                    {selectedOrder.addresses?.city}, {selectedOrder.addresses?.country}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Items Ordered</h4>
                                <div className="items-list">
                                    {selectedOrder.order_items?.map((item, idx) => (
                                        <div className="item-row" key={idx}>
                                            <div className="item-name" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {item.items?.image && (
                                                    <img src={item.items.image} alt={item.items.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                )}
                                                <div>
                                                    {item.items?.name || 'Unknown Item'}
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="item-price">
                                                ₹{item.price * item.quantity}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="item-row" style={{ borderTop: '2px solid #e5e7eb', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 700 }}>
                                        <span>Total Amount</span>
                                        <span>₹{selectedOrder.total_amount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Payment Status</h4>
                                <div className="detail-row">
                                    <span className="detail-label">Status</span>
                                    <span className={`status-badge status-${selectedOrder.order_status?.toLowerCase()}`}>
                                        {selectedOrder.order_status}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Payment ID</span>
                                    <span className="detail-value" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        {selectedOrder.payments?.[0]?.transaction_id || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem', display: 'flex', gap: '10px' }}>
                                {selectedOrder.order_status !== 'DELIVERING' && (
                                    <button
                                        className="cta-button"
                                        style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        onClick={() => handleUpdateStatus(selectedOrder.order_id, 'DELIVERING')}
                                    >
                                        Mark as Delivering
                                    </button>
                                )}
                                {selectedOrder.order_status === 'DELIVERING' && (
                                    <button
                                        className="cta-button"
                                        style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#10b981' }}
                                        onClick={() => handleUpdateStatus(selectedOrder.order_id, 'COMPLETED')}
                                    >
                                        Mark as Completed
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
