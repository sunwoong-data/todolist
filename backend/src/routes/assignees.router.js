const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { logger } = require('../utils/logger');
const assigneeService = require('../services/assignee.service');

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const assignees = await assigneeService.getAssignees(req.userId);
    res.status(200).json({ assignees });
  } catch (err) {
    logger.error('GET /api/assignees 오류', err);
    next(err);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const assignee = await assigneeService.createAssignee(req.userId, req.body);
    res.status(201).json({ assignee });
  } catch (err) {
    logger.error('POST /api/assignees 오류', err);
    next(err);
  }
});

router.patch('/:id/avatar', authMiddleware, async (req, res, next) => {
  try {
    const assignee = await assigneeService.updateAssigneeAvatar(req.params.id, req.userId, req.body.avatar ?? null);
    res.status(200).json({ assignee });
  } catch (err) {
    logger.error(`PATCH /api/assignees/${req.params.id}/avatar 오류`, err);
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await assigneeService.deleteAssignee(req.params.id, req.userId);
    res.status(200).json({ message: '담당자가 삭제되었습니다.' });
  } catch (err) {
    logger.error(`DELETE /api/assignees/${req.params.id} 오류`, err);
    next(err);
  }
});

module.exports = router;
