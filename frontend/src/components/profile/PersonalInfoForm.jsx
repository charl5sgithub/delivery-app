import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export default function PersonalInfoForm({ userEmail, onSuccess }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isWhatsappSame, setIsWhatsappSame] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm();
    const phoneValue = watch('phone');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${API_URL}/api/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = res.data;
            reset({
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                phone: data.phone || '',
                whatsappNumber: data.whatsapp_number || '',
                email: data.email || userEmail
            });
            if (data.phone && data.phone === data.whatsapp_number) {
                setIsWhatsappSame(true);
            }
        } catch (err) {
            console.error('Fetch Profile Error:', err);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`${API_URL}/api/profile`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSuccess(true);
            if (onSuccess) onSuccess();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsappToggle = (e) => {
        const checked = e.target.checked;
        setIsWhatsappSame(checked);
        if (checked) {
            setValue('whatsappNumber', phoneValue);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="profile-section-card">
            <h3 className="section-title">Personal Details</h3>
            
            <div className="form-grid">
                <div className="form-group">
                    <label>First Name*</label>
                    <input 
                        {...register('firstName', { required: 'First name is required' })} 
                        className={errors.firstName ? 'input-error' : ''}
                    />
                    {errors.firstName && <span className="error-text">{errors.firstName.message}</span>}
                </div>

                <div className="form-group">
                    <label>Last Name*</label>
                    <input 
                        {...register('lastName', { required: 'Last name is required' })} 
                        className={errors.lastName ? 'input-error' : ''}
                    />
                    {errors.lastName && <span className="error-text">{errors.lastName.message}</span>}
                </div>

                <div className="form-group">
                    <label>Email ID*</label>
                    <input 
                        {...register('email')} 
                        readOnly 
                        className="input-readonly"
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number*</label>
                    <input 
                        {...register('phone', { 
                            required: 'Phone number is required',
                            pattern: { value: /^[0-9+]+$/, message: 'Invalid phone format' }
                        })} 
                        className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span className="error-text">{errors.phone.message}</span>}
                </div>

                <div className="form-group full-width">
                    <div className="checkbox-group">
                        <input 
                            type="checkbox" 
                            id="sameAsPhone" 
                            checked={isWhatsappSame} 
                            onChange={handleWhatsappToggle}
                        />
                        <label htmlFor="sameAsPhone">WhatsApp same as Phone</label>
                    </div>
                </div>

                {!isWhatsappSame && (
                    <div className="form-group">
                        <label>WhatsApp Number</label>
                        <input 
                            {...register('whatsappNumber', { 
                                pattern: { value: /^[0-9+]+$/, message: 'Invalid format' }
                            })} 
                        />
                    </div>
                )}
            </div>

            <div className="form-actions" style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Update Details'}
                </button>
                <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={async () => {
                        await handleSubmit(onSubmit)();
                        if (!error) navigate('/');
                    }}
                    disabled={loading}
                >
                    Save & Back to Store
                </button>
            </div>
        </form>
    );
}
