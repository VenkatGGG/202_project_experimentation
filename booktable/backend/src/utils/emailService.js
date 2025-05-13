const nodemailer = require('nodemailer');
const moment = require('moment'); // For formatting dates

// Helper function for delay between retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configure the transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ch.tharunkumar1@gmail.com',
    pass: 'gtrp aipc sjii fpxs'
  }
});

// Verify transporter configuration with retry logic
const verifyTransporter = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await transporter.verify();
      console.log('Transporter is ready to send emails');
      return true;
    } catch (error) {
      console.error(`Transporter verification attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  return false;
};

// Initialize transporter
verifyTransporter().catch(console.error);

/**
 * Sends a booking confirmation email with retry logic.
 * @param {object} user - The user object (must have email, firstName).
 * @param {object} booking - The booking object (must have date, time, partySize).
 * @param {object} restaurant - The restaurant object (must have name).
 */
const sendBookingConfirmationEmail = async (user, booking, restaurant, retries = 3, delay = 2000) => {
  if (!user || !user.email || !user.firstName) {
    console.error('User details missing:', { 
      hasUser: !!user, 
      hasEmail: !!user?.email, 
      hasFirstName: !!user?.firstName 
    });
    return;
  }
  if (!booking || !booking.date || !booking.time || !booking.partySize) {
    console.error('Booking details missing:', { 
      hasBooking: !!booking, 
      hasDate: !!booking?.date, 
      hasTime: !!booking?.time, 
      hasPartySize: !!booking?.partySize 
    });
    return;
  }
  if (!restaurant || !restaurant.name) {
    console.error('Restaurant details missing:', { 
      hasRestaurant: !!restaurant, 
      hasName: !!restaurant?.name 
    });
    return;
  }

  // Extract YYYY-MM-DD from RAW_DATE_STR:YYYY-MM-DD
  const dateString = booking.date && booking.date.startsWith('RAW_DATE_STR:') 
                   ? booking.date.substring(13) 
                   : booking.date; // Fallback if prefix is missing

  const formattedDate = moment(dateString).format('dddd, MMMM Do YYYY');
  const formattedTime = moment(booking.time, 'HH:mm').format('h:mm A');

  const mailOptions = {
    from: '"BookTable" <ch.tharunkumar1@gmail.com>',
    to: user.email,
    subject: `Your Booking Confirmation at ${restaurant.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Booking Confirmation</h2>
        <p>Dear ${user.firstName},</p>
        <p>Your booking at <strong>${restaurant.name}</strong> is confirmed!</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Booking Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;">📅 Date: ${formattedDate}</li>
            <li style="margin: 10px 0;">⏰ Time: ${formattedTime}</li>
            <li style="margin: 10px 0;">👥 Party Size: ${booking.partySize}</li>
          </ul>
        </div>
        <p>We look forward to serving you!</p>
        <p style="margin-top: 30px;">Best regards,<br/>The BookTable Team</p>
      </div>
    `,
  };

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to send confirmation email to ${user.email} (attempt ${i + 1}/${retries})`);
      const info = await transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent successfully:', info.response);
      return info;
    } catch (error) {
      console.error(`Failed to send booking confirmation email (attempt ${i + 1}/${retries}):`, {
        error: error.message,
        code: error.code,
        command: error.command
      });
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error; // Re-throw on last attempt
      }
    }
  }
};

/**
 * Sends a booking cancellation email with retry logic.
 * @param {object} user - The user object (must have email, firstName).
 * @param {object} booking - The booking object (must have date, time, partySize).
 * @param {object} restaurant - The restaurant object (must have name).
 */
const sendBookingCancellationEmail = async (user, booking, restaurant, retries = 3, delay = 2000) => {
  if (!user || !user.email || !user.firstName) {
    console.error('User details missing:', { 
      hasUser: !!user, 
      hasEmail: !!user?.email, 
      hasFirstName: !!user?.firstName 
    });
    return;
  }
  if (!booking || !booking.date || !booking.time || !booking.partySize) {
    console.error('Booking details missing:', { 
      hasBooking: !!booking, 
      hasDate: !!booking?.date, 
      hasTime: !!booking?.time, 
      hasPartySize: !!booking?.partySize 
    });
    return;
  }
  if (!restaurant || !restaurant.name) {
    console.error('Restaurant details missing:', { 
      hasRestaurant: !!restaurant, 
      hasName: !!restaurant?.name 
    });
    return;
  }

  // Extract YYYY-MM-DD from RAW_DATE_STR:YYYY-MM-DD
  const dateStringCancellation = booking.date && booking.date.startsWith('RAW_DATE_STR:')
                               ? booking.date.substring(13)
                               : booking.date; // Fallback

  const formattedDate = moment(dateStringCancellation).format('dddd, MMMM Do YYYY');
  const formattedTime = moment(booking.time, 'HH:mm').format('h:mm A');

  const mailOptions = {
    from: '"BookTable" <ch.tharunkumar1@gmail.com>',
    to: user.email,
    subject: `Booking Cancellation at ${restaurant.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Booking Cancellation</h2>
        <p>Dear ${user.firstName},</p>
        <p>Your booking at <strong>${restaurant.name}</strong> has been cancelled.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Cancelled Booking Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;">📅 Date: ${formattedDate}</li>
            <li style="margin: 10px 0;">⏰ Time: ${formattedTime}</li>
            <li style="margin: 10px 0;">👥 Party Size: ${booking.partySize}</li>
          </ul>
        </div>
        <p>If you did not request this cancellation, please contact us immediately.</p>
        <p style="margin-top: 30px;">Best regards,<br/>The BookTable Team</p>
      </div>
    `,
  };

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to send cancellation email to ${user.email} (attempt ${i + 1}/${retries})`);
      const info = await transporter.sendMail(mailOptions);
      console.log('Booking cancellation email sent successfully:', info.response);
      return info;
    } catch (error) {
      console.error(`Failed to send booking cancellation email (attempt ${i + 1}/${retries}):`, {
        error: error.message,
        code: error.code,
        command: error.command
      });
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error; // Re-throw on last attempt
      }
    }
  }
};

module.exports = { 
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail 
};
