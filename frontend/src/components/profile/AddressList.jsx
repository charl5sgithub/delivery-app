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
                        <h4>{addr.address_line1}</h4>
                        <p>{addr.city}, {addr.postcode}</p>
                        <p className="slot-info">🕒 Preferred: {addr.delivery_slot}</p>
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
