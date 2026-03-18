import * as profileService from '../services/profileService.js';
import Joi from 'joi';

const profileUpdateSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9+]+$/).required(),
    whatsappNumber: Joi.string().pattern(/^[0-9+]+$/).allow('', null),
});

export const getProfile = async (req, res) => {
    try {
        const profile = await profileService.getUserProfile(req.callerEmail);
        res.json(profile);
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { error, value } = profileUpdateSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const updated = await profileService.updateUserProfile(req.callerEmail, value);
        res.json(updated);
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: error.message });
    }
};
