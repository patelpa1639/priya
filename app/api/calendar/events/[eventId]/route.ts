import { NextRequest, NextResponse } from 'next/server';
import { deleteCalendarEvent } from '@/lib/google-calendar';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // For demo purposes, using a fixed user ID
    // In production, you should get the user ID from your authentication system
    const userId = 'demo-user';
    
    await deleteCalendarEvent(userId, eventId);
    
    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
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