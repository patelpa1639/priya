// Test utility for simulating Vapi webhook calls
export const sampleVapiWebhook = {
  id: "call_123456789",
  status: "completed",
  caller: {
    number: "+1234567890",
    name: "John Doe"
  },
  transcript: `Agent: Hello, thank you for calling our customer service. How can I help you today?

Caller: Hi, I'm calling about my recent order. I placed an order last week for a laptop, order number 12345, and I haven't received any shipping confirmation yet.

Agent: I understand your concern. Let me look up your order for you. Can you please confirm your order number is 12345?

Caller: Yes, that's correct. Order number 12345.

Agent: Thank you. I can see your order in our system. It was placed on March 15th and is currently being processed. The estimated shipping date is March 20th, which is tomorrow. You should receive a shipping confirmation email by the end of the day.

Caller: Oh, that's good to know. I was getting worried because I need this laptop for work next week.

Agent: I completely understand. Your order is on track and should arrive by March 22nd based on our standard shipping. Would you like me to send you an email confirmation with these details?

Caller: Yes, that would be great. My email is john.doe@example.com.

Agent: Perfect. I've sent a confirmation email to john.doe@example.com with your order details and estimated delivery date. Is there anything else I can help you with today?

Caller: No, that's all I needed. Thank you for your help!

Agent: You're very welcome! Thank you for choosing our service. Have a great day!

Caller: You too. Goodbye!

Agent: Goodbye!`,
  summary: "Customer called about order #12345 status. Order is processing and will ship March 20th with delivery by March 22nd. Confirmation email sent to john.doe@example.com.",
  metadata: {
    orderNumber: "12345",
    customerEmail: "john.doe@example.com"
  },
  duration: 180, // 3 minutes in seconds
  cost: 0.15,
  created_at: "2024-03-19T10:30:00Z",
  ended_at: "2024-03-19T10:33:00Z"
};

export const sampleVapiWebhookIncomplete = {
  id: "call_123456790",
  status: "in-progress",
  caller: {
    number: "+1234567891",
    name: "Jane Smith"
  },
  created_at: "2024-03-19T11:00:00Z"
};

// Function to test the webhook locally
export async function testWebhookLocally() {
  try {
    const response = await fetch('http://localhost:3000/api/webhook/vapi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vapi-Webhook-Test/1.0'
      },
      body: JSON.stringify(sampleVapiWebhook)
    });

    const result = await response.json();
    console.log('Webhook test result:', result);
    return result;
  } catch (error) {
    console.error('Error testing webhook:', error);
    throw error;
  }
}

// Function to test incomplete call
export async function testIncompleteWebhook() {
  try {
    const response = await fetch('http://localhost:3000/api/webhook/vapi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vapi-Webhook-Test/1.0'
      },
      body: JSON.stringify(sampleVapiWebhookIncomplete)
    });

    const result = await response.json();
    console.log('Incomplete webhook test result:', result);
    return result;
  } catch (error) {
    console.error('Error testing incomplete webhook:', error);
    throw error;
  }
} 