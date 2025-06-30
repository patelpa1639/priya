import { NextRequest, NextResponse } from 'next/server';
import { 
  createCalendarEvent, 
  listCalendarEvents, 
  deleteCalendarEvent,
  getAuthUrl 
} from '@/lib/google-calendar';

// Get authentication URL
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    // For demo purposes, using a fixed user ID
    const userId = 'demo-user';
    
    if (action === 'auth-url') {
      const authUrl = getAuthUrl();
      return NextResponse.json({
        success: true,
        authUrl,
      });
    }
    
    // Default action: list events
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    
    const events = await listCalendarEvents(userId, timeMin || undefined, timeMax || undefined, maxResults);
    
    return NextResponse.json({
      success: true,
      events: events.items || [],
    });
  } catch (error: any) {
    console.error('Error in calendar GET:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to access calendar' 
      },
      { status: 500 }
    );
  }
}

// Create calendar event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summary, description, start, end, attendees } = body;
    
    // Validate required fields
    if (!summary || !start || !end) {
      return NextResponse.json(
        { success: false, error: 'Summary, start, and end are required' },
        { status: 400 }
      );
    }
    
    // For demo purposes, using a fixed user ID
    const userId = 'demo-user';
    
    const eventData = {
      summary,
      description,
      start: {
        dateTime: start,
        timeZone: 'America/New_York', // Default timezone
      },
      end: {
        dateTime: end,
        timeZone: 'America/New_York', // Default timezone
      },
      attendees: attendees || [],
    };
    
    const event = await createCalendarEvent(userId, eventData);
    
    return NextResponse.json({
      success: true,
      message: 'Calendar event created successfully',
      event,
    });
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create calendar event' 
      },
      { status: 500 }
    );
  }
}

// Delete calendar event
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // For demo purposes, using a fixed user ID
    const userId = 'demo-user';
    
    await deleteCalendarEvent(userId, eventId);
    
    return NextResponse.json({
      success: true,
      message: 'Calendar event deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete calendar event' 
      },
      { status: 500 }
    );
  }
} 