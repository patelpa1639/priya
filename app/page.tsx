'use client';

import { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string }[];
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    attendees: '',
  });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/calendar/events?maxResults=1');
      if (response.ok) {
        setIsAuthenticated(true);
        loadEvents();
      }
    } catch (error) {
      console.log('User not authenticated');
    }
  };

  const getAuthUrl = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      if (data.success) {
        setAuthUrl(data.authUrl);
        window.location.href = data.authUrl;
      }
    } catch (error) {
      setMessage('Failed to get authorization URL');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendar/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      setMessage('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const attendees = newEvent.attendees
        ? newEvent.attendees.split(',').map(email => ({ email: email.trim() }))
        : undefined;

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: newEvent.summary,
          description: newEvent.description,
          start: {
            dateTime: newEvent.startDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: newEvent.endDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          attendees,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Event created successfully!');
        setNewEvent({
          summary: '',
          description: '',
          startDateTime: '',
          endDateTime: '',
          attendees: '',
        });
        loadEvents();
      } else {
        setMessage(data.error || 'Failed to create event');
      }
    } catch (error) {
      setMessage('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Event deleted successfully!');
        loadEvents();
      } else {
        setMessage(data.error || 'Failed to delete event');
      }
    } catch (error) {
      setMessage('Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Google Calendar API Integration
          </h1>
          <p className="text-lg text-gray-600">
            Create and manage calendar events using OAuth2 with refresh tokens
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to authenticate with Google to access your calendar.
            </p>
            <button
              onClick={getAuthUrl}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : 'Connect Google Calendar'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Event Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Create New Event</h2>
              <form onSubmit={createEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={newEvent.summary}
                    onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.startDateTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startDateTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.endDateTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endDateTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendees (comma-separated emails)
                  </label>
                  <input
                    type="text"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </form>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Your Events</h2>
                <button
                  onClick={loadEvents}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No events found</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{event.summary}</h3>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 mb-2">{event.description}</p>
                      )}
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <p><strong>Start:</strong> {formatDateTime(event.start.dateTime)}</p>
                        <p><strong>End:</strong> {formatDateTime(event.end.dateTime)}</p>
                        
                        {event.attendees && event.attendees.length > 0 && (
                          <div>
                            <strong>Attendees:</strong>
                            <ul className="ml-4 mt-1">
                              {event.attendees.map((attendee, index) => (
                                <li key={index}>{attendee.email}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
