import 'dotenv/config';
import request from 'supertest';
import { pool } from '../../src/db/pool';
import app from '../../src/app';

async function cleanupUser(email: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE email = $1', [email]);
}

describe('GET /api/categories', () => {
  const email = `test_cat_get_${Date.now()}@example.com`;
  let token: string;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      email, password: 'password123', name: '카테고리조회테스터',
    });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    token = loginRes.body.token;
  });

  afterAll(async () => { await cleanupUser(email); });

  it('인증된 사용자가 카테고리 목록을 조회하면 200을 반환한다', async () => {
    const res = await request(app).get('/api/categories').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('회원가입 시 생성된 기본 카테고리가 포함된다', async () => {
    const res = await request(app).get('/api/categories').set('Authorization', `Bearer ${token}`);
    expect(res.body.categories).toBeDefined();
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(res.body.categories.some((c: { name: string }) => c.name === '기본')).toBe(true);
  });

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/categories - 데이터 격리 (BR-02)', () => {
  const emailA = `test_cat_a_${Date.now()}@example.com`;
  const emailB = `test_cat_b_${Date.now()}@example.com`;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ email: emailA, password: 'pw123', name: '사용자A' });
    await request(app).post('/api/auth/register').send({ email: emailB, password: 'pw123', name: '사용자B' });
    const resA = await request(app).post('/api/auth/login').send({ email: emailA, password: 'pw123' });
    const resB = await request(app).post('/api/auth/login').send({ email: emailB, password: 'pw123' });
    tokenA = resA.body.token;
    tokenB = resB.body.token;
    // 사용자A에게만 추가 카테고리 생성
    await request(app).post('/api/categories').set('Authorization', `Bearer ${tokenA}`).send({ name: 'A전용카테고리' });
  });

  afterAll(async () => {
    await cleanupUser(emailA);
    await cleanupUser(emailB);
  });

  it('사용자B가 조회해도 사용자A의 카테고리가 포함되지 않는다', async () => {
    const res = await request(app).get('/api/categories').set('Authorization', `Bearer ${tokenB}`);
    const names = res.body.categories.map((c: { name: string }) => c.name);
    expect(names).not.toContain('A전용카테고리');
  });
});

describe('POST /api/categories', () => {
  const email = `test_cat_post_${Date.now()}@example.com`;
  let token: string;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ email, password: 'password123', name: '카테고리생성테스터' });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    token = loginRes.body.token;
  });

  afterAll(async () => { await cleanupUser(email); });

  it('카테고리를 생성하면 201을 반환한다', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '업무' });
    expect(res.status).toBe(201);
    expect(res.body.category.name).toBe('업무');
  });

  it('같은 이름으로 중복 생성하면 409를 반환한다', async () => {
    await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: '중복카테고리' });
    const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: '중복카테고리' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CATEGORY_CONFLICT');
  });

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).post('/api/categories').send({ name: '테스트' });
    expect(res.status).toBe(401);
  });
});
