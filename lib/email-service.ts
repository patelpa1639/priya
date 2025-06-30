import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Email template for Priya's call summaries
export function createPriyaEmailContent(callData: any, summary: string) {
  // Handle Vapi's data structure
  const callId = callData.call?.id || callData.id;
  const callStatus = callData.call?.status || callData.status;
  const duration = callData.durationSeconds ? `${Math.round(callData.durationSeconds / 60)} minutes` : 
                   callData.duration ? `${Math.round(callData.duration / 60)} minutes` : 'Unknown';
  const cost = callData.cost ? `$${callData.cost.toFixed(4)}` : 'Unknown';
  const callDate = callData.created_at ? new Date(callData.created_at).toLocaleString() : new Date().toLocaleString();

  return {
    subject: `📞 Call Summary from ${process.env.ASSISTANT_NAME || 'Priya'} - ${callData.caller?.name || callData.caller?.number || 'Unknown Caller'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 28px;">🤖 ${process.env.ASSISTANT_NAME || 'Priya'}</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 16px;">Your Personal AI Assistant</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 10px 0; font-size: 20px;">📞 Call Summary Report</h2>
            <p style="margin: 0; opacity: 0.9;">I've handled a call for you and here's what happened</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Call Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Call ID:</td>
                <td style="padding: 8px 0; color: #333;">${callId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Caller:</td>
                <td style="padding: 8px 0; color: #333;">${callData.caller?.name || 'Unknown'} (${callData.caller?.number || 'No number'})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Date & Time:</td>
                <td style="padding: 8px 0; color: #333;">${callDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Duration:</td>
                <td style="padding: 8px 0; color: #333;">${duration}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Cost:</td>
                <td style="padding: 8px 0; color: #333;">${cost}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: ${callStatus === 'completed' ? '#10b981' : '#f59e0b'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${callStatus}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="margin-top: 0; font-size: 18px;">🤖 AI Summary</h3>
            <div style="background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 6px;">
              <p style="line-height: 1.6; margin: 0; font-size: 14px;">
                ${summary.replace(/\n/g, '<br>')}
              </p>
            </div>
          </div>

          ${callData.transcript ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">📝 Full Conversation</h3>
            <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #6366f1; max-height: 300px; overflow-y: auto;">
              <pre style="margin: 0; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 12px; color: #333; line-height: 1.4;">${callData.transcript}</pre>
            </div>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This summary was automatically generated by ${process.env.ASSISTANT_NAME || 'Priya'}, your personal AI assistant.
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">
              Call ID: ${callId} | Generated at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
🤖 ${process.env.ASSISTANT_NAME || 'Priya'} - Your Personal AI Assistant
📞 Call Summary Report

Call Details:
- Call ID: ${callId}
- Caller: ${callData.caller?.name || 'Unknown'} (${callData.caller?.number || 'No number'})
- Date & Time: ${callDate}
- Duration: ${duration}
- Cost: ${cost}
- Status: ${callStatus}

🤖 AI Summary:
${summary}

${callData.transcript ? `
📝 Full Conversation:
${callData.transcript}
` : ''}

---
This summary was automatically generated by ${process.env.ASSISTANT_NAME || 'Priya'}, your personal AI assistant.
Call ID: ${callId} | Generated at: ${new Date().toLocaleString()}
    `,
  };
}

// Send email using SendGrid
export async function sendEmail(emailContent: { subject: string; html: string; text: string }) {
  try {
    const msg = {
      to: process.env.SENDGRID_TO_EMAIL!,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await sgMail.send(msg);
    console.log('Email sent successfully via SendGrid:', info[0].statusCode);
    return { success: true, messageId: info[0].headers['x-message-id'] };
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    throw new Error('Failed to send email');
  }
}

// Test email function
export async function testEmailConnection() {
  try {
    // Test SendGrid connection by sending a test email
    const testMsg = {
      to: process.env.SENDGRID_TO_EMAIL!,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: 'Test from Priya',
      text: 'This is a test email from Priya to verify SendGrid connection.',
    };

    await sgMail.send(testMsg);
    return { success: true, message: 'SendGrid connection verified' };
  } catch (error) {
    console.error('SendGrid connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 