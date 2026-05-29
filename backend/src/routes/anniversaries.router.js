const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { logger } = require('../utils/logger');
const anniversaryService = require('../services/anniversary.service');

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const anniversaries = await anniversaryService.getAnniversaries(req.userId);
    res.status(200).json({ anniversaries });
  } catch (err) {
    logger.error('GET /api/anniversaries 오류', err);
    next(err);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const anniversary = await anniversaryService.createAnniversary(req.userId, req.body);
    res.status(201).json({ anniversary });
  } catch (err) {
    logger.error('POST /api/anniversaries 오류', err);
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await anniversaryService.deleteAnniversary(req.params.id, req.userId);
    res.status(200).json({ message: '기념일이 삭제되었습니다.' });
  } catch (err) {
    logger.error(`DELETE /api/anniversaries/${req.params.id} 오류`, err);
    next(err);
  }
});

module.exports = router;
