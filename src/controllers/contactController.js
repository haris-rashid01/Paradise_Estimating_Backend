const { query } = require('../database/connection');

const createContact = async (contactData) => {
  const {
    name,
    email,
    phone,
    company,
    trade,
    message,
    fileName,
    filePath
  } = contactData;

  const result = await query(
    `INSERT INTO contacts (name, email, phone, company, trade_service, message, file_name, file_path)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, email, phone, company, trade || null, message, fileName || null, filePath || null]
  );

  return result.rows[0];
};

const getAllContacts = async (options = {}) => {
  const { page = 1, limit = 10, status } = options;
  const offset = (page - 1) * limit;

  let whereClause = '';
  let params = [limit, offset];
  
  if (status) {
    whereClause = 'WHERE status = $3';
    params.push(status);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM contacts ${whereClause}`;
  const countParams = status ? [status] : [];
  const countResult = await query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);

  // Get contacts
  const contactsQuery = `
    SELECT id, name, email, phone, company, trade_service, message, file_name, status, created_at, updated_at
    FROM contacts 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2
  `;
  
  const contactsResult = await query(contactsQuery, params);

  return {
    contacts: contactsResult.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getContactById = async (id) => {
  const result = await query(
    'SELECT * FROM contacts WHERE id = $1',
    [id]
  );

  return result.rows[0];
};

const updateContactStatus = async (id, status) => {
  const result = await query(
    `UPDATE contacts 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus
};