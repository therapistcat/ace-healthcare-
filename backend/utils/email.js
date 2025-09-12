const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, name = 'User') => {
  try {
    // For development/demo purposes, log the OTP instead of sending email
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 OTP EMAIL (Development Mode):');
      console.log('📧 To:', email);
      console.log('🔢 OTP:', otp);
      console.log('👤 Name:', name);
      console.log('⏰ Time:', new Date().toLocaleString());
      console.log('─'.repeat(50));

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        messageId: 'dev-mock-' + Date.now(),
        message: 'OTP logged to console (development mode)'
      };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"HealthCare+ Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your HealthCare+ Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HealthCare+ Verification Code</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 HealthCare+</h1>
              <p>Your Health, Our Priority</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for choosing HealthCare+. To complete your account verification, please use the following One-Time Password (OTP):</p>
              
              <div class="otp-box">
                <p>Your Verification Code:</p>
                <div class="otp-code">${otp}</div>
                <p><small>This code will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes</small></p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>Never share this code with anyone</li>
                  <li>HealthCare+ will never ask for your OTP over phone or email</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
              
              <p>Once verified, you'll have access to:</p>
              <ul>
                <li>📱 Smart medication reminders</li>
                <li>📊 Health data tracking</li>
                <li>👨‍⚕️ Doctor consultations</li>
                <li>💰 Government scheme benefits</li>
                <li>👨‍👩‍👧‍👦 Family health monitoring</li>
              </ul>
              
              <p>If you have any questions, our support team is here to help!</p>
            </div>
            <div class="footer">
              <p>© 2024 HealthCare+. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name, role) => {
  try {
    const transporter = createTransporter();
    
    const roleMessages = {
      patient: {
        title: 'Welcome to Your Health Journey!',
        features: [
          '💊 Smart medication tracking and reminders',
          '📊 Comprehensive health data monitoring',
          '🏥 Easy appointment booking and management',
          '💰 Government health scheme discovery',
          '👨‍👩‍👧‍👦 Family health coordination'
        ]
      },
      family: {
        title: 'Welcome to Family Care!',
        features: [
          '👥 Monitor your loved ones\' health remotely',
          '🚨 Receive real-time health alerts',
          '💊 Track medication adherence',
          '📱 Coordinate care with family members',
          '🏥 Manage appointments for family'
        ]
      },
      doctor: {
        title: 'Welcome to HealthCare+ Professional!',
        features: [
          '👨‍⚕️ Comprehensive patient management dashboard',
          '📊 Real-time patient health monitoring',
          '💊 Medication adherence tracking',
          '📅 Appointment scheduling and management',
          '📋 Digital prescription and report management'
        ]
      }
    };

    const roleData = roleMessages[role] || roleMessages.patient;
    
    const mailOptions = {
      from: `"HealthCare+ Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${roleData.title} - HealthCare+`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to HealthCare+</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature-list { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .cta-button { background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 HealthCare+</h1>
              <h2>${roleData.title}</h2>
            </div>
            <div class="content">
              <h2>Welcome ${name}!</h2>
              <p>Congratulations! Your HealthCare+ account has been successfully created. You now have access to India's most comprehensive digital health platform.</p>
              
              <div class="feature-list">
                <h3>🚀 What you can do now:</h3>
                <ul>
                  ${roleData.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
              </div>
              
              <p>🎯 <strong>Getting Started:</strong></p>
              <ol>
                <li>Complete your health profile</li>
                <li>Add your current medications</li>
                <li>Set up medication reminders</li>
                <li>Connect with family members</li>
                <li>Explore government health schemes</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="cta-button">Start Your Health Journey</a>
              </div>
              
              <p>💡 <strong>Pro Tip:</strong> Enable notifications to never miss a medication dose or important health update!</p>
              
              <p>Our support team is available 24/7 to help you make the most of HealthCare+. Feel free to reach out anytime!</p>
            </div>
            <div class="footer">
              <p>© 2024 HealthCare+. All rights reserved.</p>
              <p>Need help? Contact us at support@healthcare-plus.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send medication reminder email
const sendMedicationReminderEmail = async (email, name, medication) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"HealthCare+ Reminders" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `💊 Medication Reminder: ${medication.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Medication Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .medication-box { background: white; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .urgent { background: #fee2e2; border-color: #ef4444; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💊 Medication Reminder</h1>
              <p>Time for your medication!</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>This is a friendly reminder that it's time to take your medication:</p>
              
              <div class="medication-box">
                <h3>📋 Medication Details:</h3>
                <p><strong>Name:</strong> ${medication.name}</p>
                <p><strong>Dosage:</strong> ${medication.dosage}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                ${medication.instructions ? `<p><strong>Instructions:</strong> ${medication.instructions}</p>` : ''}
              </div>
              
              <p>⏰ <strong>Important:</strong> Taking your medication on time helps ensure the best treatment outcomes.</p>
              
              <p>📱 Don't forget to mark it as taken in the HealthCare+ app to track your adherence!</p>
            </div>
            <div class="footer">
              <p>© 2024 HealthCare+. Helping you stay healthy!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Medication reminder email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending medication reminder email:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment reminder email
const sendAppointmentReminderEmail = async (email, name, appointment) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"HealthCare+ Appointments" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `📅 Appointment Reminder: Dr. ${appointment.doctorName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-box { background: white; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Appointment Reminder</h1>
              <p>Don't forget your upcoming appointment!</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>This is a reminder about your upcoming appointment:</p>
              
              <div class="appointment-box">
                <h3>🏥 Appointment Details:</h3>
                <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
                <p><strong>Specialty:</strong> ${appointment.specialty}</p>
                <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Type:</strong> ${appointment.type}</p>
                ${appointment.location ? `<p><strong>Location:</strong> ${appointment.location}</p>` : ''}
              </div>
              
              <p>📋 <strong>Please remember to:</strong></p>
              <ul>
                <li>Arrive 15 minutes early</li>
                <li>Bring your ID and insurance card</li>
                <li>Bring a list of current medications</li>
                <li>Prepare any questions you want to ask</li>
              </ul>
              
              <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
            </div>
            <div class="footer">
              <p>© 2024 HealthCare+. Your health, our priority!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Appointment reminder email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending appointment reminder email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendMedicationReminderEmail,
  sendAppointmentReminderEmail
};
