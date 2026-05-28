import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as userService from '../services/user.service';

const router = Router();

router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getProfile(req.userId!);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.updateProfile(req.userId!, req.body);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
