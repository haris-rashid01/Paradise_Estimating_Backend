import express from 'express';
import * as contactController from '../controllers/contactController.js';
import upload from '../middleware/uploadBlueprint.js';
const router = express.Router();

//Routes
router.post('/send-email', (req, res, next) => {
    upload.single('blueprint')(req, res, (err) => {
        if (err) {
            if (err.message && err.message.includes('Boundary not found')) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Multipart: Boundary not found. Do NOT manually set Content-Type header in Postman.' 
                });
            }
            if (err.message && err.message === 'Unexpected field') {
                return res.status(400).json({ 
                    success: false, 
                    message: "Multipart: Unexpected field. The file key MUST be 'blueprint'. check your Postman 'Key' column." 
                });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, contactController.sendEmail);

export default router;
