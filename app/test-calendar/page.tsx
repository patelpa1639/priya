'use client';

import { useState } from 'react';

export default function TestCalendarPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testListEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/calendar');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test calendar');
    } finally {
      setLoading(false);
    }
  };

  const testCreateEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: 'Test Meeting with Priya',
          description: 'This is a test meeting created by Priya AI assistant',
          start: tomorrow.toISOString(),
          end: endTime.toISOString(),
          attendees: [{ email: 'test@example.com' }],
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📅 Calendar Integration Tester
          </h1>
          <p className="text-lg text-gray-600">
            Test Priya's calendar management capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Test Calendar Functions</h2>
            
            <div className="space-y-4">
              <button
                onClick={testListEvents}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Testing...' : 'Test List Events'}
              </button>
              
              <button
                onClick={testCreateEvent}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Test Create Event'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Test Results</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">✅ Success</h3>
                <pre className="text-sm text-green-700 whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">How to Use Calendar with Priya</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">📞 During Calls:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Call your Vapi number</li>
                <li>Ask Priya to "schedule a meeting for tomorrow at 2 PM"</li>
                <li>Priya will create the calendar event for you</li>
                <li>She'll confirm the details before creating it</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">🗓️ Calendar Commands:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>"Schedule a meeting with John tomorrow at 3 PM"</li>
                <li>"What's on my calendar for this week?"</li>
                <li>"Book a 30-minute call with Sarah on Friday"</li>
                <li>"Check if I'm free next Tuesday at 10 AM"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 