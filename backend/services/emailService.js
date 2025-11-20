// Email service for sending invitations
// This is optional - if email is not configured, invites will still be created in the database

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.log('nodemailer not installed. Email functionality disabled.');
}

// Create transporter if email is configured
let transporter = null;

if (nodemailer && process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Send invitation email
 * @param {string} to - Recipient email
 * @param {string} boardName - Name of the board
 * @param {string} inviterName - Name of the person sending the invite
 * @param {string} token - Invitation token
 * @returns {Promise<boolean>} - Returns true if email was sent, false if email is not configured
 */
exports.sendInvitationEmail = async (to, boardName, inviterName, token) => {
  // If email is not configured, skip sending
  if (!transporter) {
    console.log('Email not configured. Invite created in database but email not sent.');
    return false;
  }

  try {
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${token}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Trello Clone'}" <${process.env.EMAIL_USER}>`,
      to,
      subject: `You've been invited to join "${boardName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">You've been invited!</h2>
          <p>Hi there,</p>
          <p><strong>${inviterName}</strong> has invited you to collaborate on the board <strong>"${boardName}"</strong>.</p>
          <p>Click the button below to accept the invitation:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #64748b; word-break: break-all;">${inviteUrl}</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `
        You've been invited!
        
        ${inviterName} has invited you to collaborate on the board "${boardName}".
        
        Accept the invitation by visiting:
        ${inviteUrl}
        
        If you didn't expect this invitation, you can safely ignore this email.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    // Don't throw error - invite is still created in database
    return false;
  }
};

/**
 * Check if email service is configured
 * @returns {boolean}
 */
exports.isEmailConfigured = () => {
  return transporter !== null;
};

