import { sql, ensureSchema, send, STEP_COUNT } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const { key, action, step } = req.body || {};
  if (!process.env.HOST_KEY || key !== process.env.HOST_KEY) return send(res, 403, { error: '主持人密碼不對' });
  try {
    await ensureSchema();
    if (action === 'go') {
      const s = Number(step);
      if (!(Number.isInteger(s) && s >= 0 && s < STEP_COUNT)) return send(res, 400, { error: '步驟不對' });
      await sql`update game_state set step = ${s}, changed_at = now() where id = 1`;
    } else if (action === 'reset') {
      await sql`delete from submissions`;
      await sql`delete from players`;
      await sql`update game_state set step = 0, changed_at = now() where id = 1`;
    } else {
      return send(res, 400, { error: '未知的動作' });
    }
    send(res, 200, { ok: true });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: '操作失敗，請再試一次' });
  }
}
