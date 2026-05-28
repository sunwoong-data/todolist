import { Router, Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name: string };
    const user = await authService.register({ email, password, name });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
