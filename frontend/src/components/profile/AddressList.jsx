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
                                className="btn-text"
                            >
                                Set Default
                            </button>
                        )}
                        <button onClick={() => onEdit(addr)} className="btn-icon">✏️</button>
                        <button onClick={() => onDelete(addr.address_id)} className="btn-icon delete">🗑️</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
