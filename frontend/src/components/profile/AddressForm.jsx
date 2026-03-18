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
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{initialData ? 'Edit Address' : 'Add New Address'}</h3>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Street / Area*</label>
                        <input 
                            {...register('addressLine', { required: 'Address is required' })} 
                            className={errors.addressLine ? 'input-error' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label>City*</label>
                        <input 
                            {...register('city', { required: 'City is required' })} 
                            className={errors.city ? 'input-error' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label>Postcode*</label>
                        <input 
                            {...register('postcode', { required: 'Postcode is required' })} 
                            className={errors.postcode ? 'input-error' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label>Preferred Delivery Slot*</label>
                        <select {...register('deliverySlot', { required: true })}>
                            {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <div className="checkbox-group">
                            <input type="checkbox" id="isDefault" {...register('isDefault')} />
                            <label htmlFor="isDefault">Mark as default delivery address</label>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Address'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
