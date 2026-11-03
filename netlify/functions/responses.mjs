import { json, parseBody, sessionFrom } from './_auth.mjs';
import { readAnswer, saveAnswers } from './_supabase.mjs';

const VALID_ANSWERS = new Set(['none', 'little', 'much', 'passion']);
const VALID_KEYS = new Set(['farniente', 'marine', 'nature', 'archaeology', 'colonial']);

function validAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === VALID_KEYS.size && keys.every((key) => VALID_KEYS.has(key) && VALID_ANSWERS.has(value[key]));
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  const session = sessionFrom(request);
  if (!session || !['marie-jo', 'tabeth'].includes(session.role)) return json(401, { error: 'Session expirée. Reconnectez-vous.' });
  if (request.method === 'GET') {
    try { return json(200, { answers: await readAnswer(session.role) }); }
    catch (error) { console.error(error); return json(500, { error: 'Impossible de charger vos réponses.' }); }
  }
  if (request.method !== 'POST') return json(405, { error: 'Méthode non autorisée.' });
  const body = await parseBody(request);
  if (!validAnswers(body?.answers)) return json(400, { error: 'Réponses incomplètes ou invalides.' });
  try {
    await saveAnswers(session.role, body.answers);
    return json(200, { ok: true });
  } catch (error) {
    console.error(error);
    return json(500, { error: 'Impossible d’enregistrer pour le moment.' });
  }
};
