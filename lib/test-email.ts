// Test utility for sending emails via the API endpoint - customized for Priya

export const sampleSummary = `Hi! This is ${process.env.ASSISTANT_NAME || 'Priya'}. I just handled a call for you.

The caller was asking about scheduling a meeting for next week. They mentioned they're available on Tuesday and Thursday afternoon. I told them I'd check your calendar and get back to them.

Key points:
- Meeting request for next week
- Tuesday or Thursday afternoon preferred
- They'll wait for your confirmation

I've noted this in your calendar and will follow up with them once you confirm your availability.`;

// Function to test email sending
export async function testEmailSending(summary: string = sampleSummary) {
  try {
    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary }),
    });

    const result = await response.json();
    console.log('Email test result:', result);
    return result;
  } catch (error) {
    console.error('Error testing email:', error);
    throw error;
  }
}

// Function to test the endpoint status
export async function testEmailEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'GET',
    });

    const result = await response.json();
    console.log('Email endpoint test result:', result);
    return result;
  } catch (error) {
    console.error('Error testing email endpoint:', error);
    throw error;
  }
} 