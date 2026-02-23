import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../components/ConfirmationDialog';

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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [orderIdFilter, setOrderIdFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Order Selection for Route
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [dialogConfig, setDialogConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
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
                search,
                startDate,
                endDate,
                orderId: orderIdFilter,
                status: statusFilter
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
        if (e) e.preventDefault();
        setPage(1); // Reset to page 1 on search
        fetchOrders();
    };

    const handleReset = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        setOrderIdFilter('');
        setStatusFilter('');
        setPage(1);
        // We can trigger fetch immediately or wait for use effect if we add dependencies, 
        // but current useEffect depends on page/sort. 
        // So we need to manually trigger fetch after state update or add dependencies.
        // Actually, since state updates are async, it's better to rely on a separate specific useEffect or just call fetch manually with cleared values.
        // Or cleaner: make fetch depend on these filters? 
        // Current design calls fetchOrders in useEffect only for pagination/sort. 
        // Search is manual. Let's keep filters manual to avoid too many fetches while typing.

        // To ensure we fetch with cleared values immediately:
        // We can pass empty values to fetchOrders or just let the next render cycle handle it if we add them to useEffect.
        // But for now, let's just reload page 1 which will re-trigger? No, handleReset is manual.
        // Let's force a fetch with empty values.
        setLoading(true);
        const query = new URLSearchParams({
            page: 1, limit, sortBy, sortOrder, search: '', startDate: '', endDate: '', orderId: '', status: ''
        }).toString();
        fetch(`${API_URL}/api/orders?${query}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setOrders(data.data);
                    setTotalPages(data.totalPages);
                } else {
                    setOrders([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
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
            setDialogConfig({
                isOpen: true,
                title: "No Orders Selected",
                message: "Please select at least one order to calculate a route.",
                isAlert: true,
                onConfirm: () => setDialogConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }
        const ids = selectedOrderIds.join(',');
        navigate(`/admin/delivery?orderIds=${ids}`);
    };

    return (
        <div className="admin-page">
            <div className="admin-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <h2>Order Management</h2>
                    <div className="admin-actions">
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

                <form onSubmit={handleSearch} style={{
                    display: 'flex',
                    gap: '10px',
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    flexWrap: 'wrap',
                    alignItems: 'end'
                }}>
                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Date Range</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input
                                type="date"
                                className="search-input"
                                style={{ width: '130px' }}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span style={{ alignSelf: 'center' }}>-</span>
                            <input
                                type="date"
                                className="search-input"
                                style={{ width: '130px' }}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Order ID</label>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="e.g. 101"
                            style={{ width: '100px' }}
                            value={orderIdFilter}
                            onChange={(e) => setOrderIdFilter(e.target.value)}
                        />
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Status</label>
                        <select
                            className="search-input"
                            style={{ width: '130px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="DELIVERING">Delivering</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Customer Search</label>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by customer name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="login-button" style={{ marginTop: 0, width: 'auto', height: '42px' }}>Filter</button>
                        <button type="button" className="btn-secondary" onClick={handleReset} style={{ marginTop: 0, height: '42px' }}>Reset</button>
                    </div>
                </form>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            const selectableIds = orders
                                                .filter(o => o.order_status !== 'COMPLETED' && o.order_status !== 'CANCELLED' && o.order_status !== 'DELIVERED')
                                                .map(o => o.order_id);
                                            setSelectedOrderIds(selectableIds);
                                        } else {
                                            setSelectedOrderIds([]);
                                        }
                                    }}
                                    checked={selectedOrderIds.length > 0 && selectedOrderIds.length === orders.filter(o => o.order_status !== 'COMPLETED' && o.order_status !== 'CANCELLED' && o.order_status !== 'DELIVERED').length}
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
                                            disabled={order.order_status === 'COMPLETED' || order.order_status === 'CANCELLED' || order.order_status === 'DELIVERED'}
                                            style={{
                                                opacity: (order.order_status === 'COMPLETED' || order.order_status === 'CANCELLED' || order.order_status === 'DELIVERED') ? 0.3 : 1,
                                                cursor: (order.order_status === 'COMPLETED' || order.order_status === 'CANCELLED' || order.order_status === 'DELIVERED') ? 'not-allowed' : 'pointer'
                                            }}
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

                            <div className="detail-section" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                                <h4>Update Status</h4>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {(selectedOrder.order_status === 'PAID' || selectedOrder.order_status === 'PENDING') && (
                                        <button
                                            className="cta-button"
                                            style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#3b82f6' }}
                                            onClick={() => handleUpdateStatus(selectedOrder.order_id, 'DELIVERING')}
                                        >
                                            🚚 Mark as Delivering
                                        </button>
                                    )}
                                    {selectedOrder.order_status === 'DELIVERING' && (
                                        <button
                                            className="cta-button"
                                            style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#f59e0b' }}
                                            onClick={() => handleUpdateStatus(selectedOrder.order_id, 'DELIVERED')}
                                        >
                                            📦 Mark as Delivered
                                        </button>
                                    )}
                                    {(selectedOrder.order_status === 'DELIVERING' || selectedOrder.order_status === 'DELIVERED') && (
                                        <button
                                            className="cta-button"
                                            style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#10b981' }}
                                            onClick={() => handleUpdateStatus(selectedOrder.order_id, 'COMPLETED')}
                                        >
                                            ✅ Mark as Completed
                                        </button>
                                    )}
                                    {selectedOrder.order_status === 'COMPLETED' && (
                                        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontWeight: 600 }}>
                                            ✅ This order has been completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={dialogConfig.isOpen}
                title={dialogConfig.title}
                message={dialogConfig.message}
                onConfirm={dialogConfig.onConfirm}
                onCancel={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
                isAlert={dialogConfig.isAlert}
                confirmText="OK"
            />
        </div >
    );
}
