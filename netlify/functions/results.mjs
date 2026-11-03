import { json, sessionFrom } from './_auth.mjs';
import { readAnswers } from './_supabase.mjs';

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'GET') return json(405, { error: 'Méthode non autorisée.' });
  if (sessionFrom(request)?.role !== 'organizer') return json(401, { error: 'Session organisateur requise.' });
  try {
    return json(200, { responses: await readAnswers() });
  } catch (error) {
    console.error(error);
    return json(500, { error: 'Impossible de charger les résultats.' });
  }
};
