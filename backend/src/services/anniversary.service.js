const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const anniversaryRepo = require('../repositories/anniversary.repository');

async function getAnniversaries(userId) {
  logger.info(`getAnniversaries userId=${userId}`);
  return anniversaryRepo.findByUserId(userId);
}

async function createAnniversary(userId, dto) {
  const { name, month, day } = dto;
  logger.info(`createAnniversary userId=${userId} name=${name} month=${month} day=${day}`);

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError(400, 'INVALID_INPUT', '기념일 이름은 필수입니다.');
  }
  const m = Number(month);
  const d = Number(day);
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    throw new AppError(400, 'INVALID_INPUT', '월은 1~12 사이여야 합니다.');
  }
  if (!Number.isInteger(d) || d < 1 || d > 31) {
    throw new AppError(400, 'INVALID_INPUT', '일은 1~31 사이여야 합니다.');
  }

  try {
    return await anniversaryRepo.create(userId, name.trim(), m, d);
  } catch (err) {
    if (err && err.code === '23505') {
      throw new AppError(409, 'ANNIVERSARY_CONFLICT', '이미 같은 이름의 기념일이 존재합니다.');
    }
    throw err;
  }
}

async function deleteAnniversary(id, userId) {
  logger.info(`deleteAnniversary id=${id} userId=${userId}`);
  const deleted = await anniversaryRepo.deleteById(id, userId);
  if (!deleted) {
    throw new AppError(404, 'ANNIVERSARY_NOT_FOUND', '기념일을 찾을 수 없습니다.');
  }
}

module.exports = { getAnniversaries, createAnniversary, deleteAnniversary };
