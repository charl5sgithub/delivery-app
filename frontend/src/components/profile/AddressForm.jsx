import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';

const SLOTS = [
    'Morning (8 AM – 12 PM)',
    'Afternoon (12 PM – 4 PM)',
    'Evening (4 PM – 8 PM)'
];

export default function AddressForm({ initialData, onSubmit, onCancel, loading }) {
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const autocompleteService = useRef(null);
    const placesService = useRef(null);
    const postcodeValue = watch('postcode');

    useEffect(() => {
        if (initialData) {
            reset({
                label: initialData.label || '',
                addressLine: initialData.address_line1 || '',
                city: initialData.city || '',
                postcode: initialData.postcode || '',
                deliverySlot: initialData.delivery_slot || SLOTS[0],
                isDefault: initialData.is_default || false
            });
        } else {
            reset({
                label: '',
                addressLine: '',
                city: '',
                postcode: '',
                deliverySlot: SLOTS[0],
                isDefault: false
            });
        }
    }, [initialData, reset]);

    // Load Google Maps API script
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) return;

        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.onload = () => {
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
                placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
            };
            document.head.appendChild(script);
        } else if (!autocompleteService.current) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
        }
    }, []);

    // Handle Postcode Lookup
    useEffect(() => {
        if (!postcodeValue || postcodeValue.length < 3 || !autocompleteService.current) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            autocompleteService.current.getPlacePredictions({
                input: postcodeValue,
                componentRestrictions: { country: 'uk' },
                types: ['address']
            }, (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            });
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [postcodeValue]);

    const handleSuggestionClick = (suggestion) => {
        if (!placesService.current) return;

        placesService.current.getDetails({
            placeId: suggestion.place_id,
            fields: ['address_components', 'formatted_address']
        }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const components = place.address_components;
                
                let streetNumber = '';
                let route = '';
                let city = '';
                let postcode = '';

                components.forEach(c => {
                    if (c.types.includes('street_number')) streetNumber = c.long_name;
                    if (c.types.includes('route')) route = c.long_name;
                    if (c.types.includes('postal_town') || c.types.includes('locality')) city = c.long_name;
                    if (c.types.includes('postal_code')) postcode = c.long_name;
                });

                setValue('addressLine', `${streetNumber} ${route}`.trim() || place.formatted_address);
                setValue('city', city);
                setValue('postcode', postcode);
                setShowSuggestions(false);
            }
        });
    };

    return (
        <div className="inline-address-form" style={{ 
            backgroundColor: '#fdfcf0', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '2px solid #6F8E52',
            marginBottom: '24px',
            position: 'relative'
        }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '800', color: '#4b4a45' }}>
                {initialData ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.85rem', color: '#8a867a', fontWeight: 600 }}>Address Label (e.g. Home, Office)*</label>
                        <input 
                            {...register('label', { required: 'Label is required' })} 
                            placeholder="Home, Office, Friend's Home"
                            className={errors.label ? 'input-error' : ''}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        {errors.label && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.label.message}</span>}
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label style={{ fontSize: '0.85rem', color: '#8a867a', fontWeight: 600 }}>Postcode (Lookup)*</label>
                        <input 
                            {...register('postcode', { required: 'Postcode is required' })} 
                            placeholder="Enter postcode for lookup"
                            autoComplete="off"
                            className={errors.postcode ? 'input-error' : ''}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                listStyle: 'none',
                                padding: 0,
                                margin: '4px 0 0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {suggestions.map(s => (
                                    <li 
                                        key={s.place_id}
                                        onClick={() => handleSuggestionClick(s)}
                                        style={{
                                            padding: '10px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            borderBottom: '1px solid #eee'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        {s.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errors.postcode && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.postcode.message}</span>}
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: '#8a867a', fontWeight: 600 }}>City*</label>
                        <input 
                            {...register('city', { required: 'City is required' })} 
                            className={errors.city ? 'input-error' : ''}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        {errors.city && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.city.message}</span>}
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.85rem', color: '#8a867a', fontWeight: 600 }}>Full Address Line*</label>
                        <input 
                            {...register('addressLine', { required: 'Address is required' })} 
                            className={errors.addressLine ? 'input-error' : ''}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        {errors.addressLine && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.addressLine.message}</span>}
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

