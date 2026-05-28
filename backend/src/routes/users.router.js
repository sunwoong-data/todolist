const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const userService = require('../services/user.service');

const router = Router();

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.userId);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.userId, req.body);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
