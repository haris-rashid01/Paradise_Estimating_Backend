const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use console logging if SMTP not configured
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.log('⚠️  SMTP not configured, using console logging for emails');
    return {
      sendMail: async (options) => {
        console.log('📧 Email would be sent:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.html || options.text);
        return { messageId: 'console-' + Date.now() };
      }
    };
  }

  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = process.env.SMTP_SECURE
    ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
    : port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
  });

  transporter.verify((err) => {
    if (err) {
      console.log('❌ SMTP verify failed:', err.message);
    } else {
      console.log('✅ SMTP transporter ready');
    }
  });

  return transporter;
};

const sendContactNotification = async (contactData) => {
  const transporter = createTransporter();

  const { name, email, phone, company, trade, message, fileName, filePath } = contactData;
  const adminEmail = process.env.ADMIN_EMAIL || 'estimatinghub788@gmail.com';
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@estimatinghub.com';

  // Email to admin
  const adminMailOptions = {
    from: fromAddress,
    to: adminEmail,
    replyTo: email,
    subject: `🔔 New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">🔔 New Contact Form Submission</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-bottom: 15px;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            ${trade ? `<p><strong>Trade Service:</strong> ${trade}</p>` : ''}
            ${fileName ? `<p><strong>Attached File:</strong> ${fileName}</p>` : ''}
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 6px;">
            <h3 style="color: #374151; margin-bottom: 15px;">Message</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 6px;">
            <p style="margin: 0; color: #92400e;">
              <strong>⚡ Action Required:</strong> Please respond to this inquiry within 24 hours.
            </p>
          </div>
        </div>
      </div>
    `,
    attachments: filePath ? [
      {
        filename: fileName || 'attachment',
        path: filePath,
        contentDisposition: 'attachment'
      }
    ] : [],
  };

  // Auto-reply to customer
  const siteUrl = process.env.SITE_URL || 'https://estimatinghub.com/';
  const logoUrl = process.env.BRAND_LOGO_URL || `${siteUrl}/logo.png`;
  const facebookUrl = process.env.SOCIAL_FACEBOOK_URL || `${siteUrl}`;
  const instagramUrl = process.env.SOCIAL_INSTAGRAM_URL || `${siteUrl}`;
  const linkedinUrl = process.env.SOCIAL_LINKEDIN_URL || `${siteUrl}`;

  const customerMailOptions = {
    from: fromAddress,
    to: email,
    subject: '✅ Thank you for contacting Estimating Hub',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f6f7fb; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto;">
          <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 24px rgba(17,24,39,0.08);">
            <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 28px 24px; color: #ffffff; text-align: center;">
              <div style="margin-bottom: 10px;">
                <img src="${logoUrl}" alt="Estimating Hub" style="max-height: 36px; max-width: 180px; display: inline-block;" onerror="this.style.display='none'" />
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Thank you, ${name}!</h1>
              <p style="margin: 8px 0 0; opacity: 0.95;">We've received your message and started reviewing it.</p>
            </div>

            <div style="padding: 24px;">
              <p style="margin: 0 0 12px; color: #111827; font-size: 16px;">Hi ${name},</p>
              <p style="margin: 0 0 12px; color: #374151; line-height: 1.6;">
                Thanks for contacting Estimating Hub. Our team will get back to you as soon as possible.
                We typically respond within <strong>24 hours</strong> — often much sooner.
              </p>

              <div style="margin: 18px 0; padding: 16px; background: #f3f4f6; border-radius: 10px;">
                <p style="margin: 0 0 10px; color: #111827; font-weight: 600;">What happens next?</p>
                <ul style="margin: 0; padding-left: 18px; color: #4b5563; line-height: 1.7;">
                  <li>We review your details and any files you provided</li>
                  <li>We may reach out for quick clarifications if needed</li>
                  <li>You'll receive a response with next steps and a timeline</li>
                </ul>
              </div>

              <div style="margin: 22px 0 0;">
                <a href="mailto:sales@estimatinghub.com" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;">Reply to this email</a>
                <a href="${siteUrl}/services" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; margin-left: 8px;">View our services</a>
              </div>

              <div style="margin: 24px 0 0; padding: 16px; background: #ecfeff; border: 1px solid #bae6fd; border-radius: 10px;">
                <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                  Prefer to talk now? Call us at <strong>+(212) 450-7419</strong> (Mon–Fri, 9:00 AM – 5:00 PM).
                </p>
              </div>
            </div>

            <div style="padding: 18px 24px; background: #f9fafb; border-top: 1px solid #eef2f7; text-align: center; color: #6b7280; font-size: 13px;">
              <div style="margin-bottom: 8px;">
                <a href="${facebookUrl}" style="color:#2563eb; text-decoration:none; margin: 0 8px;">Facebook</a>
                <a href="${instagramUrl}" style="color:#2563eb; text-decoration:none; margin: 0 8px;">Instagram</a>
                <a href="${linkedinUrl}" style="color:#2563eb; text-decoration:none; margin: 0 8px;">LinkedIn</a>
              </div>
              <div>Estimating Hub • 876 70th street Brooklyn NY 11228</div>
              <div style="margin-top: 6px;">You can reply directly to this email if you have more details to share.</div>
              <div style="margin-top: 6px; font-size: 12px; color: #9ca3af;">This is a confirmation email for your inquiry, not a subscription. No action needed.</div>
            </div>
          </div>
        </div>
      </div>
    `,
  };

  // Send both emails with independent outcome handling
  const results = await Promise.allSettled([
    transporter.sendMail(adminMailOptions),
    transporter.sendMail(customerMailOptions)
  ]);

  const [adminResult, customerResult] = results;
  if (adminResult.status === 'fulfilled') {
    console.log('✅ Admin email sent:', adminResult.value && adminResult.value.messageId);
  } else {
    console.error('❌ Failed to send admin email:', adminResult.reason && adminResult.reason.message);
  }

  if (customerResult.status === 'fulfilled') {
    console.log('✅ Auto-reply sent:', customerResult.value && customerResult.value.messageId);
  } else {
    console.error('❌ Failed to send auto-reply:', customerResult.reason && customerResult.reason.message);
  }
};

const sendConsultationConfirmation = async (consultationData) => {
  const transporter = createTransporter();

  const { name, email, phone, company, preferredDate, preferredTime, calendlyEventUrl, message } = consultationData;
  const adminEmail = process.env.ADMIN_EMAIL || 'ingt1175@gmail.com';
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@estimatinghub.com';

  // Admin notification
  const adminMailOptions = {
    from: fromAddress,
    to: adminEmail,
    replyTo: email,
    subject: `📅 New Consultation Booking from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">📅 New Consultation Booking</h2>
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-bottom: 15px;">Client Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-bottom: 15px;">Consultation Details</h3>
            <p><strong>Date:</strong> ${new Date(preferredDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${preferredTime}</p>
            ${calendlyEventUrl ? `<p><strong>Meeting Link:</strong> <a href="${calendlyEventUrl}" style="color: #2563eb;">Join Meeting</a></p>` : ''}
            ${message ? `<p><strong>Notes:</strong> ${message}</p>` : ''}
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 6px;">
            <p style="margin: 0; color: #92400e;"><strong>⚡ Action Required:</strong> Please confirm details and follow up.</p>
          </div>
        </div>
      </div>
    `,
  };

  // Customer confirmation (auto-reply)
  const customerMailOptions = {
    from: fromAddress,
    to: email,
    subject: '📅 Consultation Scheduled - Estimating Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">📅 Consultation Confirmed</h2>
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <p>Dear ${name},</p>
            <p>Your consultation has been successfully scheduled! 🎉</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #374151; margin-bottom: 10px;">📋 Consultation Details</h3>
              <p><strong>Date:</strong> ${new Date(preferredDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${preferredTime}</p>
              ${calendlyEventUrl ? `<p><strong>Meeting Link:</strong> <a href="${calendlyEventUrl}" style="color: #2563eb;">Join Meeting</a></p>` : ''}
            </div>
            <p>We'll discuss your project requirements and provide you with a detailed estimate.</p>
            <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 6px;">
            <h3 style="color: #374151; margin-bottom: 15px;">📝 What to Prepare</h3>
            <ul>
              <li>Project plans or sketches (if available)</li>
              <li>Budget range and timeline</li>
              <li>Specific requirements or preferences</li>
              <li>Any questions about our services</li>
            </ul>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px;">Looking forward to speaking with you! 🚀<br>The Estimating Hub Team</p>
          </div>
        </div>
      </div>
    `,
  };

  const results = await Promise.allSettled([
    transporter.sendMail(adminMailOptions),
    transporter.sendMail(customerMailOptions)
  ]);

  const [adminResult, customerResult] = results;
  if (adminResult.status === 'fulfilled') {
    console.log('✅ Consultation admin email sent:', adminResult.value && adminResult.value.messageId);
  } else {
    console.error('❌ Failed to send consultation admin email:', adminResult.reason && adminResult.reason.message);
  }

  if (customerResult.status === 'fulfilled') {
    console.log('✅ Consultation auto-reply sent:', customerResult.value && customerResult.value.messageId);
  } else {
    console.error('❌ Failed to send consultation auto-reply:', customerResult.reason && customerResult.reason.message);
  }
};

module.exports = {
  sendContactNotification,
  sendConsultationConfirmation
};