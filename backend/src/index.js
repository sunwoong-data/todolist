require('dotenv/config');
const app = require('./app');
const { pool } = require('./db/pool');
const { logger } = require('./utils/logger');

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
    .catch((err) => {
      logger.error('DB 연결 실패:', err);
      process.exit(1);
    });
}

module.exports = app;
