import * as profileRepository from '../repositories/profileRepository.js';

export const getUserProfile = async (email) => {
    return await profileRepository.getProfileByEmail(email);
};

export const updateUserProfile = async (email, profileData) => {
    // Business logic could go here (e.g. data cleaning)
    const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        whatsapp_number: profileData.whatsappNumber,
        updated_at: new Date().toISOString()
    };
    return await profileRepository.updateProfile(email, updateData);
};
