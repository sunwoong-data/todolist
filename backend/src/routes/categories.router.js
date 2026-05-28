const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const categoryService = require('../services/category.service');

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories(req.userId);
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.userId, req.body);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
