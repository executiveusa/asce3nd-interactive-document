// api/workbook.js — Vercel Serverless Function
// Supabase REST API (no extra npm dependencies)
// GET  /api/workbook?slug=xyz  → load state
// POST /api/workbook            → save/upsert state { slug, state, name, lang }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  function generateSlug() {
    const words = ['ascend','rise','build','trust','community','youth','grow','lift'];
    const w = words[Math.floor(Math.random() * words.length)];
    const n = Math.floor(1000 + Math.random() * 8999);
    return `${w}-${n}`;
  }

  // ── GET: load by slug ──
  if (req.method === 'GET') {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: 'slug required' });

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/workbooks?slug=eq.${encodeURIComponent(slug)}&select=*`,
        { headers }
      );
      const rows = await response.json();
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(rows[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Database error' });
    }
  }

  // ── POST: create or update ──
  if (req.method === 'POST') {
    const { slug: reqSlug, state, name, lang, created_by, client_id } = req.body || {};
    if (!state) return res.status(400).json({ error: 'state required' });

    const slug = reqSlug || generateSlug();
    const workbookName = name || 'ASC3ND Workbook';
    const workbookLang = lang || 'en';
    const creator = created_by || 'Macs Digital Media';

    try {
      // Check if slug exists
      const check = await fetch(
        `${supabaseUrl}/rest/v1/workbooks?slug=eq.${encodeURIComponent(slug)}&select=id`,
        { headers }
      );
      const existing = await check.json();

      if (existing && existing.length > 0) {
        // Update
        const response = await fetch(
          `${supabaseUrl}/rest/v1/workbooks?slug=eq.${encodeURIComponent(slug)}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              state: JSON.stringify(state),
              name: workbookName,
              lang: workbookLang,
              updated_at: new Date().toISOString(),
            }),
          }
        );
        if (!response.ok) throw new Error('Update failed');
        return res.status(200).json({ slug, message: 'Updated' });
      } else {
        // Insert
        const response = await fetch(`${supabaseUrl}/rest/v1/workbooks`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            slug,
            name: workbookName,
            state: JSON.stringify(state),
            lang: workbookLang,
            created_by: creator,
            client_id: client_id || null,
          }),
        });
        if (!response.ok) throw new Error('Insert failed');
        const data = await response.json();
        return res.status(200).json({ ...(data[0] || data), message: 'Saved' });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Save failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}