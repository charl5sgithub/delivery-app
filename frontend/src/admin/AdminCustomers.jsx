import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

// ── Role badge colours ────────────────────────────────────────────────────────
const ROLE_STYLES = {
    SuperUser: { background: '#7c3aed', color: '#fff' },
    Admin: { background: '#0284c7', color: '#fff' },
    User: { background: '#374151', color: '#d1d5db' },
};

const VALID_ROLES = ['SuperUser', 'Admin', 'User'];

export default function AdminCustomers() {
    const { user } = useAuth();

    // ── List state ────────────────────────────────────────────────────────────
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [search, setSearch] = useState('');

    // ── Detail modal state ────────────────────────────────────────────────────
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // ── Role-edit modal state ─────────────────────────────────────────────────
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleTarget, setRoleTarget] = useState(null);   // { customer_id, name, email, role }
    const [selectedRole, setSelectedRole] = useState('User');
    const [roleLoading, setRoleLoading] = useState(false);
    const [toast, setToast] = useState(null);   // { type: 'success'|'error', msg }

    useEffect(() => { fetchCustomers(); }, [page, sortBy, sortOrder]);

    // ── Fetch helpers ─────────────────────────────────────────────────────────
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({ page, limit, sortBy, sortOrder, search }).toString();
            const res = await fetch(`${API_URL}/api/customers?${q}`);
            const data = await res.json();
            setCustomers(data.data ?? []);
            setTotalPages(data.totalPages ?? 1);
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchCustomers(); };

    const handleSort = (field) => {
        if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortOrder('desc'); }
    };

    const handleExport = () => {
        window.open(`${API_URL}/api/customers/export?search=${search}`, '_blank');
    };

    // ── Detail modal ──────────────────────────────────────────────────────────
    const handleRowClick = async (customerId) => {
        setModalOpen(true);
        setDetailsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/customers/${customerId}`);
            const data = await res.json();
            setSelectedCustomer(data);
        } catch (err) {
            console.error('Error fetching customer details:', err);
        } finally {
            setDetailsLoading(false);
        }
    };
    const closeModal = () => { setModalOpen(false); setSelectedCustomer(null); };

    // ── Role-edit modal ───────────────────────────────────────────────────────
    const openRoleModal = (e, cust) => {
        e.stopPropagation();   // don't open the details modal
        setRoleTarget({ customer_id: cust.customer_id, name: cust.name, email: cust.email, role: cust.role });
        setSelectedRole(cust.role || 'User');
        setRoleModalOpen(true);
    };
    const closeRoleModal = () => { setRoleModalOpen(false); setRoleTarget(null); };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleRoleUpdate = async () => {
        if (!roleTarget) return;
        setRoleLoading(true);
        try {
            const res = await fetch(
                `${API_URL}/api/customers/${roleTarget.customer_id}/role`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Email': user?.email ?? ''   // ← RBAC auth header
                    },
                    body: JSON.stringify({ role: selectedRole })
                }
            );
            const data = await res.json();

            if (!res.ok) {
                showToast('error', data.error ?? 'Failed to update role.');
                return;
            }

            // Update row in UI without refetching the whole list
            setCustomers(prev =>
                prev.map(c =>
                    c.customer_id === roleTarget.customer_id
                        ? { ...c, role: selectedRole }
                        : c
                )
            );
            showToast('success', `Role for ${roleTarget.name} updated to ${selectedRole}.`);
            closeRoleModal();
        } catch (err) {
            showToast('error', 'Network error. Please try again.');
        } finally {
            setRoleLoading(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const renderSortIcon = (field) => {
        if (sortBy !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const RoleBadge = ({ role }) => {
        const style = ROLE_STYLES[role] ?? ROLE_STYLES.User;
        return (
            <span style={{
                ...style,
                padding: '2px 10px',
                borderRadius: '99px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap'
            }}>
                {role || 'User'}
            </span>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="admin-page">

            {/* ── Toast ───────────────────────────────────────────────────── */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
                    background: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: '#fff', padding: '12px 20px', borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    fontWeight: 500, fontSize: '0.95rem',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
                </div>
            )}

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="admin-header">
                <h2>Customer Management</h2>
                <div className="admin-actions">
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name, email, phone…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="login-button" style={{ marginTop: 0, width: 'auto' }}>
                            Search
                        </button>
                    </form>
                    <button className="btn-secondary" onClick={handleExport}>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('customer_id')}>ID {renderSortIcon('customer_id')}</th>
                            <th onClick={() => handleSort('name')}>Name {renderSortIcon('name')}</th>
                            <th onClick={() => handleSort('email')}>Email {renderSortIcon('email')}</th>
                            <th onClick={() => handleSort('phone')}>Phone {renderSortIcon('phone')}</th>
                            <th onClick={() => handleSort('role')}>Role {renderSortIcon('role')}</th>
                            <th onClick={() => handleSort('created_at')}>Joined At {renderSortIcon('created_at')}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading…</td></tr>
                        ) : customers.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No customers found.</td></tr>
                        ) : (
                            customers.map((cust) => (
                                <tr key={cust.customer_id} onClick={() => handleRowClick(cust.customer_id)}>
                                    <td>#{String(cust.customer_id).substring(0, 8)}…</td>
                                    <td>{cust.name}</td>
                                    <td>{cust.email}</td>
                                    <td>{cust.phone || '-'}</td>
                                    <td><RoleBadge role={cust.role} /></td>
                                    <td>{new Date(cust.created_at).toLocaleDateString()}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => openRoleModal(e, cust)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #4b5563',
                                                background: '#1f2937',
                                                color: '#d1d5db',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            ✏️ Edit Role
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* ── Pagination ───────────────────────────────────────────── */}
                <div className="pagination">
                    <span className="page-info">Page {page} of {totalPages}</span>
                    <div className="pagination-controls">
                        <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => {
                            if (totalPages > 7 && Math.abs(page - (i + 1)) > 2 && i !== 0 && i !== totalPages - 1) {
                                if (i === 1 || i === totalPages - 2) return <span key={i}>…</span>;
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
                        <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Customer Details Modal ───────────────────────────────────── */}
            <div
                className={`modal-overlay ${modalOpen ? 'open' : ''}`}
                onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
            >
                <div className="modal-content">
                    <button className="close-modal" onClick={closeModal}>×</button>

                    {detailsLoading || !selectedCustomer ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Details…</div>
                    ) : selectedCustomer.error ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                            Error loading details: {selectedCustomer.error}
                        </div>
                    ) : (
                        <>
                            <div className="modal-header">
                                <h3>{selectedCustomer.name}</h3>
                                <p>Member since {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                                <div style={{ marginTop: '6px' }}>
                                    <RoleBadge role={selectedCustomer.role} />
                                </div>
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
                                {selectedCustomer.addresses?.length > 0 ? (
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
                                    {selectedCustomer.orders?.length > 0 ? (
                                        selectedCustomer.orders.map((order) => (
                                            <div className="item-row" key={order.order_id}>
                                                <div className="item-name">
                                                    #{String(order.order_id).substring(0, 8)}…
                                                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="item-price" style={{ textAlign: 'right' }}>
                                                    <span className={`status-badge status-${order.order_status?.toLowerCase()}`} style={{ fontSize: '0.75rem', marginRight: '10px' }}>
                                                        {order.order_status}
                                                    </span>
                                                    £{order.total_amount}
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

            {/* ── Edit Role Modal ──────────────────────────────────────────── */}
            {roleModalOpen && roleTarget && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) closeRoleModal(); }}
                >
                    <div style={{
                        background: '#1a1d2e', borderRadius: '16px',
                        padding: '32px', width: '100%', maxWidth: '420px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                        border: '1px solid #2d3148'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#f9fafb', fontSize: '1.2rem' }}>Edit User Role</h3>
                                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                                    {roleTarget.name} · {roleTarget.email}
                                </p>
                            </div>
                            <button onClick={closeRoleModal} style={{
                                background: 'none', border: 'none', color: '#9ca3af',
                                fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1
                            }}>×</button>
                        </div>

                        {/* Current role */}
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ margin: '0 0 8px', color: '#9ca3af', fontSize: '0.85rem' }}>Current Role</p>
                            <RoleBadge role={roleTarget.role} />
                        </div>

                        {/* Role selector */}
                        <div style={{ marginBottom: '28px' }}>
                            <p style={{ margin: '0 0 10px', color: '#9ca3af', fontSize: '0.85rem' }}>Select New Role</p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {VALID_ROLES.map((role) => {
                                    const s = ROLE_STYLES[role];
                                    const active = selectedRole === role;
                                    return (
                                        <button
                                            key={role}
                                            onClick={() => setSelectedRole(role)}
                                            style={{
                                                padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
                                                fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.15s ease',
                                                border: active ? `2px solid ${s.background}` : '2px solid #374151',
                                                background: active ? s.background : '#111827',
                                                color: active ? s.color : '#6b7280',
                                                boxShadow: active ? `0 0 12px ${s.background}55` : 'none'
                                            }}
                                        >
                                            {role}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={closeRoleModal}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: '1px solid #374151',
                                    background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRoleUpdate}
                                disabled={roleLoading || selectedRole === roleTarget.role}
                                style={{
                                    padding: '10px 24px', borderRadius: '8px', border: 'none',
                                    background: selectedRole === roleTarget.role ? '#374151' : '#10b981',
                                    color: '#fff', cursor: selectedRole === roleTarget.role ? 'not-allowed' : 'pointer',
                                    fontWeight: 600, fontSize: '0.95rem',
                                    opacity: roleLoading ? 0.7 : 1
                                }}
                            >
                                {roleLoading ? 'Saving…' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
