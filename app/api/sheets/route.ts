import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { data, sheetName = 'Sheet1', range = 'A1' } = await request.json();

    // Setup OAuth2 client with refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/auth/google/callback'
    );

    // Set credentials using refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Push data to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!${range}`, // Use custom sheet name and range
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: data,
      },
    });

    return NextResponse.json({
      success: true,
      updatedCells: response.data.updates?.updatedCells,
      updatedRange: response.data.updates?.updatedRange,
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });
  } catch (error: any) {
    console.error('Google Sheets Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}