// Test utility for sending emails via the API endpoint

export const sampleSummary = `Customer called regarding order #12345 status inquiry. 
The order was placed on March 15th and is currently being processed. 
Estimated shipping date is March 20th with delivery by March 22nd. 
Customer expressed concern about needing the laptop for work next week. 
Confirmation email was sent to john.doe@example.com. 
No additional action items required.`;

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