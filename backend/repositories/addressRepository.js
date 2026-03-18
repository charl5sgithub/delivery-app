import { supabase } from '../db/supabaseClient.js';

export const listAddressesByCustomerId = async (customerId) => {
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerId);
    if (error) throw error;
    return data;
};

export const getAddressById = async (addressId) => {
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('address_id', addressId)
        .single();
    if (error) throw error;
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
        .delete()
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
