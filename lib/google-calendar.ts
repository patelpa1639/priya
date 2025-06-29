import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';

// Google OAuth2 configuration
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Google Calendar API instance
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Storage for refresh tokens (in production, use a proper database)
const REFRESH_TOKEN_FILE = process.env.REFRESH_TOKEN_STORAGE_PATH || './refresh_tokens.json';

interface StoredToken {
  userId: string;
  refreshToken: string;
  accessToken?: string;
  expiryDate?: number;
}

// Helper function to read stored tokens
async function readStoredTokens(): Promise<StoredToken[]> {
  try {
    const data = await fs.readFile(REFRESH_TOKEN_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write stored tokens
async function writeStoredTokens(tokens: StoredToken[]): Promise<void> {
  await fs.writeFile(REFRESH_TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

// Store refresh token for a user
export async function storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  const tokens = await readStoredTokens();
  const existingIndex = tokens.findIndex(token => token.userId === userId);
  
  if (existingIndex >= 0) {
    tokens[existingIndex].refreshToken = refreshToken;
  } else {
    tokens.push({ userId, refreshToken });
  }
  
  await writeStoredTokens(tokens);
}

// Get stored refresh token for a user
export async function getRefreshToken(userId: string): Promise<string | null> {
  const tokens = await readStoredTokens();
  const token = tokens.find(t => t.userId === userId);
  return token?.refreshToken || null;
}

// Set credentials for a user using their refresh token
export async function setUserCredentials(userId: string): Promise<boolean> {
  const refreshToken = await getRefreshToken(userId);
  if (!refreshToken) {
    return false;
  }
  
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });
  
  return true;
}

// Generate OAuth2 authorization URL
export function getAuthUrl(): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent to get refresh token
  });
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}> {
  const { tokens } = await oauth2Client.getToken(code);
  
  if (!tokens.refresh_token) {
    throw new Error('No refresh token received');
  }
  
  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date!,
  };
}

// Create a calendar event
export async function createCalendarEvent(
  userId: string,
  eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: { email: string }[];
  }
): Promise<any> {
  // Set user credentials
  const hasCredentials = await setUserCredentials(userId);
  if (!hasCredentials) {
    throw new Error('User not authenticated. Please authenticate first.');
  }
  
  try {
    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: eventData.start,
      end: eventData.end,
      attendees: eventData.attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

// List calendar events
export async function listCalendarEvents(
  userId: string,
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 10
): Promise<any> {
  // Set user credentials
  const hasCredentials = await setUserCredentials(userId);
  if (!hasCredentials) {
    throw new Error('User not authenticated. Please authenticate first.');
  }
  
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error listing calendar events:', error);
    throw error;
  }
}

// Delete a calendar event
export async function deleteCalendarEvent(
  userId: string,
  eventId: string
): Promise<void> {
  // Set user credentials
  const hasCredentials = await setUserCredentials(userId);
  if (!hasCredentials) {
    throw new Error('User not authenticated. Please authenticate first.');
  }
  
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
} 