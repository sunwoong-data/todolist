import 'dotenv/config';
import request from 'supertest';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../src/middlewares/auth.middleware';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.get('/protected', authMiddleware, (req: Request, res: Response) => {
    res.status(200).json({ userId: req.userId });
  });
  return app;
}

describe('authMiddleware', () => {
  const app = createTestApp();

  it('Authorization 헤더가 없으면 401을 반환한다', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('Bearer 토큰이 없으면 401을 반환한다', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('유효하지 않은 토큰이면 401을 반환한다', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('만료된 토큰이면 401을 반환한다', async () => {
    const expiredToken = jwt.sign(
      { userId: 'test-user-id' },
      process.env.JWT_SECRET!,
      { expiresIn: '0s' },
    );
    // 토큰이 즉시 만료되도록 잠깐 대기
    await new Promise((r) => setTimeout(r, 100));
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it('유효한 토큰이면 req.userId가 주입되고 200을 반환한다', async () => {
    const token = jwt.sign(
      { userId: 'test-user-id' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('test-user-id');
  });
});
