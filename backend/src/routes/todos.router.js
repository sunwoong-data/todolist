const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { logger } = require('../utils/logger');
const todoService = require('../services/todo.service');

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, category_id, assignee_id } = req.query;
    const todos = await todoService.getTodos(req.userId, { status, categoryId: category_id, assigneeId: assignee_id });
    res.status(200).json({ todos });
  } catch (err) {
    logger.error('GET /api/todos 오류', err);
    next(err);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const todo = await todoService.createTodo(req.userId, req.body);
    res.status(201).json({ todo });
  } catch (err) {
    logger.error('POST /api/todos 오류', err);
    next(err);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const todo = await todoService.getTodoById(req.params.id, req.userId);
    res.status(200).json({ todo });
  } catch (err) {
    logger.error(`GET /api/todos/${req.params.id} 오류`, err);
    next(err);
  }
});

router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const todo = await todoService.updateTodo(req.params.id, req.userId, req.body);
    res.status(200).json({ todo });
  } catch (err) {
    logger.error(`PATCH /api/todos/${req.params.id} 오류`, err);
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await todoService.deleteTodo(req.params.id, req.userId);
    res.status(200).json({ message: '삭제되었습니다.' });
  } catch (err) {
    logger.error(`DELETE /api/todos/${req.params.id} 오류`, err);
    next(err);
  }
});

router.patch('/:id/complete', authMiddleware, async (req, res, next) => {
  try {
    const todo = await todoService.completeTodo(req.params.id, req.userId);
    res.status(200).json({ todo });
  } catch (err) {
    logger.error(`PATCH /api/todos/${req.params.id}/complete 오류`, err);
    next(err);
  }
});

module.exports = router;
