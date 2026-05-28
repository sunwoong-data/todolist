import 'dotenv/config';
import app from './app';
import { pool } from './db/pool';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 3000;

if (require.main === module) {
  pool.connect()
    .then((client) => {
      client.release();
      logger.info('DB 연결 성공');
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    })
    .catch((err: Error) => {
      logger.error('DB 연결 실패:', err);
      process.exit(1);
    });
}

export default app;
