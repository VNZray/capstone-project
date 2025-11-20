import emailjs from "@emailjs/browser";

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = "6Nr8iKHGr3Z3OCIEM";
const EMAILJS_SERVICE_ID = "default_service";
const EMAILJS_TEMPLATE_ID = "template_hlprxx5";

/**
 * Initialize EmailJS with public key
 * Call this once when the app starts or before sending emails
 */
export const initializeEmailJS = () => {
  emailjs.init(EMAILJS_PUBLIC_KEY);
};

/**
 * Send account credentials via email
 * @param toEmail - Recipient email address
 * @param toName - Recipient name
 * @param email - Account email
 * @param password - Account password
 */
export const sendAccountCredentials = async (
  toEmail: string,
  toName: string,
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: toEmail,
        to_name: toName,
        email: email,
        password: password,
      }
    );

    console.log("✅ Email sent successfully:", response.status, response.text);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
};

/**
 * Send staff account credentials
 * @param staffEmail - Staff email address
 * @param staffName - Staff full name
 * @param password - Default password
 */
export const sendStaffCredentials = async (
  staffEmail: string,
  staffName: string,
  password: string = "staff123"
): Promise<boolean> => {
  return sendAccountCredentials(staffEmail, staffName, staffEmail, password);
};
