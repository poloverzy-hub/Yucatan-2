import crypto from 'node:crypto';
import { createSession, json, parseBody, required } from './_auth.mjs';

const roles = [
  ['marie-jo', 'MARIE_JO_CODE'],
  ['tabeth', 'TABETH_CODE'],
  ['organizer', 'ORGANIZER_CODE']
];

function same(a, b) {
  const x = Buffer.from(a || '');
  const y = Buffer.from(b || '');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'POST') return json(405, { error: 'Méthode non autorisée.' });
  const body = await parseBody(request);
  if (!body || typeof body.code !== 'string') return json(400, { error: 'Code manquant.' });
  const entry = roles.find(([, variable]) => same(body.code.trim(), required(variable)));
  if (!entry) return json(401, { error: 'Code incorrect.' });
  return json(200, { token: createSession({ role: entry[0] }) });
};
