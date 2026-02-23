import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../components/ConfirmationDialog';

const API_URL = import.meta.env.VITE_API_URL;

// ── tiny helpers ──────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProgressBar = ({ value, max, colour }) => {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div style={{ background: '#1e293b', borderRadius: 99, height: 6, overflow: 'hidden', marginTop: 4 }}>
            <div style={{ width: `${pct}%`, background: colour, height: '100%', borderRadius: 99, transition: 'width .4s ease' }} />
        </div>
    );
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Sort
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

    // Order-details modal
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Selection
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [dialogConfig, setDialogConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const navigate = useNavigate();

    // ── Calculation state ─────────────────────────────────────────────────────
    const [calcModalOpen, setCalcModalOpen] = useState(false);
    const [calcLoading, setCalcLoading] = useState(false);
    const [calcResult, setCalcResult] = useState(null);   // API response
    const [calcError, setCalcError] = useState(null);

    useEffect(() => { fetchOrders(); }, [page, sortBy, sortOrder]);

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page, limit, sortBy, sortOrder, search,
                startDate, endDate, orderId: orderIdFilter, status: statusFilter
            }).toString();
            const res = await fetch(`${API_URL}/api/orders?${query}`);
            const data = await res.json();
            setOrders(data.data ?? []);
            setTotalPages(data.totalPages ?? 1);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => { if (e) e.preventDefault(); setPage(1); fetchOrders(); };

    const handleReset = () => {
        setSearch(''); setStartDate(''); setEndDate(''); setOrderIdFilter(''); setStatusFilter('');
        setPage(1);
        setLoading(true);
        fetch(`${API_URL}/api/orders?${new URLSearchParams({ page: 1, limit, sortBy, sortOrder, search: '', startDate: '', endDate: '', orderId: '', status: '' })}`)
            .then(r => r.json())
            .then(d => { setOrders(d.data ?? []); setTotalPages(d.totalPages ?? 1); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleSort = (field) => {
        if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortOrder('desc'); }
    };

    const handleExport = () => window.open(`${API_URL}/api/orders/export?search=${search}`, '_blank');

    // ── Order details modal ───────────────────────────────────────────────────
    const handleRowClick = async (orderId) => {
        setModalOpen(true);
        setDetailsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}`);
            const data = await res.json();
            setSelectedOrder(data);
        } catch (err) {
            console.error('Error fetching details:', err);
        } finally {
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
            fetchOrders();
            setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const closeModal = () => { setModalOpen(false); setSelectedOrder(null); };

    // ── Selection ─────────────────────────────────────────────────────────────
    const renderSortIcon = (field) => {
        if (sortBy !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const toggleOrderSelection = (id, e) => {
        e.stopPropagation();
        setSelectedOrderIds(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);
    };

    const selectableOrders = orders.filter(
        o => o.order_status !== 'CANCELLED'
    );
    const allSelected = selectedOrderIds.length > 0 && selectedOrderIds.length === selectableOrders.length;

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedOrderIds(selectableOrders.map(o => o.order_id));
        else setSelectedOrderIds([]);
    };

    // ── Delivery route ────────────────────────────────────────────────────────
    const handleCalculateRoute = () => {
        if (selectedOrderIds.length === 0) {
            setDialogConfig({
                isOpen: true, title: 'No Orders Selected',
                message: 'Please select at least one order to calculate a route.',
                isAlert: true,
                onConfirm: () => setDialogConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }
        navigate(`/admin/delivery?orderIds=${selectedOrderIds.join(',')}`);
    };

    // ── Amount calculation ────────────────────────────────────────────────────
    const handleCalculateAmount = async () => {
        if (selectedOrderIds.length === 0) {
            setDialogConfig({
                isOpen: true, title: 'No Orders Selected',
                message: 'Please select at least one order to calculate.',
                isAlert: true,
                onConfirm: () => setDialogConfig(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        setCalcResult(null);
        setCalcError(null);
        setCalcModalOpen(true);
        setCalcLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/orders/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderIds: selectedOrderIds })
            });
            const data = await res.json();
            if (!res.ok) { setCalcError(data.error ?? 'Calculation failed.'); }
            else { setCalcResult(data); }
        } catch (err) {
            setCalcError('Network error. Please try again.');
        } finally {
            setCalcLoading(false);
        }
    };

    const closeCalcModal = () => { setCalcModalOpen(false); setCalcResult(null); setCalcError(null); };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="admin-page">

            {/* ── Header row ──────────────────────────────────────────────── */}
            <div className="admin-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <h2>Order Management</h2>
                    <div className="admin-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="btn-secondary" onClick={handleExport}>Export CSV</button>

                        {/* Calculate Amount — always visible, enabled only when rows selected */}
                        <button
                            onClick={handleCalculateAmount}
                            disabled={selectedOrderIds.length === 0}
                            style={{
                                marginTop: 0, width: 'auto',
                                padding: '0.6rem 1.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                cursor: selectedOrderIds.length === 0 ? 'not-allowed' : 'pointer',
                                background: selectedOrderIds.length === 0
                                    ? '#374151'
                                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: selectedOrderIds.length === 0 ? '#6b7280' : '#fff',
                                boxShadow: selectedOrderIds.length > 0 ? '0 4px 14px rgba(99,102,241,.4)' : 'none',
                                transition: 'all .3s ease',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            💰 Calculate Amount
                            {selectedOrderIds.length > 0 && (
                                <span style={{
                                    background: 'rgba(255,255,255,.25)',
                                    borderRadius: 99, padding: '1px 8px',
                                    fontSize: '0.8rem'
                                }}>
                                    {selectedOrderIds.length}
                                </span>
                            )}
                        </button>

                        {/* Calculate Route — only when rows selected */}
                        {selectedOrderIds.length > 0 && (
                            <button
                                className="cta-button"
                                onClick={handleCalculateRoute}
                                style={{
                                    marginTop: 0,
                                    width: 'auto',
                                    backgroundColor: '#10b981',
                                    padding: '0.6rem 1.5rem',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    height: 'auto'
                                }}
                            >
                                🗺️ Calculate Route ({selectedOrderIds.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Filter bar ────────────────────────────────────────────── */}
                <form onSubmit={handleSearch} style={{
                    display: 'flex', gap: '10px', width: '100%',
                    backgroundColor: 'white', padding: '1rem', borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,.1)', flexWrap: 'wrap', alignItems: 'end'
                }}>
                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Date Range</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input type="date" className="search-input" style={{ width: '130px' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <span style={{ alignSelf: 'center' }}>-</span>
                            <input type="date" className="search-input" style={{ width: '130px' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Order ID</label>
                        <input type="text" className="search-input" placeholder="e.g. 101" style={{ width: '100px' }} value={orderIdFilter} onChange={e => setOrderIdFilter(e.target.value)} />
                    </div>

                    <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Status</label>
                        <select className="search-input" style={{ width: '130px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
                        <input type="text" className="search-input" placeholder="Search by customer name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="login-button" style={{
                            marginTop: 0, width: 'auto', height: 'auto',
                            padding: '0.6rem 1.5rem', borderRadius: '8px',
                            fontSize: '0.95rem', fontWeight: 600
                        }}>Filter</button>
                        <button type="button" className="btn-secondary" onClick={handleReset} style={{
                            marginTop: 0, height: 'auto',
                            padding: '0.6rem 1.5rem', borderRadius: '8px',
                            fontSize: '0.95rem', fontWeight: 600
                        }}>Reset</button>
                    </div>
                </form>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={handleSelectAll}
                                    title="Select all selectable orders"
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
                            orders.map(order => {
                                const isDisabled = order.order_status === 'CANCELLED';
                                const isSelected = selectedOrderIds.includes(order.order_id);
                                return (
                                    <tr
                                        key={order.order_id}
                                        onClick={() => handleRowClick(order.order_id)}
                                        style={isSelected ? { background: 'rgba(99,102,241,.08)' } : {}}
                                    >
                                        <td onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={e => toggleOrderSelection(order.order_id, e)}
                                                onClick={e => e.stopPropagation()}
                                                disabled={isDisabled}
                                                style={{ opacity: isDisabled ? 0.3 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                            />
                                        </td>
                                        <td>#{String(order.order_id).substring(0, 8)}...</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{order.customers?.name || 'Guest'}</div>
                                            <small style={{ color: '#6b7280' }}>{order.customers?.email}</small>
                                        </td>
                                        <td>{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td><span className={`status-badge status-${order.order_status?.toLowerCase()}`}>{order.order_status}</span></td>
                                        <td style={{ fontWeight: 600 }}>₹{order.total_amount}</td>
                                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {order.addresses?.address_line1}, {order.addresses?.city}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* ── Pagination ───────────────────────────────────────────── */}
                <div className="pagination">
                    <span className="page-info">Page {page} of {totalPages}</span>
                    <div className="pagination-controls">
                        <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
                        {[...Array(totalPages)].map((_, i) => {
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
                        <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
                    </div>
                </div>
            </div>

            {/* ── Order Details Modal ──────────────────────────────────────── */}
            <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={e => { if (e.target.className.includes('modal-overlay')) closeModal(); }}>
                <div className="modal-content">
                    <button className="close-modal" onClick={closeModal}>×</button>
                    {detailsLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Details...</div>
                    ) : !selectedOrder ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Select an order to view details.</div>
                    ) : selectedOrder.error ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error loading details: {selectedOrder.error}</div>
                    ) : (
                        <>
                            <div className="modal-header">
                                <h3>Order #{selectedOrder.order_id}</h3>
                                <p>Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Customer Details</h4>
                                <div className="detail-row"><span className="detail-label">Name</span><span className="detail-value">{selectedOrder.customers?.name}</span></div>
                                <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selectedOrder.customers?.email}</span></div>
                                <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{selectedOrder.customers?.phone}</span></div>
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
                                                {item.items?.image && <img src={item.items.image} alt={item.items.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                                                <div>{item.items?.name || 'Unknown Item'}<span>Qty: {item.quantity}</span></div>
                                            </div>
                                            <div className="item-price">₹{item.price * item.quantity}</div>
                                        </div>
                                    ))}
                                    <div className="item-row" style={{ borderTop: '2px solid #e5e7eb', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 700 }}>
                                        <span>Total Amount</span><span>₹{selectedOrder.total_amount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Payment Status</h4>
                                <div className="detail-row">
                                    <span className="detail-label">Status</span>
                                    <span className={`status-badge status-${selectedOrder.order_status?.toLowerCase()}`}>{selectedOrder.order_status}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Payment ID</span>
                                    <span className="detail-value" style={{ fontSize: '0.85rem', color: '#6b7280' }}>{selectedOrder.payments?.[0]?.transaction_id || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="detail-section" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                                <h4>Update Status</h4>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {(selectedOrder.order_status === 'PAID' || selectedOrder.order_status === 'PENDING') && (
                                        <button className="cta-button" style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#3b82f6' }} onClick={() => handleUpdateStatus(selectedOrder.order_id, 'DELIVERING')}>🚚 Mark as Delivering</button>
                                    )}
                                    {selectedOrder.order_status === 'DELIVERING' && (
                                        <button className="cta-button" style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#f59e0b' }} onClick={() => handleUpdateStatus(selectedOrder.order_id, 'DELIVERED')}>📦 Mark as Delivered</button>
                                    )}
                                    {(selectedOrder.order_status === 'DELIVERING' || selectedOrder.order_status === 'DELIVERED') && (
                                        <button className="cta-button" style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#10b981' }} onClick={() => handleUpdateStatus(selectedOrder.order_id, 'COMPLETED')}>✅ Mark as Completed</button>
                                    )}
                                    {selectedOrder.order_status === 'COMPLETED' && (
                                        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontWeight: 600 }}>✅ This order has been completed</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Calculate Amount Modal ───────────────────────────────────── */}
            {calcModalOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 2000,
                        background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '16px'
                    }}
                    onClick={e => { if (e.target === e.currentTarget) closeCalcModal(); }}
                >
                    <div style={{
                        background: '#0f1117', borderRadius: '20px',
                        width: '100%', maxWidth: '640px', maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 30px 80px rgba(0,0,0,.7)',
                        border: '1px solid #1e293b',
                        padding: '0'
                    }}>
                        {/* Modal header */}
                        <div style={{
                            padding: '24px 28px 20px',
                            borderBottom: '1px solid #1e293b',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'linear-gradient(135deg, #1a1d2e, #0f1117)',
                            borderRadius: '20px 20px 0 0'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', fontWeight: 700 }}>
                                    💰 Amount Calculation
                                </h3>
                                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                                    {calcLoading
                                        ? 'Fetching payment data…'
                                        : calcResult
                                            ? `Based on ${calcResult.orderCount} selected order${calcResult.orderCount !== 1 ? 's' : ''}`
                                            : 'Error fetching data'}
                                </p>
                            </div>
                            <button onClick={closeCalcModal} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}>×</button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '24px 28px' }}>
                            {/* Loading */}
                            {calcLoading && (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⏳</div>
                                    Calculating…
                                </div>
                            )}

                            {/* Error */}
                            {!calcLoading && calcError && (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>❌</div>
                                    {calcError}
                                </div>
                            )}

                            {/* Results */}
                            {!calcLoading && calcResult && (
                                <>
                                    {/* ── Summary cards ──────────────────────────── */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>

                                        {/* Total Order Amount */}
                                        <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '14px', padding: '20px 24px' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,.7)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                                                Total Order Amount
                                            </div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                                                {fmt(calcResult.totalOrderAmount)}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.6)', marginTop: '4px' }}>
                                                Across {calcResult.orderCount} order{calcResult.orderCount !== 1 ? 's' : ''}
                                            </div>
                                        </div>

                                        {/* Paid by Card */}
                                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '18px 20px' }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3b82f6', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                                                💳 Paid by Card
                                            </div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                                                {fmt(calcResult.paidByCard)}
                                            </div>
                                            <ProgressBar value={calcResult.paidByCard} max={calcResult.totalOrderAmount} colour="#3b82f6" />
                                        </div>

                                        {/* Paid by Cash */}
                                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '18px 20px' }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f59e0b', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                                                💵 Paid by Cash / COD
                                            </div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
                                                {fmt(calcResult.paidByCash)}
                                            </div>
                                            <ProgressBar value={calcResult.paidByCash} max={calcResult.totalOrderAmount} colour="#f59e0b" />
                                        </div>

                                        {/* Total Paid */}
                                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '18px 20px' }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#10b981', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                                                ✅ Total Amount Paid
                                            </div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>
                                                {fmt(calcResult.totalPaid)}
                                            </div>
                                            <ProgressBar value={calcResult.totalPaid} max={calcResult.totalOrderAmount} colour="#10b981" />
                                        </div>

                                        {/* Remaining */}
                                        <div style={{
                                            background: calcResult.remaining > 0 ? '#1a0a0a' : '#0a1a10',
                                            border: `1px solid ${calcResult.remaining > 0 ? '#7f1d1d' : '#14532d'}`,
                                            borderRadius: '14px', padding: '18px 20px'
                                        }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: calcResult.remaining > 0 ? '#ef4444' : '#10b981', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                                                {calcResult.remaining > 0 ? '⚠️ Remaining to Collect' : '🎉 Fully Collected'}
                                            </div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: calcResult.remaining > 0 ? '#ef4444' : '#10b981' }}>
                                                {fmt(calcResult.remaining)}
                                            </div>
                                            <ProgressBar value={calcResult.remaining} max={calcResult.totalOrderAmount} colour={calcResult.remaining > 0 ? '#ef4444' : '#10b981'} />
                                        </div>
                                    </div>

                                    {/* ── Per-order breakdown ─────────────────────── */}
                                    <div>
                                        <h4 style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                                            Per-Order Breakdown
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {calcResult.orders.map((o, i) => (
                                                <div key={o.order_id} style={{
                                                    background: '#0f172a', border: '1px solid #1e293b',
                                                    borderRadius: '10px', padding: '12px 16px',
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr auto auto auto',
                                                    gap: '12px', alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.875rem' }}>{o.customerName}</div>
                                                        <div style={{ color: '#475569', fontSize: '0.75rem' }}>#{String(o.order_id).substring(0, 8)}…</div>
                                                    </div>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
                                                        background: o.order_status === 'PENDING' ? '#422006' : o.order_status === 'PAID' ? '#072a20' : '#1e1b4b',
                                                        color: o.order_status === 'PENDING' ? '#fb923c' : o.order_status === 'PAID' ? '#34d399' : '#a5b4fc'
                                                    }}>
                                                        {o.order_status}
                                                    </span>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total</div>
                                                        <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{fmt(o.total_amount)}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Remaining</div>
                                                        <div style={{ fontWeight: 700, color: o.remaining > 0 ? '#ef4444' : '#10b981' }}>{fmt(o.remaining)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div style={{
                            padding: '16px 28px', borderTop: '1px solid #1e293b',
                            display: 'flex', justifyContent: 'flex-end', gap: '10px',
                            borderRadius: '0 0 20px 20px'
                        }}>
                            <button
                                onClick={closeCalcModal}
                                style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Close
                            </button>
                            {calcResult && (
                                <button
                                    onClick={handleCalculateAmount}
                                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    🔄 Recalculate
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationDialog
                isOpen={dialogConfig.isOpen}
                title={dialogConfig.title}
                message={dialogConfig.message}
                onConfirm={dialogConfig.onConfirm}
                onCancel={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
                isAlert={dialogConfig.isAlert}
                confirmText="OK"
            />
        </div>
    );
}
