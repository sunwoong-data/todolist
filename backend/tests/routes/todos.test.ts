import 'dotenv/config';
import request from 'supertest';
import { pool } from '../../src/db/pool';
import app from '../../src/app';

async function cleanupUser(email: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE email = $1', [email]);
}

// ── 헬퍼: 회원가입 + 로그인 후 token 반환 ──────────────────────
async function registerAndLogin(email: string, name = '테스터'): Promise<string> {
  await request(app).post('/api/auth/register').send({ email, password: 'pw123456', name });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'pw123456' });
  return res.body.token as string;
}

// ── CRUD 기본 동작 ──────────────────────────────────────────────
describe('POST /api/todos', () => {
  const email = `todo_create_${Date.now()}@test.com`;
  let token: string;

  beforeAll(async () => { token = await registerAndLogin(email); });
  afterAll(async () => { await cleanupUser(email); });

  it('제목만으로 할 일을 생성하면 201을 반환한다', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '새 할 일' });
    expect(res.status).toBe(201);
    expect(res.body.todo.title).toBe('새 할 일');
  });

  it('카테고리 미지정 시 기본 카테고리가 자동 배정된다 (BR-03)', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '기본카테고리테스트' });
    expect(res.status).toBe(201);
    expect(res.body.todo.categoryId).toBeDefined();
  });

  it('종료일이 시작일보다 이전이면 400을 반환한다 (BR-06)', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '날짜오류', startDate: '2026-06-10', endDate: '2026-06-01' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DATE');
  });

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).post('/api/todos').send({ title: '테스트' });
    expect(res.status).toBe(401);
  });
});

// ── 목록 조회 ───────────────────────────────────────────────────
describe('GET /api/todos', () => {
  const email = `todo_list_${Date.now()}@test.com`;
  let token: string;

  beforeAll(async () => {
    token = await registerAndLogin(email);
    // 다양한 날짜 상태의 할 일 생성
    await request(app).post('/api/todos').set('Authorization', `Bearer ${token}`)
      .send({ title: '진행중', startDate: '2026-01-01', endDate: '2099-12-31' });
    await request(app).post('/api/todos').set('Authorization', `Bearer ${token}`)
      .send({ title: '기한초과', startDate: '2020-01-01', endDate: '2020-12-31' });
    await request(app).post('/api/todos').set('Authorization', `Bearer ${token}`)
      .send({ title: '시작전', startDate: '2099-01-01' });
  });
  afterAll(async () => { await cleanupUser(email); });

  it('할 일 목록을 조회하면 200을 반환한다', async () => {
    const res = await request(app).get('/api/todos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.todos)).toBe(true);
  });

  it('status=in_progress 필터가 동작한다 (BR-10)', async () => {
    const res = await request(app).get('/api/todos?status=in_progress').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const titles = res.body.todos.map((t: { title: string }) => t.title);
    expect(titles).toContain('진행중');
    expect(titles).not.toContain('기한초과');
    expect(titles).not.toContain('시작전');
  });

  it('status=overdue 필터가 동작한다 (BR-12)', async () => {
    const res = await request(app).get('/api/todos?status=overdue').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const titles = res.body.todos.map((t: { title: string }) => t.title);
    expect(titles).toContain('기한초과');
  });

  it('status=pending 필터가 동작한다 (BR-09)', async () => {
    const res = await request(app).get('/api/todos?status=pending').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const titles = res.body.todos.map((t: { title: string }) => t.title);
    expect(titles).toContain('시작전');
  });
});

// ── 데이터 격리 (BR-02) ─────────────────────────────────────────
describe('GET /api/todos - 데이터 격리 (BR-02)', () => {
  const emailA = `todo_iso_a_${Date.now()}@test.com`;
  const emailB = `todo_iso_b_${Date.now()}@test.com`;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    tokenA = await registerAndLogin(emailA, '사용자A');
    tokenB = await registerAndLogin(emailB, '사용자B');
    await request(app).post('/api/todos').set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'A전용할일' });
  });
  afterAll(async () => {
    await cleanupUser(emailA);
    await cleanupUser(emailB);
  });

  it('사용자B가 조회해도 사용자A의 할 일이 포함되지 않는다', async () => {
    const res = await request(app).get('/api/todos').set('Authorization', `Bearer ${tokenB}`);
    const titles = res.body.todos.map((t: { title: string }) => t.title);
    expect(titles).not.toContain('A전용할일');
  });
});

// ── 단건 조회 ───────────────────────────────────────────────────
describe('GET /api/todos/:id', () => {
  const email = `todo_get_${Date.now()}@test.com`;
  let token: string;
  let todoId: string;

  beforeAll(async () => {
    token = await registerAndLogin(email);
    const res = await request(app).post('/api/todos').set('Authorization', `Bearer ${token}`)
      .send({ title: '단건조회테스트' });
    todoId = res.body.todo.id;
  });
  afterAll(async () => { await cleanupUser(email); });

  it('존재하는 할 일을 조회하면 200을 반환한다', async () => {
    const res = await request(app).get(`/api/todos/${todoId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.todo.id).toBe(todoId);
  });

  it('존재하지 않는 ID로 조회하면 404를 반환한다', async () => {
    const res = await request(app)
      .get('/api/todos/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

// ── 수정 ────────────────────────────────────────────────────────
describe('PATCH /api/todos/:id', () => {
  const emailOwner = `todo_upd_own_${Date.now()}@test.com`;
  const emailOther = `todo_upd_oth_${Date.now()}@test.com`;
  let ownerToken: string;
  let otherToken: string;
  let todoId: string;

  beforeAll(async () => {
    ownerToken = await registerAndLogin(emailOwner, '소유자');
    otherToken = await registerAndLogin(emailOther, '타인');
    const res = await request(app).post('/api/todos').set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: '원래제목' });
    todoId = res.body.todo.id;
  });
  afterAll(async () => {
    await cleanupUser(emailOwner);
    await cleanupUser(emailOther);
  });

  it('소유자가 수정하면 200을 반환한다', async () => {
    const res = await request(app).patch(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: '수정된제목' });
    expect(res.status).toBe(200);
    expect(res.body.todo.title).toBe('수정된제목');
  });

  it('타인이 수정하면 403을 반환한다 (BR-05)', async () => {
    const res = await request(app).patch(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: '탈취시도' });
    expect(res.status).toBe(403);
  });

  it('종료일 < 시작일 수정 시 400을 반환한다 (BR-06)', async () => {
    const res = await request(app).patch(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ startDate: '2026-06-10', endDate: '2026-06-01' });
    expect(res.status).toBe(400);
  });
});

// ── 삭제 ────────────────────────────────────────────────────────
describe('DELETE /api/todos/:id', () => {
  const emailOwner = `todo_del_own_${Date.now()}@test.com`;
  const emailOther = `todo_del_oth_${Date.now()}@test.com`;
  let ownerToken: string;
  let otherToken: string;

  beforeAll(async () => {
    ownerToken = await registerAndLogin(emailOwner, '소유자');
    otherToken = await registerAndLogin(emailOther, '타인');
  });
  afterAll(async () => {
    await cleanupUser(emailOwner);
    await cleanupUser(emailOther);
  });

  it('타인이 삭제하면 403을 반환한다 (BR-05)', async () => {
    const create = await request(app).post('/api/todos').set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: '삭제대상' });
    const todoId = create.body.todo.id;
    const res = await request(app).delete(`/api/todos/${todoId}`).set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('소유자가 삭제하면 200을 반환한다', async () => {
    const create = await request(app).post('/api/todos').set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: '삭제할 항목' });
    const todoId = create.body.todo.id;
    const res = await request(app).delete(`/api/todos/${todoId}`).set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
  });

  it('존재하지 않는 항목 삭제 시 404를 반환한다', async () => {
    const res = await request(app)
      .delete('/api/todos/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(404);
  });
});

// ── 완료 처리 ───────────────────────────────────────────────────
describe('PATCH /api/todos/:id/complete', () => {
  const emailOwner = `todo_cmp_own_${Date.now()}@test.com`;
  const emailOther = `todo_cmp_oth_${Date.now()}@test.com`;
  let ownerToken: string;
  let otherToken: string;
  let todoId: string;

  beforeAll(async () => {
    ownerToken = await registerAndLogin(emailOwner, '소유자');
    otherToken = await registerAndLogin(emailOther, '타인');
    const res = await request(app).post('/api/todos').set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: '완료할 항목' });
    todoId = res.body.todo.id;
  });
  afterAll(async () => {
    await cleanupUser(emailOwner);
    await cleanupUser(emailOther);
  });

  it('소유자가 완료 처리하면 200과 isCompleted=true를 반환한다', async () => {
    const res = await request(app).patch(`/api/todos/${todoId}/complete`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.todo.isCompleted).toBe(true);
  });

  it('타인이 완료 처리하면 403을 반환한다 (BR-05)', async () => {
    const res = await request(app).patch(`/api/todos/${todoId}/complete`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });
});

// ── BR-08: category_id 필터 ─────────────────────────────────────
describe('GET /api/todos - category_id 필터 (BR-08)', () => {
  const email = `todo_cat_filter_${Date.now()}@test.com`;
  let token: string;
  let categoryId: string;

  beforeAll(async () => {
    token = await registerAndLogin(email, '카테고리필터테스터');
    // 추가 카테고리 생성
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '업무카테고리' });
    categoryId = catRes.body.category.id;
    // 업무 카테고리로 할 일 생성
    await request(app).post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '업무할일', categoryId });
    // 기본 카테고리로 할 일 생성 (카테고리 미지정)
    await request(app).post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '기본할일' });
  });
  afterAll(async () => { await cleanupUser(email); });

  it('category_id 필터로 해당 카테고리의 할 일만 반환된다 (BR-08)', async () => {
    const res = await request(app)
      .get(`/api/todos?category_id=${categoryId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const titles = res.body.todos.map((t: { title: string }) => t.title);
    expect(titles).toContain('업무할일');
    expect(titles).not.toContain('기본할일');
  });
});

// ── BR-11: completed 필터 ───────────────────────────────────────
describe('GET /api/todos - completed 필터 (BR-11)', () => {
  const email = `todo_completed_${Date.now()}@test.com`;
  let token: string;

  beforeAll(async () => {
    token = await registerAndLogin(email, '완료필터테스터');
    // 완료 처리할 항목
    const res = await request(app).post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '완료된항목' });
    const todoId = res.body.todo.id as string;
    await request(app).patch(`/api/todos/${todoId}/complete`)
      .set('Authorization', `Bearer ${token}`);
    // 미완료 항목
    await request(app).post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '미완료항목' });
  });
  afterAll(async () => { await cleanupUser(email); });

  it('status=completed 필터로 완료된 항목만 반환된다 (BR-11)', async () => {
    const res = await request(app)
      .get('/api/todos?status=completed')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const titles = res.body.todos.map((t: { title: string }) => t.title);
    expect(titles).toContain('완료된항목');
    expect(titles).not.toContain('미완료항목');
  });

  it('완료된 항목은 isCompleted가 true이다', async () => {
    const res = await request(app)
      .get('/api/todos?status=completed')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.todos.every((t: { isCompleted: boolean }) => t.isCompleted === true)).toBe(true);
  });
});

// ── 응답 시간 검증 (500ms 이내) ─────────────────────────────────
describe('API 응답 시간 (500ms 이내)', () => {
  const email = `todo_perf_${Date.now()}@test.com`;
  let token: string;

  beforeAll(async () => { token = await registerAndLogin(email, '성능테스터'); });
  afterAll(async () => { await cleanupUser(email); });

  it('GET /api/todos 응답이 500ms 이내이다', async () => {
    const start = Date.now();
    const res = await request(app).get('/api/todos').set('Authorization', `Bearer ${token}`);
    const elapsed = Date.now() - start;
    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(500);
  });

  it('POST /api/todos 응답이 500ms 이내이다', async () => {
    const start = Date.now();
    const res = await request(app).post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '성능테스트항목' });
    const elapsed = Date.now() - start;
    expect(res.status).toBe(201);
    expect(elapsed).toBeLessThan(500);
  });
});
