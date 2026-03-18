import React from 'react';

export default function AddressList({ addresses, onEdit, onDelete, onSetDefault }) {
    if (!addresses || addresses.length === 0) {
        return (
            <div className="empty-state">
                <p>No addresses saved yet.</p>
            </div>
        );
    }

    return (
        <div className="address-grid">
            {addresses.map((addr) => (
                <div key={addr.address_id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
                    {addr.is_default && <span className="default-badge">DEFAULT</span>}
                    <div className="address-content">
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', color: '#4b4a45' }}>{addr.address_line1}</h4>
                        <p style={{ color: '#71716a', marginBottom: '12px' }}>{addr.city}, {addr.postcode}</p>
                        <div className="slot-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(111, 142, 82, 0.1)', color: '#6F8E52', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                            🕒 {addr.delivery_slot}
                        </div>
                    </div>
                    
                    <div className="address-actions">
                        {!addr.is_default && (
                            <button 
                                onClick={() => onSetDefault(addr.address_id)}
                                className="action-btn-link"
                            >
                                Set as Default
                            </button>
                        )}
                        <div className="action-icons-group">
                            <button 
                                onClick={() => onEdit(addr)} 
                                className="icon-btn edit-btn"
                                title="Edit Address"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button 
                                onClick={() => onDelete(addr.address_id)} 
                                className="icon-btn delete-btn"
                                title="Delete Address"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            <style>{`
                .address-actions {
                    margin-top: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid rgba(0,0,0,0.05);
                    padding-top: 16px;
                }
                .action-btn-link {
                    background: none;
                    border: none;
                    color: #6F8E52;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 0;
                }
                .action-icons-group {
                    display: flex;
                    gap: 8px;
                }
                .icon-btn {
                    background: #fdfcf0;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 8px;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #4b4a45;
                }
                .icon-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .edit-btn:hover {
                    background: #6F8E52;
                    color: #fff;
                    border-color: #6F8E52;
                }
                .delete-btn:hover {
                    background: #ef4444;
                    color: #fff;
                    border-color: #ef4444;
                }
            `}</style>
        </div>
    );
}
