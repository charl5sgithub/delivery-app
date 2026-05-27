import { supabase } from '../db/supabaseClient.js';

export const getProfileByEmail = async (email) => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data || { email }; // Return minimal object if no profile yet
};

export const updateProfile = async (email, profileData) => {
    // Upsert ensures the row is created if it doesn't exist yet,
    // and updated if it does — keyed on the unique email column.
    const { data, error } = await supabase
        .from('customers')
        .upsert(
            { email, ...profileData },
            { onConflict: 'email' }
        )
        .select()
        .single();
    if (error) throw error;
    return data;
};
