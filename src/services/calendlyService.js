const axios = require('axios');

const calendlyAPI = axios.create({
  baseURL: 'https://api.calendly.com',
  headers: {
    'Authorization': `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const createCalendlyEvent = async (eventData) => {
  try {
    const { name, email, startTime, eventType, notes } = eventData;

    // Check if Calendly is configured
    if (!process.env.CALENDLY_ACCESS_TOKEN || process.env.CALENDLY_ACCESS_TOKEN === 'your_calendly_access_token') {
      console.log('⚠️  Calendly not configured, returning mock data for development');
      return {
        id: `mock_${Date.now()}`,
        url: 'https://calendly.com/mock-meeting-link',
        startTime: startTime,
        endTime: new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(),
        status: 'active'
      };
    }

    // First, get the event type URI (you'll need to configure this in Calendly)
    const eventTypesResponse = await calendlyAPI.get('/event_types', {
      params: {
        user: process.env.CALENDLY_USER_URI
      }
    });

    const consultationEventType = eventTypesResponse.data.collection.find(
      et => et.name.toLowerCase().includes('consultation') || et.slug.includes('consultation')
    );

    if (!consultationEventType) {
      throw new Error('Consultation event type not found in Calendly');
    }

    // Create the scheduled event
    const eventPayload = {
      event_type: consultationEventType.uri,
      start_time: new Date(startTime).toISOString(),
      invitee: {
        name: name,
        email: email,
        text_reminder_number: null // Optional: add phone for SMS reminders
      },
      questions_and_answers: [
        {
          question: "Please share any additional details about your project",
          answer: notes || "No additional details provided"
        }
      ]
    };

    const response = await calendlyAPI.post('/scheduled_events', eventPayload);
    
    return {
      id: response.data.resource.uri.split('/').pop(),
      url: response.data.resource.location?.join_url || response.data.resource.calendar_event?.external_id,
      startTime: response.data.resource.start_time,
      endTime: response.data.resource.end_time,
      status: response.data.resource.status
    };

  } catch (error) {
    console.error('❌ Calendly API Error:', error.response?.data || error.message);
    
    // Return mock data for development if Calendly is not configured
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Calendly error in development, returning mock data');
      return {
        id: `mock_${Date.now()}`,
        url: 'https://calendly.com/mock-meeting-link',
        startTime: eventData.startTime,
        endTime: new Date(new Date(eventData.startTime).getTime() + 60 * 60 * 1000).toISOString(),
        status: 'active'
      };
    }
    
    throw error;
  }
};

const getCalendlyAvailability = async (date, timezone = 'America/New_York') => {
  try {
    // Check if Calendly is configured
    if (!process.env.CALENDLY_ACCESS_TOKEN || process.env.CALENDLY_ACCESS_TOKEN === 'your_calendly_access_token') {
      console.log('⚠️  Calendly not configured, returning mock availability');
      
      const mockSlots = [];
      const baseDate = new Date(date);
      
      // Generate mock time slots (9 AM to 5 PM, hourly)
      for (let hour = 9; hour < 17; hour++) {
        const startTime = new Date(baseDate);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);
        
        mockSlots.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          available: Math.random() > 0.3 // 70% chance of being available
        });
      }
      
      return mockSlots;
    }

    // Get user's event types
    const eventTypesResponse = await calendlyAPI.get('/event_types', {
      params: {
        user: process.env.CALENDLY_USER_URI
      }
    });

    const consultationEventType = eventTypesResponse.data.collection.find(
      et => et.name.toLowerCase().includes('consultation')
    );

    if (!consultationEventType) {
      throw new Error('Consultation event type not found');
    }

    // Get availability for the specific date
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const availabilityResponse = await calendlyAPI.get('/event_type_available_times', {
      params: {
        event_type: consultationEventType.uri,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString()
      }
    });

    return availabilityResponse.data.collection.map(slot => ({
      startTime: slot.start_time,
      endTime: slot.end_time,
      available: true
    }));

  } catch (error) {
    console.error('❌ Calendly Availability Error:', error.response?.data || error.message);
    
    // Return mock availability for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Calendly error, returning mock availability');
      
      const mockSlots = [];
      const baseDate = new Date(date);
      
      // Generate mock time slots (9 AM to 5 PM, hourly)
      for (let hour = 9; hour < 17; hour++) {
        const startTime = new Date(baseDate);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);
        
        mockSlots.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          available: Math.random() > 0.3 // 70% chance of being available
        });
      }
      
      return mockSlots;
    }
    
    throw error;
  }
};

const cancelCalendlyEvent = async (eventId) => {
  try {
    const response = await calendlyAPI.delete(`/scheduled_events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Calendly Cancel Error:', error.response?.data || error.message);
    throw error;
  }
};

const getCalendlyEvent = async (eventId) => {
  try {
    const response = await calendlyAPI.get(`/scheduled_events/${eventId}`);
    return response.data.resource;
  } catch (error) {
    console.error('❌ Calendly Get Event Error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  createCalendlyEvent,
  getCalendlyAvailability,
  cancelCalendlyEvent,
  getCalendlyEvent
};