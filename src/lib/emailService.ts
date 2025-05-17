// Browser-compatible email service
// Since nodemailer is a Node.js library and doesn't work in the browser,
// we'll create a mock implementation that logs emails instead of sending them

// In a production environment, you would use a backend API endpoint to send emails

// Mock email configuration
const emailConfig = {
  service: 'gmail',
  from: 'scholar.scorecard@gmail.com',
};

// Mock transporter that logs emails instead of sending them
const transporter = {
  sendMail: (mailOptions: any) => {
    console.log('Email would be sent in production:', mailOptions);
    return Promise.resolve({ success: true, message: 'Email logged (not actually sent in browser environment)' });
  }
};

// Email templates
const emailTemplates = {
  // Faculty notifications
  documentApproved: (facultyName: string, documentTitle: string, facultyEmail: string) => ({
    to: facultyEmail,
    subject: 'Document Approved - Scholar Scorecard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0e7490; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Scholar Scorecard</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear ${facultyName},</p>
          <p>We are pleased to inform you that your document <strong>${documentTitle}</strong> has been approved.</p>
          <p>The credits have been added to your profile.</p>
          <p>Thank you for your contribution!</p>
          <div style="margin-top: 30px;">
            <a href="http://localhost:3000/dashboard" style="background-color: #0e7490; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Dashboard</a>
          </div>
        </div>
        <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated message from Scholar Scorecard System. Please do not reply to this email.</p>
        </div>
      </div>
    `,
  }),

  documentRevisable: (facultyName: string, documentTitle: string, comments: string, facultyEmail: string) => ({
    to: facultyEmail,
    subject: 'Document Needs Revision - Scholar Scorecard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0e7490; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Scholar Scorecard</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear ${facultyName},</p>
          <p>Your document <strong>${documentTitle}</strong> requires some revisions before it can be approved.</p>
          <p><strong>Reviewer Comments:</strong></p>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #0e7490; margin: 15px 0;">
            ${comments}
          </div>
          <p>Please make the necessary changes and resubmit your document.</p>
          <div style="margin-top: 30px;">
            <a href="http://localhost:3000/dashboard" style="background-color: #0e7490; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Document</a>
          </div>
        </div>
        <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated message from Scholar Scorecard System. Please do not reply to this email.</p>
        </div>
      </div>
    `,
  }),

  documentRejected: (facultyName: string, documentTitle: string, reason: string, facultyEmail: string) => ({
    to: facultyEmail,
    subject: 'Document Rejected - Scholar Scorecard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0e7490; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Scholar Scorecard</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear ${facultyName},</p>
          <p>We regret to inform you that your document <strong>${documentTitle}</strong> has been rejected.</p>
          <p><strong>Reason for Rejection:</strong></p>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0;">
            ${reason}
          </div>
          <p>If you have any questions, please contact your department head.</p>
          <div style="margin-top: 30px;">
            <a href="http://localhost:3000/dashboard" style="background-color: #0e7490; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Dashboard</a>
          </div>
        </div>
        <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated message from Scholar Scorecard System. Please do not reply to this email.</p>
        </div>
      </div>
    `,
  }),

  // HOD notifications
  newDocumentSubmitted: (hodName: string, facultyName: string, documentTitle: string, hodEmail: string) => ({
    to: hodEmail,
    subject: 'New Document Submitted - Scholar Scorecard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0e7490; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Scholar Scorecard</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear ${hodName},</p>
          <p>A new document has been submitted for review:</p>
          <ul style="background-color: #f9fafb; padding: 15px; border-radius: 4px;">
            <li><strong>Faculty:</strong> ${facultyName}</li>
            <li><strong>Document Title:</strong> ${documentTitle}</li>
          </ul>
          <p>Please review this document at your earliest convenience.</p>
          <div style="margin-top: 30px;">
            <a href="http://localhost:3000/dashboard" style="background-color: #0e7490; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Review Document</a>
          </div>
        </div>
        <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated message from Scholar Scorecard System. Please do not reply to this email.</p>
        </div>
      </div>
    `,
  }),

  // Admin notifications
  credentialRequest: (adminEmail: string, requesterName: string, requesterEmail: string, requesterRole: string, requesterDepartment: string) => ({
    to: adminEmail,
    subject: 'New Credential Request - Scholar Scorecard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0e7490; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Scholar Scorecard</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Dear Administrator,</p>
          <p>A new credential request has been submitted:</p>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #0e7490; margin: 15px 0;">
            <p><strong>Name:</strong> ${requesterName}</p>
            <p><strong>Email:</strong> ${requesterEmail}</p>
            <p><strong>Requested Role:</strong> ${requesterRole}</p>
            <p><strong>Department:</strong> ${requesterDepartment}</p>
          </div>
          <p>Please review this request and create appropriate credentials if approved.</p>
          <div style="margin-top: 30px;">
            <a href="http://localhost:3000/admin/users" style="background-color: #0e7490; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Manage Users</a>
          </div>
        </div>
        <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated message from Scholar Scorecard System. Please do not reply to this email.</p>
        </div>
      </div>
    `,
  }),
};

// Email sending functions
export const emailService = {
  // Send email function - browser-compatible version
  sendEmail: async (mailOptions: any) => {
    try {
      // In a real application, this would call a backend API endpoint
      // For now, we'll just log the email and return a success response
      const info = await transporter.sendMail({
        ...mailOptions,
        from: emailConfig.from
      });
      console.log('Email would be sent in production:', mailOptions);
      return { success: true, messageId: 'mock-email-id-' + Date.now() };
    } catch (error) {
      console.error('Error sending email:', error);
      // Return a success response even if there's an error to prevent app crashes
      return { success: false, error: error };
    }
  },

  // Faculty notifications
  notifyDocumentApproved: async (facultyName: string, documentTitle: string, facultyEmail: string) => {
    const mailOptions = emailTemplates.documentApproved(facultyName, documentTitle, facultyEmail);
    return emailService.sendEmail(mailOptions);
  },

  notifyDocumentRevisable: async (facultyName: string, documentTitle: string, comments: string, facultyEmail: string) => {
    const mailOptions = emailTemplates.documentRevisable(facultyName, documentTitle, comments, facultyEmail);
    return emailService.sendEmail(mailOptions);
  },

  notifyDocumentRejected: async (facultyName: string, documentTitle: string, reason: string, facultyEmail: string) => {
    const mailOptions = emailTemplates.documentRejected(facultyName, documentTitle, reason, facultyEmail);
    return emailService.sendEmail(mailOptions);
  },

  // HOD notifications
  notifyNewDocumentSubmitted: async (hodName: string, facultyName: string, documentTitle: string, hodEmail: string) => {
    const mailOptions = emailTemplates.newDocumentSubmitted(hodName, facultyName, documentTitle, hodEmail);
    return emailService.sendEmail(mailOptions);
  },

  // Admin notifications
  notifyCredentialRequest: async (adminEmail: string, requesterName: string, requesterEmail: string, requesterRole: string, requesterDepartment: string) => {
    try {
      const mailOptions = emailTemplates.credentialRequest(adminEmail, requesterName, requesterEmail, requesterRole, requesterDepartment);
      return await emailService.sendEmail(mailOptions);
    } catch (error) {
      console.error('Error sending credential request notification:', error);
      throw error;
    }
  },
};
