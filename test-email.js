require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  try {
    console.log('🧪 Testing email configuration...');
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'Test Email from Estimating Hub Backend',
      html: `
        <h2>🎉 Email Configuration Test</h2>
        <p>If you receive this email, your SMTP configuration is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    });

    console.log('✅ Test email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('📧 Check your inbox for the test email');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Fix: You need to use a Gmail App Password, not your regular password');
      console.log('1. Go to Google Account → Security → 2-Step Verification');
      console.log('2. Generate App Password for Mail');
      console.log('3. Update SMTP_PASS in .env file');
    }
  }
  
  process.exit(0);
};

testEmail();