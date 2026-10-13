import { neon } from '@neondatabase/serverless';

export const GROUPS = 5;
export const STEP_COUNT = 7; // 0 join, 1 rule, 2-4 scenarios, 5 reveal, 6 clue
export const sql = neon(process.env.DATABASE_URL);

let ready;
export function ensureSchema() {
  ready ??= (async () => {
    await sql`create table if not exists game_state (
      id int primary key, step int not null default 0, changed_at timestamptz not null default now())`;
    await sql`insert into game_state (id) values (1) on conflict do nothing`;
    await sql`create table if not exists players (
      id text primary key, group_no int not null, seen_at timestamptz not null default now())`;
    await sql`create table if not exists submissions (
      group_no int not null, scenario int not null,
      m int not null, it int not null, e int not null, ban boolean not null,
      why text not null, created_at timestamptz not null default now(),
      primary key (group_no, scenario))`;
  })().catch((err) => { ready = undefined; throw err; });
  return ready;
}

export function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
