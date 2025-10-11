const { query } = require('../database/connection');

const createConsultation = async (consultationData) => {
  const {
    name,
    email,
    phone,
    company,
    projectType,
    budgetRange,
    preferredDate,
    preferredTime,
    message,
    calendlyEventId,
    calendlyEventUrl
  } = consultationData;

  const result = await query(
    `INSERT INTO consultations 
     (name, email, phone, company, project_type, budget_range, preferred_date, preferred_time, message, calendly_event_id, calendly_event_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [name, email, phone, company, projectType, budgetRange, preferredDate, preferredTime, message, calendlyEventId, calendlyEventUrl]
  );

  return result.rows[0];
};

const getAllConsultations = async (options = {}) => {
  const { page = 1, limit = 10, status } = options;
  const offset = (page - 1) * limit;

  let whereClause = '';
  let params = [limit, offset];
  
  if (status) {
    whereClause = 'WHERE status = $3';
    params.push(status);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM consultations ${whereClause}`;
  const countParams = status ? [status] : [];
  const countResult = await query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);

  // Get consultations
  const consultationsQuery = `
    SELECT id, name, email, phone, company, project_type, budget_range, 
           preferred_date, preferred_time, message, calendly_event_url, 
           status, created_at, updated_at
    FROM consultations 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2
  `;
  
  const consultationsResult = await query(consultationsQuery, params);

  return {
    consultations: consultationsResult.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getConsultationById = async (id) => {
  const result = await query(
    'SELECT * FROM consultations WHERE id = $1',
    [id]
  );

  return result.rows[0];
};

const updateConsultationStatus = async (id, status) => {
  const result = await query(
    `UPDATE consultations 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

const getConsultationByCalendlyId = async (calendlyEventId) => {
  const result = await query(
    'SELECT * FROM consultations WHERE calendly_event_id = $1',
    [calendlyEventId]
  );

  return result.rows[0];
};

module.exports = {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultationStatus,
  getConsultationByCalendlyId
};