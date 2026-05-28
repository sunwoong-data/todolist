const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  it('200을 반환한다', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('{ status: "ok" }를 반환한다', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('존재하지 않는 경로', () => {
  it('404를 반환한다', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });
});
