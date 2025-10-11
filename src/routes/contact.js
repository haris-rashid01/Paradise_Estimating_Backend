const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { contactValidation } = require('../validation/contactValidation');
const { createContact, getAllContacts, getContactById } = require('../controllers/contactController');
const { sendContactNotification } = require('../services/emailService');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed',
    'image/dwg',
    'image/jpeg',
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, ZIP, RAR, DWG, JPG, PNG files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// POST /api/contact/send - Send contact message
router.post('/send', upload.single('projectFile'), async (req, res) => {
  try {
    console.log('📧 Received contact form submission:', req.body);
    
    // Validate request data
    const { error, value } = contactValidation.validate(req.body);
    if (error) {
      console.log('❌ Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Prepare contact data
    const contactData = {
      ...value,
      fileName: req.file ? req.file.originalname : null,
      filePath: req.file ? req.file.path : null
    };

    console.log('💾 Saving contact to database...');
    // Save to database
    const contact = await createContact(contactData);
    console.log('✅ Contact saved with ID:', contact.id);

    // Send email notification
    try {
      console.log('📧 Sending email notifications...');
      await sendContactNotification(contactData);
      console.log('✅ Email notifications sent successfully');
    } catch (emailError) {
      console.error('❌ Email notification failed:', emailError.message);
      // Don't fail the request if email fails
    }

    // Remove uploaded file after processing (keep DB record only)
    try {
      if (contactData.filePath) {
        await fs.promises.unlink(contactData.filePath);
        console.log('🧹 Removed uploaded file:', contactData.filePath);
      }
    } catch (unlinkErr) {
      console.warn('⚠️  Could not remove uploaded file:', unlinkErr && unlinkErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.created_at
      }
    });

  } catch (error) {
    console.error('❌ Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send contact message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/contact - Get all contacts (admin endpoint)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const contacts = await getAllContacts({ page, limit, status });

    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contacts'
    });
  }
});

// GET /api/contact/:id - Get specific contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await getContactById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact'
    });
  }
});

module.exports = router;