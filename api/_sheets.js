/**
 * Google Sheets integration for persistent form data storage.
 *
 * Required environment variables (set in Vercel dashboard):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  – service account client_email
 *   GOOGLE_PRIVATE_KEY            – service account private_key (with \n line breaks)
 *   GOOGLE_SHEET_ID               – the spreadsheet ID from the sheet URL
 *
 * The spreadsheet should have two sheets (tabs):
 *   "Preorders"  – columns: ID | Name | Email | Product | Quantity | Source | Date
 *   "Newsletter" – columns: ID | Email | Date
 *
 * Share the spreadsheet with the service account email (Editor access).
 */

import { google } from 'googleapis';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_ID = () => process.env.GOOGLE_SHEET_ID;

/**
 * Append a row to a named sheet tab.
 */
export async function appendRow(sheetName, values) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
}

/**
 * Read all rows from a named sheet tab (excluding header row).
 */
export async function readRows(sheetName) {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `${sheetName}!A:Z`,
  });
  const rows = res.data.values || [];
  // Skip header row
  return rows.slice(1);
}

/**
 * Find a value in a specific column of a sheet tab.
 * Returns the row if found, null otherwise.
 */
export async function findInColumn(sheetName, colIndex, value) {
  const rows = await readRows(sheetName);
  return rows.find(row => row[colIndex] === value) || null;
}
