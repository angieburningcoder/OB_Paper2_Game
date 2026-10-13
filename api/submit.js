import { sql, ensureSchema, send, GROUPS } from '../lib/db.js';

const int = (v) => (Number.isInteger(v) && v >= 0 && v <= 3 ? v : NaN);

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  const b = req.body || {};
  const g = Number(b.group), sc = Number(b.scenario), ban = b.ban === true;
  const why = typeof b.why === 'string' ? b.why.trim() : '';
  let m = ban ? 0 : int(b.m), it = ban ? 0 : int(b.it), e = ban ? 0 : int(b.e);
  if (!(g >= 1 && g <= GROUPS) || ![0, 1, 2].includes(sc)) return send(res, 400, { error: '組別或情境不對' });
  if (!ban && !(m + it + e === 3)) return send(res, 400, { error: '3 點要剛好用完' });
  if (!why || [...why].length > 30) return send(res, 400, { error: '理由要 1 到 30 個字' });
  try {
    await ensureSchema();
    const [st] = await sql`select step from game_state where id = 1`;
    if (st.step !== sc + 2) return send(res, 409, { error: '這一題已經結束了', closed: true });
    const rows = await sql`insert into submissions (group_no, scenario, m, it, e, ban, why)
      values (${g}, ${sc}, ${m}, ${it}, ${e}, ${ban}, ${why})
      on conflict (group_no, scenario) do nothing returning group_no`;
    if (!rows.length) return send(res, 409, { error: '你們組已經有人送出了', already: true });
    send(res, 200, { ok: true });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: '送出失敗，請再按一次' });
  }
}
