require('dotenv/config');
const { pool } = require('../../src/db/pool');

describe('DB 커넥션 풀', () => {
  it('pool 인스턴스가 export된다', () => {
    expect(pool).toBeDefined();
  });

  it('max 설정값이 20이다', () => {
    expect(pool.options.max).toBe(20);
  });

  it('idleTimeoutMillis 설정값이 30000이다', () => {
    expect(pool.options.idleTimeoutMillis).toBe(30000);
  });

  it('connectionTimeoutMillis 설정값이 2000이다', () => {
    expect(pool.options.connectionTimeoutMillis).toBe(2000);
  });

  it('실제 DB에 연결할 수 있다', async () => {
    const client = await pool.connect();
    client.release();
    expect(client).toBeDefined();
  });

  it('SELECT 1 쿼리가 실행된다', async () => {
    const result = await pool.query('SELECT 1 AS value');
    expect(result.rows[0].value).toBe(1);
  });
});
