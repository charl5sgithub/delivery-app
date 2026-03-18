import * as addressRepository from '../repositories/addressRepository.js';
import * as profileRepository from '../repositories/profileRepository.js';

export const getCustomerAddresses = async (email) => {
    const user = await profileRepository.getProfileByEmail(email);
    return await addressRepository.listAddressesByCustomerId(user.customer_id);
};

export const addUserAddress = async (email, addressData) => {
    const user = await profileRepository.getProfileByEmail(email);
    
    const newAddress = {
        customer_id: user.customer_id,
        label: addressData.label,
        address_line1: addressData.addressLine,
        city: addressData.city,
        postcode: addressData.postcode,
        delivery_slot: addressData.deliverySlot,
        is_default: addressData.isDefault || false,
        country: addressData.country || 'United Kingdom'
    };

    if (newAddress.is_default) {
        await addressRepository.unsetAllDefaultAddresses(user.customer_id);
    }

    return await addressRepository.createAddress(newAddress);
};

export const updateUserAddress = async (email, addressId, addressData) => {
    const user = await profileRepository.getProfileByEmail(email);
    const existing = await addressRepository.getAddressById(addressId);
    
    if (existing.customer_id !== user.customer_id) {
        throw new Error('Unauthorized to update this address');
    }

    const updateData = {
        label: addressData.label,
        address_line1: addressData.addressLine,
        city: addressData.city,
        postcode: addressData.postcode,
        delivery_slot: addressData.deliverySlot,
        is_default: addressData.isDefault,
        country: addressData.country || 'United Kingdom',
        updated_at: new Date().toISOString()
    };

    if (updateData.is_default && !existing.is_default) {
        await addressRepository.unsetAllDefaultAddresses(user.customer_id);
    }

    return await addressRepository.updateAddress(addressId, updateData);
};

export const removeUserAddress = async (email, addressId) => {
    const user = await profileRepository.getProfileByEmail(email);
    const existing = await addressRepository.getAddressById(addressId);
    
    if (existing.customer_id !== user.customer_id) {
        throw new Error('Unauthorized to delete this address');
    }

    return await addressRepository.deleteAddress(addressId);
};

export const markAddressAsDefault = async (email, addressId) => {
    const user = await profileRepository.getProfileByEmail(email);
    const existing = await addressRepository.getAddressById(addressId);
    
    if (existing.customer_id !== user.customer_id) {
        throw new Error('Unauthorized to modify this address');
    }

    return await addressRepository.setDefaultAddress(user.customer_id, addressId);
};
