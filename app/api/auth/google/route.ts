import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback' // your redirect URI
);

export async function GET() {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force to get refresh token
  });

  return NextResponse.redirect(url);
}