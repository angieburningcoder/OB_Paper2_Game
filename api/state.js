import { sql, ensureSchema, send } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await ensureSchema();
    const [st] = await sql`select step, revealed, changed_at from game_state where id = 1`;
    const players = await sql`select group_no, count(*)::int as n from players group by group_no`;
    const rows = await sql`select group_no, scenario, m, it, e, ban, why from submissions order by group_no, scenario`;
    const myGroup = Number(req.query.group) || null;
    // A scenario's choices go public once the host reveals it (earlier scenarios stay public);
    // until then only "who has submitted" is shown.
    const open = (sc) => sc + 2 < st.step || (sc + 2 === st.step && st.revealed);
    const subs = rows.map((r) =>
      open(r.scenario) || r.group_no === myGroup ? r : { group_no: r.group_no, scenario: r.scenario }
    );
    send(res, 200, { step: st.step, revealed: st.revealed, changedAt: st.changed_at, now: new Date().toISOString(), players, subs });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: '伺服器暫時連不上資料庫，請稍後再試' });
  }
}
