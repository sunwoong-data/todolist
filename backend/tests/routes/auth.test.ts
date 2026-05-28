import 'dotenv/config';
import request from 'supertest';
import { pool } from '../../src/db/pool';
import app from '../../src/app';

// 테스트 후 생성된 사용자 데이터 정리
async function cleanupUser(email: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE email = $1', [email]);
}

describe('POST /api/auth/register', () => {
  const testEmail = `test_register_${Date.now()}@example.com`;

  afterAll(async () => {
    await cleanupUser(testEmail);
  });

  it('유효한 입력으로 회원가입 시 201을 반환한다', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'password123',
      name: '테스트유저',
    });
    expect(res.status).toBe(201);
  });

  it('응답에 user 객체가 포함된다', async () => {
    // 위 테스트에서 이미 생성됐으므로 다른 이메일 사용
    const email2 = `test_register2_${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
      email: email2,
      password: 'password123',
      name: '테스트유저2',
    });
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(email2);
    expect(res.body.user.password).toBeUndefined(); // 비밀번호 미포함
    await cleanupUser(email2);
  });

  it('회원가입 후 "기본" 카테고리가 DB에 생성된다', async () => {
    const email3 = `test_register3_${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
      email: email3,
      password: 'password123',
      name: '카테고리테스트',
    });
    const userId = res.body.user.id;
    const catResult = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 AND is_default = true',
      [userId],
    );
    expect(catResult.rows.length).toBe(1);
    expect(catResult.rows[0].name).toBe('기본');
    await cleanupUser(email3);
  });

  it('중복 이메일로 회원가입 시 409를 반환한다', async () => {
    // testEmail은 첫 번째 테스트에서 이미 생성됨
    const res = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'other123',
      name: '다른유저',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_CONFLICT');
  });
});

describe('POST /api/auth/login', () => {
  const loginEmail = `test_login_${Date.now()}@example.com`;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      email: loginEmail,
      password: 'password123',
      name: '로그인테스터',
    });
  });

  afterAll(async () => {
    await cleanupUser(loginEmail);
  });

  it('올바른 자격증명으로 로그인 시 200을 반환한다', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: loginEmail,
      password: 'password123',
    });
    expect(res.status).toBe(200);
  });

  it('로그인 성공 시 token이 반환된다', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: loginEmail,
      password: 'password123',
    });
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
  });

  it('로그인 응답에 비밀번호가 포함되지 않는다', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: loginEmail,
      password: 'password123',
    });
    expect(res.body.user.password).toBeUndefined();
  });

  it('잘못된 비밀번호로 로그인 시 401을 반환한다', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: loginEmail,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('존재하지 않는 이메일로 로그인 시 401을 반환한다', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});
