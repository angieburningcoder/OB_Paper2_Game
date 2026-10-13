import { sql, ensureSchema, send, GROUPS } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const { id, group } = req.body || {};
  const g = Number(group);
  if (typeof id !== 'string' || !id || id.length > 64 || !(g >= 1 && g <= GROUPS)) {
    return send(res, 400, { error: '組別或身分格式不對' });
  }
  try {
    await ensureSchema();
    await sql`insert into players (id, group_no) values (${id}, ${g})
      on conflict (id) do update set group_no = excluded.group_no, seen_at = now()`;
    send(res, 200, { ok: true });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: '加入失敗，請再試一次' });
  }
}
