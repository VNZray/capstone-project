import fetch from 'node-fetch';

/**
 * Send business approval email notification
 * This uses EmailJS service to send emails when tourism admin approves a business registration
 *
 * @param {string} toEmail - Recipient email address
 * @param {string} ownerName - Name of the business owner
 * @param {string} businessName - Name of the approved business
 * @param {string} username - Login username (usually email)
 */
export async function sendBusinessApprovalEmail(toEmail, ownerName, businessName, username) {
  try {
    // EmailJS configuration - these should match frontend config
    const serviceId = 'service_lxy73ti';
    const templateId = 'template_approval'; // Create this template in EmailJS
    const publicKey = 'vZidjZ7qwqJtN7IMA';

    const templateParams = {
      to_email: toEmail,
      to_name: ownerName,
      business_name: businessName,
      username: username,
      login_url: 'https://your-app-url.com/login', // Update with actual URL
      from_name: 'City Venture Tourism Team',
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      throw new Error(`EmailJS API error: ${response.statusText}`);
    }

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send account credentials email (for new owner registration)
 *
 * @param {string} toEmail - Recipient email address
 * @param {string} ownerName - Name of the business owner
 * @param {string} username - Login username
 * @param {string} password - Temporary password
 */
export async function sendAccountCredentialsEmail(toEmail, ownerName, username, password) {
  try {
    const serviceId = 'service_lxy73ti';
    const templateId = 'template_credentials'; // Create this template in EmailJS
    const publicKey = 'vZidjZ7qwqJtN7IMA';

    const templateParams = {
      to_email: toEmail,
      to_name: ownerName,
      username: username,
      password: password,
      login_url: 'https://your-app-url.com/login', // Update with actual URL
      from_name: 'City Venture Tourism Team',
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      throw new Error(`EmailJS API error: ${response.statusText}`);
    }

    return { success: true, message: 'Credentials email sent successfully' };
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw error;
  }
}
