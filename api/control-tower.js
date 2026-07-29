// api/control-tower.js — Phase 1 read-only ASC3ND Event Control Tower.
// Uses the existing redacted RSVP adapter. No PII and no write capability.

const { loadConfirmed, loadSummary, DEFAULT_EVENT_ID } = require('./_lib/rsvp-summary-adapter');

function countBy(rows, key, fallback = 'unknown') {
  return rows.reduce((acc, row) => {
    const value = row[key] || fallback;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const eventId = typeof req.query?.event_id === 'string' ? req.query.event_id : DEFAULT_EVENT_ID;
    const [summary, registrations] = await Promise.all([
      loadSummary(eventId),
      loadConfirmed(eventId),
    ]);

    const estimatedAttendees = registrations.reduce(
      (total, row) => total + 1 + Number(row.children_count || 0),
      0,
    );

    return res.status(200).json({
      ok: true,
      event: {
        id: eventId,
        name: 'Community Cuts for Kids',
        date: '2026-08-30',
        time: '12:00 PM–3:00 PM',
        venue: 'Tangles & Locs',
      },
      summary: {
        ...summary,
        estimated_attendees: estimatedAttendees,
      },
      breakdowns: {
        language: countBy(registrations, 'preferred_language', 'unknown'),
        service: countBy(registrations, 'requested_service', 'unknown'),
        arrival_window: countBy(registrations, 'arrival_window', 'unknown'),
        status: countBy(registrations, 'status', 'unknown'),
      },
      follow_up: {
        accessibility_requests: registrations.filter(row => row.accessibility_contact).length,
      },
      registrations,
      system: {
        mode: 'read_only',
        pii_exposed: false,
        source: 'supabase_rsvp_adapter',
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[control-tower] overview_failed', error?.message || error);
    return res.status(503).json({
      ok: false,
      error: 'control_tower_unavailable',
      message: 'Event data is temporarily unavailable.',
    });
  }
};
