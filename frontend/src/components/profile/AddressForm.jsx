import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const SLOTS = [
    'Morning (8 AM – 12 PM)',
    'Afternoon (12 PM – 4 PM)',
    'Evening (4 PM – 8 PM)'
];

export default function AddressForm({ initialData, onSubmit, onCancel, loading }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        if (initialData) {
            reset({
                addressLine: initialData.address_line1 || '',
                city: initialData.city || '',
                postcode: initialData.postcode || '',
                deliverySlot: initialData.delivery_slot || SLOTS[0],
                isDefault: initialData.is_default || false
            });
        } else {
            reset({
                addressLine: '',
                city: '',
                postcode: '',
                deliverySlot: SLOTS[0],
                isDefault: false
            });
        }
    }, [initialData, reset]);

    return (
        <div className="inline-address-form" style={{ 
            backgroundColor: '#fdfcf0', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '2px solid #6F8E52',
            marginBottom: '24px'
        }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '800', color: '#4b4a45' }}>
                {initialData ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.85rem', color: '#8a867a', fontWeight: 600 }}>Street / Area*</label>
                        <input 
                            {...register('addressLine', { required: 'Address is required' })} 
                            className={errors.addressLine ? 'input-error' : ''}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: '#8a867a', fontWeight: 600 }}>City*</label>
                        <input 
                            {...register('city', { required: 'City is required' })} 
                            className={errors.city ? 'input-error' : ''}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: '#8a867a', fontWeight: 600 }}>Postcode*</label>
                        <input 
                            {...register('postcode', { required: 'Postcode is required' })} 
                            className={errors.postcode ? 'input-error' : ''}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.85rem', color: '#8a867a', fontWeight: 600 }}>Preferred Delivery Slot*</label>
                        <select 
                            {...register('deliverySlot', { required: true })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}
                        >
                            {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <div className="checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" id="isDefault" {...register('isDefault')} />
                            <label htmlFor="isDefault" style={{ fontSize: '0.9rem', color: '#4b4a45' }}>Mark as default delivery address</label>
                        </div>
                    </div>
                </div>

                <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#6F8E52', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        {loading ? 'Saving...' : 'Save Address'}
                    </button>
                </div>
            </form>
        </div>
    );
}
