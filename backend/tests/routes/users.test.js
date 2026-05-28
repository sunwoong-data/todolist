require('dotenv/config');
const request = require('supertest');
const { pool } = require('../../src/db/pool');
const app = require('../../src/app');

async function cleanupUser(email) {
  await pool.query('DELETE FROM users WHERE email = $1', [email]);
}

describe('GET /api/users/me', () => {
  const email = `test_profile_${Date.now()}@example.com`;
  let token;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      email,
      password: 'password123',
      name: '프로필테스터',
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await cleanupUser(email);
  });

  it('유효한 토큰으로 내 정보를 조회하면 200을 반환한다', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('응답에 user 객체가 포함된다', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(email);
  });

  it('응답에 비밀번호가 포함되지 않는다', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.body.user.password).toBeUndefined();
  });

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/users/me', () => {
  const email = `test_patch_${Date.now()}@example.com`;
  let token;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      email,
      password: 'password123',
      name: '수정테스터',
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await cleanupUser(email);
  });

  it('이름을 수정하면 200을 반환한다', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '새이름' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('새이름');
  });

  it('잘못된 테마 값이면 400을 반환한다', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ themePreference: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_THEME');
  });

  it('잘못된 언어 값이면 400을 반환한다', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ languagePreference: 'fr' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_LANGUAGE');
  });

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).patch('/api/users/me').send({ name: '테스트' });
    expect(res.status).toBe(401);
  });
});
