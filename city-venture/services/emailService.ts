

let OTP = null

export const generateOTP = (): string => {
    OTP = Math.floor(100000 + Math.random() * 900000);
    return OTP.toString();
}


/**
 * Send OTP email
 * @param email - Recipient email address
 * @param type - Type of OTP (e.g., "Email Change", "Password Reset", "Verification")
 * @param time - Validity time of the OTP in minutes
 */
export const sendOTP = async (
    email: string,
    type: string,
    time: number
): Promise<boolean> => {
    try {
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        return false;
    }

    return true;
};
