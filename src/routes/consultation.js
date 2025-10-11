const express = require('express');
const { consultationValidation } = require('../validation/consultationValidation');
const { createConsultation, getAllConsultations } = require('../controllers/consultationController');
const { createCronofyEvent, getCronofyAvailability } = require('../services/cronofyService');
const { sendConsultationConfirmation } = require('../services/emailService');

const router = express.Router();

// POST /api/consultation/book - Book a consultation
router.post('/book', async (req, res) => {
  try {
    console.log('📅 Received consultation booking request:', req.body);
    
    // Validate request data
    const { error, value } = consultationValidation.validate(req.body);
    if (error) {
      console.log('❌ Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Create Cronofy event
    let calendlyData = null;
    try {
      console.log('📅 Creating Cronofy event...');
      calendlyData = await createCronofyEvent({
        name: value.name,
        email: value.email,
        startTime: `${value.preferredDate}T${value.preferredTime}:00`,
        notes: value.message
      });
      console.log('✅ Cronofy event created:', calendlyData.id);
    } catch (calendlyError) {
      console.error('❌ Cronofy booking failed:', calendlyError.message);
      // Continue without Calendly in development
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Continuing without Calendly in development mode');
        calendlyData = {
          id: `dev_${Date.now()}`,
          url: 'https://calendly.com/development-meeting'
        };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Failed to book consultation slot',
          error: 'The selected time slot may not be available'
        });
      }
    }

    // Save consultation to database
    const consultationData = {
      ...value,
      calendlyEventId: calendlyData?.id,
      calendlyEventUrl: calendlyData?.url
    };

    console.log('💾 Saving consultation to database...');
    const consultation = await createConsultation(consultationData);
    console.log('✅ Consultation saved with ID:', consultation.id);

    // Send confirmation email
    try {
      console.log('📧 Sending consultation confirmation email...');
      await sendConsultationConfirmation(consultationData);
    } catch (emailError) {
      console.error('❌ Email confirmation failed:', emailError.message);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Consultation booked successfully',
      data: {
        id: consultation.id,
        name: consultation.name,
        email: consultation.email,
        preferredDate: consultation.preferred_date,
        preferredTime: consultation.preferred_time,
        calendlyUrl: consultation.calendly_event_url,
        createdAt: consultation.created_at
      }
    });

  } catch (error) {
    console.error('❌ Consultation booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book consultation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/consultation/availability - Get available time slots
router.get('/availability', async (req, res) => {
  try {
    const { date, timezone = 'America/New_York' } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    console.log(`📅 Getting availability for ${date}`);
    const availability = await getCronofyAvailability(date, timezone);

    res.json({
      success: true,
      data: {
        date,
        timezone,
        availableSlots: availability
      }
    });

  } catch (error) {
    console.error('❌ Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get availability'
    });
  }
});

// GET /api/consultation - Get all consultations (admin endpoint)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const consultations = await getAllConsultations({ page, limit, status });

    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    console.error('❌ Get consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve consultations'
    });
  }
});

module.exports = router;