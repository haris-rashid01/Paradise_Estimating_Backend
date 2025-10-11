require('dotenv').config();
const { query, connectDB } = require('./connection');

const createTables = async () => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Connect to database first
    await connectDB();

    // Create contacts table
    await query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        trade_service VARCHAR(255),
        message TEXT NOT NULL,
        file_name VARCHAR(255),
        file_path VARCHAR(500),
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Contacts table created');

    // Ensure trade_service exists on older databases
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'contacts' AND column_name = 'trade_service'
        ) THEN
          ALTER TABLE contacts ADD COLUMN trade_service VARCHAR(255);
        END IF;
      END $$;
    `);
    console.log('✅ Verified contacts.trade_service column');

    // Create consultations table
    await query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        project_type VARCHAR(100),
        budget_range VARCHAR(100),
        preferred_date DATE,
        preferred_time TIME,
        message TEXT,
        calendly_event_id VARCHAR(255),
        calendly_event_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Consultations table created');

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_consultations_email ON consultations(email);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_consultations_calendly_event_id ON consultations(calendly_event_id);
    `);
    console.log('✅ Database indexes created');

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('🎉 Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables };