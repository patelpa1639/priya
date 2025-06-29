import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, storeRefreshToken } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=No authorization code received', request.url)
    );
  }
  
  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // For demo purposes, using a fixed user ID
    // In production, you should get the user ID from your authentication system
    const userId = 'demo-user';
    
    // Store the refresh token
    await storeRefreshToken(userId, tokens.refreshToken);
    
    // Redirect to success page
    return NextResponse.redirect(
      new URL('/?success=true', request.url)
    );
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.redirect(
      new URL('/?error=Failed to authenticate', request.url)
    );
  }
} 