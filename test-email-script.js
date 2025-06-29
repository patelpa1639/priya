const fetch = require('node-fetch');

async function testEmail() {
  try {
    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'your-email@example.com', // Replace with your email
        subject: 'Test from Priya',
        text: 'Hello! This is a test email from Priya. If you receive this, the email system is working!',
        html: '<h1>Hello from Priya! 🤖</h1><p>This is a test email to verify the email system is working correctly.</p><p>Best regards,<br>Priya</p>'
      })
    });

    const result = await response.json();
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Failed to send email');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail(); 