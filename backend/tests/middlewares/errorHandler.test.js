require('dotenv/config');
const request = require('supertest');
const express = require('express');
const { AppError, errorHandler } = require('../../src/middlewares/errorHandler');

function createTestApp(routeHandler) {
  const app = express();
  app.use(express.json());
  app.get('/test', routeHandler);
  app.use(errorHandler);
  return app;
}

describe('AppError', () => {
  it('statusCode, code, message가 올바르게 설정된다', () => {
    const err = new AppError(400, 'VALIDATION_ERROR', '잘못된 입력입니다.');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('잘못된 입력입니다.');
  });

  it('name이 AppError이다', () => {
    const err = new AppError(404, 'NOT_FOUND', '없음');
    expect(err.name).toBe('AppError');
  });

  it('Error를 상속한다', () => {
    const err = new AppError(400, 'BAD_REQUEST', '오류');
    expect(err instanceof Error).toBe(true);
  });
});

describe('errorHandler 미들웨어', () => {
  it('AppError를 { error: { code, message } } 형식으로 반환한다', async () => {
    const app = createTestApp((_req, _res, next) => {
      next(new AppError(400, 'VALIDATION_ERROR', '잘못된 입력입니다.'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: 'VALIDATION_ERROR', message: '잘못된 입력입니다.' },
    });
  });

  it('404 AppError를 올바르게 처리한다', async () => {
    const app = createTestApp((_req, _res, next) => {
      next(new AppError(404, 'NOT_FOUND', '리소스를 찾을 수 없습니다.'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('403 AppError를 올바르게 처리한다', async () => {
    const app = createTestApp((_req, _res, next) => {
      next(new AppError(403, 'FORBIDDEN', '권한이 없습니다.'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('AppError가 아닌 에러는 500을 반환한다', async () => {
    const app = createTestApp((_req, _res, next) => {
      next(new Error('예상치 못한 오류'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('500 응답에 내부 오류 메시지가 포함된다', async () => {
    const app = createTestApp((_req, _res, next) => {
      next(new Error('DB 연결 실패'));
    });
    const res = await request(app).get('/test');
    expect(res.body.error.message).toBe('서버 내부 오류가 발생했습니다.');
  });
});

describe('app.ts CORS 설정', () => {
  it('CORS 헤더가 응답에 포함된다', async () => {
    const testApp = require('../../src/app');
    const res = await request(testApp)
      .get('/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
