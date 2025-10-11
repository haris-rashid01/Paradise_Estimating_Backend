const axios = require('axios');

const cronofyAPI = axios.create({
  baseURL: 'https://api.cronofy.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.CRONOFY_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const ensureConfigured = () => {
  if (!process.env.CRONOFY_ACCESS_TOKEN || process.env.CRONOFY_ACCESS_TOKEN === 'your_cronofy_access_token') {
    throw new Error('Cronofy not configured. Set CRONOFY_ACCESS_TOKEN in environment.');
  }
};

const createCronofyEvent = async ({ name, email, startTime, notes }) => {
  try {
    ensureConfigured();

    // You must provide a concrete calendar_id; prefer CRONOFY_CALENDAR_ID. Profile ID is not a calendar id.
    const calendarId = process.env.CRONOFY_CALENDAR_ID;
    if (!calendarId) {
      throw new Error('CRONOFY_CALENDAR_ID is required to create events.');
    }

    const eventId = `consultation-${Date.now()}`;
    const end = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

    const payload = {
      calendar_id: calendarId,
      event_id: eventId,
      summary: `Consultation with ${name}`,
      description: notes || 'Consultation booking via website',
      start: new Date(startTime).toISOString(),
      end,
      location: { description: 'Online' },
      // Optionally add attendee for the client so invites go out
      attendees: [
        { email, display_name: name }
      ]
    };

    const response = await cronofyAPI.post('/upsert_event', payload);

    // Cronofy often returns 202 Accepted with no body for upsert
    return {
      id: eventId,
      url: null, // join URL not provided by default
      startTime: payload.start,
      endTime: end,
      status: response.status === 202 || response.status === 200 ? 'accepted' : 'unknown'
    };
  } catch (error) {
    const details = error.response?.data || error.message;
    console.error('❌ Cronofy API Error:', details);
    // Fallback in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Cronofy error in development, returning mock data');
      return {
        id: `mock_${Date.now()}`,
        url: null,
        startTime,
        endTime: new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(),
        status: 'active'
      };
    }
    throw error;
  }
};

const getCronofyAvailability = async (date, timezone = process.env.CRONOFY_TIMEZONE || 'America/New_York') => {
  try {
    ensureConfigured();

    // Minimal placeholder: Return hourly slots 9-17 as available.
    // Implement Cronofy Availability API if you need real-time availability aggregation.
    const slots = [];
    const baseDate = new Date(date);
    for (let hour = 9; hour < 17; hour++) {
      const start = new Date(baseDate);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 1, 0, 0, 0);
      slots.push({ startTime: start.toISOString(), endTime: end.toISOString(), available: true });
    }
    return slots;
  } catch (error) {
    console.error('❌ Cronofy Availability Error:', error.response?.data || error.message);
    if (process.env.NODE_ENV === 'development') {
      const slots = [];
      const baseDate = new Date(date);
      for (let hour = 9; hour < 17; hour++) {
        const start = new Date(baseDate);
        start.setHours(hour, 0, 0, 0);
        const end = new Date(start);
        end.setHours(hour + 1, 0, 0, 0);
        slots.push({ startTime: start.toISOString(), endTime: end.toISOString(), available: true });
      }
      return slots;
    }
    throw error;
  }
};

module.exports = {
  createCronofyEvent,
  getCronofyAvailability
};


