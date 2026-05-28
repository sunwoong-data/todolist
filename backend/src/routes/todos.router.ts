import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';
import * as todoService from '../services/todo.service';

const router = Router();

// GET /api/todos?status=&category_id=
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, category_id } = req.query as { status?: string; category_id?: string };
    const todos = await todoService.getTodos(req.userId!, { status, categoryId: category_id });
    res.status(200).json({ todos });
  } catch (err) {
    logger.error('GET /api/todos 오류', err);
    next(err);
  }
});

// POST /api/todos
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todo = await todoService.createTodo(req.userId!, req.body);
    res.status(201).json({ todo });
  } catch (err) {
    logger.error('POST /api/todos 오류', err);
    next(err);
  }
});

// GET /api/todos/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todo = await todoService.getTodoById(req.params.id, req.userId!);
    res.status(200).json({ todo });
  } catch (err) {
    logger.error(`GET /api/todos/${req.params.id} 오류`, err);
    next(err);
  }
});

// PATCH /api/todos/:id
router.patch('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todo = await todoService.updateTodo(req.params.id, req.userId!, req.body);
    res.status(200).json({ todo });
  } catch (err) {
    logger.error(`PATCH /api/todos/${req.params.id} 오류`, err);
    next(err);
  }
});

// DELETE /api/todos/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await todoService.deleteTodo(req.params.id, req.userId!);
    res.status(200).json({ message: '삭제되었습니다.' });
  } catch (err) {
    logger.error(`DELETE /api/todos/${req.params.id} 오류`, err);
    next(err);
  }
});

// PATCH /api/todos/:id/complete
router.patch('/:id/complete', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todo = await todoService.completeTodo(req.params.id, req.userId!);
    res.status(200).json({ todo });
  } catch (err) {
    logger.error(`PATCH /api/todos/${req.params.id}/complete 오류`, err);
    next(err);
  }
});

export default router;
