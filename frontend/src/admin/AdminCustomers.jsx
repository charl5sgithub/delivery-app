
import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Sort State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [search, setSearch] = useState('');

    // Modal State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [page, sortBy, sortOrder]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page,
                limit,
                sortBy,
                sortOrder,
                search
            }).toString();

            const res = await fetch(`${API_URL}/api/customers?${query}`);
            const data = await res.json();

            if (data.data) {
                setCustomers(data.data);
                setTotalPages(data.totalPages);
            } else {
                setCustomers([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching customers:", error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCustomers();
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const handleExport = () => {
        const query = new URLSearchParams({ search }).toString();
        window.open(`${API_URL}/api/customers/export?${query}`, '_blank');
    };

    const handleRowClick = async (customerId) => {
        setModalOpen(true);
        setDetailsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/customers/${customerId}`);
            const data = await res.json();
            setSelectedCustomer(data);
            setDetailsLoading(false);
        } catch (error) {
            console.error("Error fetching customer details:", error);
            setDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedCustomer(null);
    };

    const renderSortIcon = (field) => {
        if (sortBy !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Customer Management</h2>
                <div className="admin-actions">
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name, email, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="login-button" style={{ marginTop: 0, width: 'auto' }}>Search</button>
                    </form>
                    <button className="btn-secondary" onClick={handleExport}>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('customer_id')}>ID {renderSortIcon('customer_id')}</th>
                            <th onClick={() => handleSort('name')}>Name {renderSortIcon('name')}</th>
                            <th onClick={() => handleSort('email')}>Email {renderSortIcon('email')}</th>
                            <th onClick={() => handleSort('phone')}>Phone {renderSortIcon('phone')}</th>
                            <th onClick={() => handleSort('created_at')}>Joined At {renderSortIcon('created_at')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : customers.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No customers found.</td></tr>
                        ) : (
                            customers.map((cust) => (
                                <tr key={cust.customer_id} onClick={() => handleRowClick(cust.customer_id)}>
                                    <td>#{String(cust.customer_id).substring(0, 8)}...</td>
                                    <td>{cust.name}</td>
                                    <td>{cust.email}</td>
                                    <td>{cust.phone || '-'}</td>
                                    <td>{new Date(cust.created_at).toLocaleDateString()}</td>
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

            {/* Customer Details Modal */}
            <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target.className.includes('modal-overlay')) closeModal(); }}>
                <div className="modal-content">
                    <button className="close-modal" onClick={closeModal}>×</button>

                    {detailsLoading || !selectedCustomer ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Details...</div>
                    ) : (
                        <>
                            <div className="modal-header">
                                <h3>{selectedCustomer.name}</h3>
                                <p>Member since {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Contact Info</h4>
                                <div className="detail-row">
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value">{selectedCustomer.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Phone</span>
                                    <span className="detail-value">{selectedCustomer.phone || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Saved Addresses</h4>
                                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                                    selectedCustomer.addresses.map((addr, idx) => (
                                        <div key={idx} style={{ marginBottom: '0.5rem', textAlign: 'right', fontSize: '0.9rem' }}>
                                            {addr.address_line1}, {addr.city}, {addr.country}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'right', color: '#6b7280' }}>No addresses saved.</div>
                                )}
                            </div>

                            <div className="detail-section">
                                <h4>Recent Orders (Top 5)</h4>
                                <div className="items-list">
                                    {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                                        selectedCustomer.orders.map((order) => (
                                            <div className="item-row" key={order.order_id}>
                                                <div className="item-name">
                                                    #{order.order_id.substring(0, 8)}...
                                                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="item-price" style={{ textAlign: 'right' }}>
                                                    <span className={`status-badge status-${order.order_status?.toLowerCase()}`} style={{ fontSize: '0.75rem', marginRight: '10px' }}>
                                                        {order.order_status}
                                                    </span>
                                                    ₹{order.total_amount}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>No recent orders.</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
