const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const todoRepo = require('../repositories/todo.repository');
const categoryRepo = require('../repositories/category.repository');

async function getTodos(userId, filter) {
  logger.info(`getTodos userId=${userId} status=${filter.status ?? ''} categoryId=${filter.categoryId ?? ''} assigneeId=${filter.assigneeId ?? ''}`);
  return todoRepo.findByUserId(userId, { status: filter.status, categoryId: filter.categoryId, assigneeId: filter.assigneeId });
}

async function getTodoById(id, userId) {
  logger.info(`getTodoById id=${id} userId=${userId}`);
  const todo = await todoRepo.findByIdAndUserId(id, userId);
  if (!todo) {
    throw new AppError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }
  return todo;
}

async function createTodo(userId, dto) {
  logger.info(`createTodo userId=${userId} title=${dto.title}`);
  if (dto.startDate && dto.endDate && dto.endDate < dto.startDate) {
    throw new AppError(400, 'INVALID_DATE', '종료일은 시작일보다 이전일 수 없습니다.');
  }
  let categoryId = dto.categoryId;
  if (!categoryId) {
    const defaultCat = await categoryRepo.findDefaultByUserId(userId);
    if (!defaultCat) {
      throw new AppError(500, 'DEFAULT_CATEGORY_NOT_FOUND', '기본 카테고리를 찾을 수 없습니다.');
    }
    categoryId = defaultCat.id;
  }
  return todoRepo.create({
    userId,
    categoryId,
    assigneeId: dto.assigneeId,
    title: dto.title,
    description: dto.description,
    startDate: dto.startDate,
    endDate: dto.endDate,
  });
}

async function updateTodo(id, userId, dto) {
  logger.info(`updateTodo id=${id} userId=${userId}`);
  const existing = await todoRepo.findByIdAndUserId(id, userId);
  if (!existing) {
    const any = await todoRepo.findById(id);
    if (any) {
      throw new AppError(403, 'FORBIDDEN', '다른 사용자의 할 일은 수정할 수 없습니다.');
    }
    throw new AppError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }
  const newStart = dto.startDate !== undefined ? dto.startDate : existing.startDate;
  const newEnd = dto.endDate !== undefined ? dto.endDate : existing.endDate;
  if (newStart && newEnd && newEnd < newStart) {
    throw new AppError(400, 'INVALID_DATE', '종료일은 시작일보다 이전일 수 없습니다.');
  }
  return todoRepo.update(id, {
    title: dto.title,
    description: dto.description,
    categoryId: dto.categoryId,
    assigneeId: dto.assigneeId,
    startDate: dto.startDate,
    endDate: dto.endDate,
  });
}

async function deleteTodo(id, userId) {
  logger.info(`deleteTodo id=${id} userId=${userId}`);
  const existing = await todoRepo.findByIdAndUserId(id, userId);
  if (!existing) {
    const any = await todoRepo.findById(id);
    if (any) {
      throw new AppError(403, 'FORBIDDEN', '다른 사용자의 할 일은 삭제할 수 없습니다.');
    }
    throw new AppError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }
  await todoRepo.deleteById(id);
}

async function completeTodo(id, userId) {
  logger.info(`completeTodo id=${id} userId=${userId}`);
  const existing = await todoRepo.findByIdAndUserId(id, userId);
  if (!existing) {
    const any = await todoRepo.findById(id);
    if (any) {
      throw new AppError(403, 'FORBIDDEN', '다른 사용자의 할 일은 완료 처리할 수 없습니다.');
    }
    throw new AppError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }
  return todoRepo.markComplete(id);
}

module.exports = { getTodos, getTodoById, createTodo, updateTodo, deleteTodo, completeTodo };
