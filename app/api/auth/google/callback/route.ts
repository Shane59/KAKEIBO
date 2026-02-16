import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // SAVE THIS REFRESH TOKEN TO YOUR .env FILE!
    return NextResponse.json({
      message: 'Add this to your .env file as GOOGLE_REFRESH_TOKEN',
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
    });
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.json({ error: 'Failed to get tokens' }, { status: 500 });
  }
}