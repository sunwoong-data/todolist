const { Router } = require('express');
const http = require('http');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { logger } = require('../utils/logger');

const router = Router();

function fetchHolidays(year, month) {
  return new Promise((resolve, reject) => {
    const key = process.env.HOLIDAY_API_KEY;
    const monthStr = String(month).padStart(2, '0');
    const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=${year}&solMonth=${monthStr}&serviceKey=${key}&_type=json&numOfRows=50`;

    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const body = parsed?.response?.body;
          const rawItems = body?.items?.item;
          if (!rawItems) { resolve([]); return; }
          const items = Array.isArray(rawItems) ? rawItems : [rawItems];
          const holidays = items
            .filter((it) => it.isHoliday === 'Y')
            .map((it) => ({
              date: String(it.locdate),
              name: it.dateName,
            }));
          resolve(holidays);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);
    logger.info(`GET /api/holidays year=${year} month=${month}`);
    const holidays = await fetchHolidays(year, month);
    res.status(200).json({ holidays });
  } catch (err) {
    logger.error('GET /api/holidays 오류', err);
    next(err);
  }
});

module.exports = router;
