import { supabase } from '../db/supabaseClient.js';

export const getProfileByEmail = async (email) => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();
    if (error) throw error;
    return data;
};

export const updateProfile = async (email, profileData) => {
    const { data, error } = await supabase
        .from('customers')
        .update(profileData)
        .eq('email', email)
        .select()
        .single();
    if (error) throw error;
    return data;
};
