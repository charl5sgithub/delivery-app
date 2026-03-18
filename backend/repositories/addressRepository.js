import { supabase } from '../db/supabaseClient.js';

export const listAddressesByCustomerId = async (customerId) => {
    let query = supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerId);
    
    // Attempt to filter by is_deleted, but be resilient if column is missing
    const { data, error } = await query.eq('is_deleted', false);
    
    if (error) {
        if (error.code === '42703') { // undefined_column
            console.warn('is_deleted column missing, falling back to all addresses');
            const fallback = await supabase
                .from('addresses')
                .select('*')
                .eq('customer_id', customerId);
            if (fallback.error) throw fallback.error;
            return fallback.data;
        }
        throw error;
    }
    return data;
};

export const getAddressById = async (addressId) => {
    let query = supabase
        .from('addresses')
        .select('*')
        .eq('address_id', addressId);
    
    const { data, error } = await query.eq('is_deleted', false).single();
    
    if (error) {
        if (error.code === 'PGRST116') throw error; // Not found
        if (error.code === '42703') { 
            const fallback = await supabase
                .from('addresses')
                .select('*')
                .eq('address_id', addressId)
                .single();
            if (fallback.error) throw fallback.error;
            return fallback.data;
        }
        throw error;
    }
    return data;
};

export const createAddress = async (addressData) => {
    const { data, error } = await supabase
        .from('addresses')
        .insert(addressData)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateAddress = async (addressId, addressData) => {
    const { data, error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('address_id', addressId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteAddress = async (addressId) => {
    const { error } = await supabase
        .from('addresses')
        .update({ is_deleted: true, is_default: false })
        .eq('address_id', addressId);
    if (error) throw error;
    return true;
};

export const unsetAllDefaultAddresses = async (customerId) => {
    const { error } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', customerId);
    if (error) throw error;
    return true;
};

export const setDefaultAddress = async (customerId, addressId) => {
    // First, unset all
    await unsetAllDefaultAddresses(customerId);
    // Then set the target
    const { data, error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('address_id', addressId)
        .select()
        .single();
    if (error) throw error;
    return data;
};
