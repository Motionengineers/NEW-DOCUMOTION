import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Optional BigQuery forwarder (only loaded if configured)
let insertEventsToBigQuery = null;
try {
  const bqModule = require('@/lib/warehouse/bqForwarder');
  insertEventsToBigQuery = bqModule.insertEventsToBigQuery;
} catch (e) {
  // BigQuery not configured, will use JSONL backup only
  console.log('BigQuery forwarder not available, using JSONL backup only');
}

async function appendToJsonlBackup(events) {
  const filePath = path.join(process.cwd(), 'prisma', 'seeds', 'telemetry_events.jsonl');
  const lines = events.map(e => JSON.stringify(e)).join('\n') + '\n';

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await fs.promises.appendFile(filePath, lines);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const events = body.events || [];

    if (events.length === 0) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    // Always write to JSONL backup
    await appendToJsonlBackup(events).catch(err => {
      console.error('JSONL backup write failed:', err);
    });

    // Forward to BigQuery if configured (best-effort)
    let bqResult = null;
    if (insertEventsToBigQuery && process.env.GCP_PROJECT) {
      try {
        bqResult = await insertEventsToBigQuery(events);
      } catch (bqErr) {
        console.error('BigQuery forward failed:', bqErr);
        // Continue - we have JSONL backup
        bqResult = { error: String(bqErr) };
      }
    }

    // Return success even if BigQuery failed (we have backup)
    return NextResponse.json({
      ok: true,
      count: events.length,
      bq: bqResult,
      backup: 'jsonl',
    });
  } catch (e) {
    console.error('telemetry ingest error', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
