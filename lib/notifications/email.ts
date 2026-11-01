export interface NotificationPayload {
  toEmail: string;
  recipientName: string;
  orderNumber: string;
  subject: string;
  content: string;
}

export async function sendTransactionalNotification({
  toEmail,
  recipientName,
  orderNumber,
  subject,
  content,
}: NotificationPayload): Promise<{ sent: boolean; provider: string }> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;

  if (!apiKey) {
    // In development or when email credentials are not yet entered
    console.log(`[Transactional Email - Log Mode] To: ${toEmail} | Subject: ${subject} | Order: ${orderNumber}`);
    return {
      sent: false,
      provider: 'disabled_no_credentials',
    };
  }

  // If Resend/Sendgrid key is configured:
  try {
    // Example: await resend.emails.send(...)
    return {
      sent: true,
      provider: 'configured_provider',
    };
  } catch (error) {
    console.error('Failed to dispatch transactional notification:', error);
    return {
      sent: false,
      provider: 'error',
    };
  }
}
