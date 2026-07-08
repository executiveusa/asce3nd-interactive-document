// api/workbook.js — no longer needed
// The workbook now uses URL hash encoding for sharing.
// State is embedded in the URL: #state=<base64-encoded-json>
// No database, no server storage needed.
// This file exists only for compatibility — always returns 200.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({ status: 'ok', message: 'DB-less mode. State is embedded in share URL.' });
}