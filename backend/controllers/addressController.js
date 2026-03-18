import * as addressService from '../services/addressService.js';
import Joi from 'joi';

const addressSchema = Joi.object({
    label: Joi.string().required(),
    addressLine: Joi.string().required(),
    city: Joi.string().required(),
    postcode: Joi.string().required(),
    deliverySlot: Joi.string().valid('Morning (8 AM – 12 PM)', 'Afternoon (12 PM – 4 PM)', 'Evening (4 PM – 8 PM)').required(),
    isDefault: Joi.boolean().default(false),
});

export const getAddresses = async (req, res) => {
    try {
        const addresses = await addressService.getCustomerAddresses(req.callerEmail);
        res.json(addresses);
    } catch (error) {
        console.error('List Addresses Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createAddress = async (req, res) => {
    try {
        const { error, value } = addressSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const newAddress = await addressService.addUserAddress(req.callerEmail, value);
        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Create Address Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = addressSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const updated = await addressService.updateUserAddress(req.callerEmail, id, value);
        res.json(updated);
    } catch (error) {
        console.error('Update Address Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await addressService.removeUserAddress(req.callerEmail, id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete Address Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await addressService.markAddressAsDefault(req.callerEmail, id);
        res.json(updated);
    } catch (error) {
        console.error('Set Default Address Error:', error);
        res.status(500).json({ error: error.message });
    }
};
