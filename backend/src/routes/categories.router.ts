import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as categoryService from '../services/category.service';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await categoryService.getCategories(req.userId!);
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await categoryService.createCategory(req.userId!, req.body);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

export default router;
