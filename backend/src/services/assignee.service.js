const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const assigneeRepo = require('../repositories/assignee.repository');

async function getAssignees(userId) {
  logger.info(`getAssignees userId=${userId}`);
  return assigneeRepo.findByUserId(userId);
}

async function createAssignee(userId, dto) {
  logger.info(`createAssignee userId=${userId} name=${dto.name}`);
  try {
    return await assigneeRepo.create(userId, dto.name);
  } catch (err) {
    if (err && err.code === '23505') {
      throw new AppError(409, 'ASSIGNEE_CONFLICT', '이미 같은 이름의 담당자가 존재합니다.');
    }
    throw err;
  }
}

async function deleteAssignee(id, userId) {
  logger.info(`deleteAssignee id=${id} userId=${userId}`);
  const deleted = await assigneeRepo.deleteById(id, userId);
  if (!deleted) {
    throw new AppError(404, 'ASSIGNEE_NOT_FOUND', '담당자를 찾을 수 없습니다.');
  }
}

module.exports = { getAssignees, createAssignee, deleteAssignee };
