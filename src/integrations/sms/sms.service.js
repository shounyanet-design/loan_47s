const axios = require('axios');

/**
 * Sends an OTP SMS using the BulkSMS API
 * 
 * @param {string} phoneNumber - The recipient's phone number (e.g., in international format like +27...)
 * @param {string} otpCode - The 6-digit OTP code to send
 * @param {string} agreementNumber - Optional agreement number for context
 * @returns {Promise<Object>} API response data
 */
const sendOtpSms = async (phoneNumber, otpCode, agreementNumber) => {
  // Step 2: Verify Environment Variables
  console.log("BULKSMS_TOKEN_ID:", process.env.BULKSMS_TOKEN_ID);
  console.log("BULKSMS_TOKEN_SECRET:", process.env.BULKSMS_TOKEN_SECRET ? "FOUND" : "MISSING");
  console.log("BULKSMS_BASIC_AUTH:", process.env.BULKSMS_BASIC_AUTH ? "FOUND" : "MISSING");

  // Step 6: Validate Mobile Number Format
  console.log("SMS Number:", phoneNumber);

  // Step 7: Check Sender ID
  const senderId = undefined; // BulkSMS uses 'from' in payload if custom sender ID is configured
  console.log("Sender ID:", senderId);

  // Step 8: Verify Authentication Method
  const authMethod = process.env.SMS_AUTH_TOKEN ? "Basic Auth" : "Token ID + Token Secret";
  console.log("Authentication Method:", authMethod);

  try {
    const apiUrl = process.env.SMS_API_URL || 'https://api.bulksms.com/v1/messages';
    const authToken = process.env.SMS_AUTH_TOKEN;

    if (!authToken) {
      console.warn('[BulkSMS] SMS_AUTH_TOKEN is missing. SMS dispatch skipped.');
      return { success: false, message: 'SMS Auth token not configured' };
    }

    // Clean formatting: strip spaces and leading + sign to keep only digits
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/\+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '27' + formattedPhone.substring(1);
    }

    const messageText = `Your Point.47 digital agreement ${agreementNumber ? `(${agreementNumber}) ` : ''}OTP is: ${otpCode}. It is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes. Do not share this code with anyone.`;

    const payload = {
      to: formattedPhone,
      body: messageText
    };

    const headers = {
      'Authorization': authToken,
      'Content-Type': 'application/json'
    };

    // Step 3: Log Outgoing Request
    console.log("=== BULKSMS REQUEST ===");
    console.log({
      url: apiUrl,
      headers: headers,
      payload: payload
    });

    console.log(`[BulkSMS] Dispatching SMS OTP to: ${formattedPhone}`);

    const response = await axios.post(apiUrl, payload, { headers });

    // Step 4: Log API Response
    console.log("=== BULKSMS RESPONSE ===");
    console.log(response.status);
    console.log(response.data);

    console.log(`[BulkSMS] SMS successfully sent to ${formattedPhone}. Status: ${response.status}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    // Step 5: Log Errors
    console.log("=== BULKSMS ERROR ===");
    if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Headers:", error.response.headers);
        console.log("Data:", error.response.data);
    } else {
        console.log(error.message);
    }

    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[BulkSMS] Failed to send SMS to ${phoneNumber}:`, errorDetails);
    throw new Error(`SMS dispatch failed: ${error.message}`);
  }
};

module.exports = {
  sendOtpSms
};
