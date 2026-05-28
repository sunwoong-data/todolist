const { AppError } = require('../middlewares/errorHandler');
const categoryRepo = require('../repositories/category.repository');

async function getCategories(userId) {
  return categoryRepo.findByUserId(userId);
}

async function createCategory(userId, dto) {
  try {
    return await categoryRepo.create(userId, dto.name);
  } catch (err) {
    if (err && err.code === '23505') {
      throw new AppError(409, 'CATEGORY_CONFLICT', '이미 같은 이름의 카테고리가 존재합니다.');
    }
    throw err;
  }
}

module.exports = { getCategories, createCategory };
