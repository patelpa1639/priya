'use client';

import { useState } from 'react';
import { testWebhookLocally, testIncompleteWebhook, sampleVapiWebhook } from '@/lib/test-webhook';

export default function TestWebhookPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestCompleteCall = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await testWebhookLocally();
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestIncompleteCall = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await testIncompleteWebhook();
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Vapi Webhook Tester
          </h1>
          <p className="text-lg text-gray-600">
            Test your Vapi webhook integration with sample data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Test Controls</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleTestCompleteCall}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Testing...' : 'Test Complete Call'}
              </button>
              
              <button
                onClick={handleTestIncompleteCall}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Testing...' : 'Test Incomplete Call'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Prerequisites</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Set up your environment variables in .env.local</li>
                <li>• Ensure your development server is running</li>
                <li>• Configure OpenAI and SendGrid API keys</li>
              </ul>
            </div>
          </div>

          {/* Sample Data Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Sample Data</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Call Details</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>ID:</strong> {sampleVapiWebhook.id}</p>
                  <p><strong>Caller:</strong> {sampleVapiWebhook.caller.name} ({sampleVapiWebhook.caller.number})</p>
                  <p><strong>Duration:</strong> {Math.round(sampleVapiWebhook.duration! / 60)} minutes</p>
                  <p><strong>Cost:</strong> ${sampleVapiWebhook.cost}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Transcript Preview</h3>
                <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-xs">
                    {sampleVapiWebhook.transcript.substring(0, 200)}...
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Test Results</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Success</h3>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">
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

        {/* Environment Setup Guide */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Environment Setup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Required Environment Variables</h3>
              <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                <p>OPENAI_API_KEY=your_openai_api_key</p>
                <p>SENDGRID_API_KEY=your_sendgrid_api_key</p>
                <p>SENDGRID_FROM_EMAIL=your_verified_sender@example.com</p>
                <p>SENDGRID_TO_EMAIL=your_email@example.com</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Setup Steps</h3>
              <ol className="text-sm space-y-2">
                <li>1. Get OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a></li>
                <li>2. Get SendGrid API key from <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SendGrid Dashboard</a></li>
                <li>3. Verify your sender email in SendGrid</li>
                <li>4. Update .env.local with your credentials</li>
                <li>5. Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 