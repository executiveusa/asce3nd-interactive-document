const SUPABASE_RPC = 'https://api.thepaulieffect.com/supabase/rest/v1/rpc/';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyNzc2NjczLCJleHAiOjE5MzA0NTY2NzN9.rl1mc-GgpG6nQArbEfFAKOcMvzL7rrgzPFT-LlCiCy4';
const PROJECT_ID = 'd0000000-0000-0000-0000-000000000001';
const DEVICE_ID = 'asc3nd-production-healthcheck';

function headers() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${SUPABASE_ANON}`,
    'Content-Profile': 'work',
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const timestamp = new Date().toISOString();
    const saveResponse = await fetch(`${SUPABASE_RPC}save_submission`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        p_project_id: PROJECT_ID,
        p_device_id: DEVICE_ID,
        p_payload: {
          healthcheck: true,
          source: 'vercel-production',
          saved_at: timestamp,
        },
      }),
    });

    if (!saveResponse.ok) {
      const detail = await saveResponse.text();
      return res.status(502).json({
        ok: false,
        stage: 'save_submission',
        status: saveResponse.status,
        detail: detail.slice(0, 500),
      });
    }

    const loadResponse = await fetch(`${SUPABASE_RPC}load_submission`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ p_device_id: DEVICE_ID }),
    });

    if (!loadResponse.ok) {
      const detail = await loadResponse.text();
      return res.status(502).json({
        ok: false,
        stage: 'load_submission',
        status: loadResponse.status,
        detail: detail.slice(0, 500),
      });
    }

    const data = await loadResponse.json();
    const row = Array.isArray(data) ? data[0] : data;
    const payload = row && row.payload;
    const verified = Boolean(payload && payload.healthcheck === true);

    return res.status(verified ? 200 : 502).json({
      ok: verified,
      save: 'connected',
      load: verified ? 'connected' : 'unexpected-response',
      project_id: PROJECT_ID,
      checked_at: timestamp,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      stage: 'network',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
