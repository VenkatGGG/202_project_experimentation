const nodemailer = require('nodemailer');
const moment = require('moment'); // For formatting dates

// Configure the transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Sends a booking confirmation email.
 * @param {object} user - The user object (must have email, firstName).
 * @param {object} booking - The booking object (must have date, time, partySize).
 * @param {object} restaurant - The restaurant object (must have name).
 */
const sendBookingConfirmationEmail = async (user, booking, restaurant) => {
  if (!user || !user.email || !user.firstName) {
    console.error('User details (email, firstName) are required to send email.');
    return;
  }
  if (!booking || !booking.date || !booking.time || !booking.partySize) {
    console.error('Booking details (date, time, partySize) are required.');
    return;
  }
  if (!restaurant || !restaurant.name) {
    console.error('Restaurant details (name) are required.');
    return;
  }

  const formattedDate = moment(booking.date).format('dddd, MMMM Do YYYY');
  const formattedTime = moment(booking.time, 'HH:mm').format('h:mm A');

  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS || '"BookTable" <no-reply@example.com>',
    to: user.email,
    subject: `Your Booking Confirmation at ${restaurant.name}`,
    html: `
      <p>Dear ${user.firstName},</p>
      <p>Your booking at <strong>${restaurant.name}</strong> is confirmed!</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
        <li>Party Size: ${booking.partySize}</li>
      </ul>
      <p>We look forward to seeing you!</p>
      <p>Thanks,<br/>The BookTable Team</p>
    `,
    // text: `...` // Optional: plain text version
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    // Depending on the app's needs, you might want to re-throw or handle differently
  }
};

module.exports = { sendBookingConfirmationEmail };
