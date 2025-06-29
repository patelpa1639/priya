'use client';

import { useState } from 'react';
import { testEmailSending, testEmailEndpoint, sampleSummary } from '@/lib/test-email';

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState(sampleSummary);

  const handleTestEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await testEmailSending(summary);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await testEmailEndpoint();
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📧 Email Sending Tester
          </h1>
          <p className="text-lg text-gray-600">
            Test sending emails with 'Missed Call Summary' subject
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Send Test Email</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary Content
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                  placeholder="Enter the summary content for the email..."
                />
              </div>
              
              <button
                onClick={handleTestEmail}
                disabled={loading || !summary.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
              
              <button
                onClick={handleTestEndpoint}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Testing...' : 'Test Endpoint'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Prerequisites</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Set up SendGrid API key in .env.local</li>
                <li>• Verify your sender email in SendGrid</li>
                <li>• Ensure your development server is running</li>
              </ul>
            </div>
          </div>

          {/* Email Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Email Preview</h2>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">Subject:</h3>
                <p className="text-gray-600">Missed Call Summary</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">To:</h3>
                <p className="text-gray-600">{process.env.NEXT_PUBLIC_SENDGRID_TO_EMAIL || 'your_email@example.com'}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">From:</h3>
                <p className="text-gray-600">{process.env.NEXT_PUBLIC_SENDGRID_FROM_EMAIL || 'your_verified_sender@example.com'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Summary Preview:</h3>
                <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-xs">
                    {summary.substring(0, 200)}
                    {summary.length > 200 ? '...' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Test Results</h2>
            
            <div className={`border rounded-lg p-4 ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✅ Success' : '❌ Error'}
              </h3>
              <pre className={`text-sm whitespace-pre-wrap ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Test Results</h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* API Documentation */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">API Documentation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Endpoint</h3>
              <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                <p>POST /api/send-email</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Request Body</h3>
              <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                <pre>{`{
  "summary": "Your summary text here..."
}`}</pre>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Example cURL</h3>
            <div className="bg-gray-50 p-4 rounded text-sm font-mono overflow-x-auto">
              <pre>{`curl -X POST http://localhost:3000/api/send-email \\
  -H "Content-Type: application/json" \\
  -d '{"summary": "Customer called about order status..."}'`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 