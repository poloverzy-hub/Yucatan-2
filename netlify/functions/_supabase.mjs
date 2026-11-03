import { required } from './_auth.mjs';

function endpoint(path) {
  return `${required('SUPABASE_URL').replace(/\/$/, '')}/rest/v1/${path}`;
}

function headers(extra = {}) {
  const key = required('SUPABASE_SECRET_KEY');
  return { apikey: key, authorization: `Bearer ${key}`, ...extra };
}

export async function saveAnswers(respondent, answers) {
  const response = await fetch(endpoint('trip_responses?on_conflict=respondent'), {
    method: 'POST',
    headers: headers({ 'content-type': 'application/json', prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify({ respondent, answers, updated_at: new Date().toISOString() })
  });
  if (!response.ok) throw new Error(`Supabase write failed (${response.status})`);
  return response.json();
}

export async function readAnswers() {
  const response = await fetch(endpoint('trip_responses?select=respondent,answers,updated_at&order=respondent'), { headers: headers() });
  if (!response.ok) throw new Error(`Supabase read failed (${response.status})`);
  return response.json();
}

export async function readAnswer(respondent) {
  const response = await fetch(endpoint(`trip_responses?respondent=eq.${encodeURIComponent(respondent)}&select=answers`), { headers: headers() });
  if (!response.ok) throw new Error(`Supabase read failed (${response.status})`);
  const rows = await response.json();
  return rows[0]?.answers ?? null;
}
