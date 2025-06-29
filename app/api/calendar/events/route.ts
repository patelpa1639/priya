import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent, listCalendarEvents } from '@/lib/google-calendar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summary, description, start, end, attendees } = body;
    
    // Validate required fields
    if (!summary || !start || !end) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: summary, start, end' },
        { status: 400 }
      );
    }
    
    // For demo purposes, using a fixed user ID
    // In production, you should get the user ID from your authentication system
    const userId = 'demo-user';
    
    const event = await createCalendarEvent(userId, {
      summary,
      description,
      start,
      end,
      attendees,
    });
    
    return NextResponse.json({
      success: true,
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    
    // For demo purposes, using a fixed user ID
    // In production, you should get the user ID from your authentication system
    const userId = 'demo-user';
    
    const events = await listCalendarEvents(userId, timeMin || undefined, timeMax || undefined, maxResults);
    
    return NextResponse.json({
      success: true,
      events: events.items || [],
    });
  } catch (error: any) {
    console.error('Error listing calendar events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to list calendar events' 
      },
      { status: 500 }
    );
  }
} 