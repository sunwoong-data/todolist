import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import * as todoRepo from '../repositories/todo.repository';
import * as categoryRepo from '../repositories/category.repository';
import { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo';

export async function getTodos(userId: string, filter: { status?: string; categoryId?: string }): Promise<Todo[]> {
  logger.info(`getTodos userId=${userId} status=${filter.status ?? ''} categoryId=${filter.categoryId ?? ''}`);
  return todoRepo.findByUserId(userId, { status: filter.status, categoryId: filter.categoryId });
}

export async function getTodoById(id: string, userId: string): Promise<Todo> {
  logger.info(`getTodoById id=${id} userId=${userId}`);
  const todo = await todoRepo.findByIdAndUserId(id, userId);
  if (!todo) {
    throw new AppError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }
  return todo;
}

export async function createTodo(userId: string, dto: CreateTodoDto): Promise<Todo> {
  logger.info(`createTodo userId=${userId} title=${dto.title}`);

  // BR-06: 종료일 < 시작일 금지
  if (dto.startDate && dto.endDate && dto.endDate < dto.startDate) {
    throw new AppError(400, 'INVALID_DATE', '종료일은 시작일보다 이전일 수 없습니다.');
  }

  // BR-03: 카테고리 미지정 시 기본 카테고리 자동 배정
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
    title: dto.title,
    description: dto.description,
    startDate: dto.startDate,
    endDate: dto.endDate,
  });
}

export async function updateTodo(id: string, userId: string, dto: UpdateTodoDto): Promise<Todo> {
  logger.info(`updateTodo id=${id} userId=${userId}`);

  // BR-05: 소유권 검증
  const existing = await todoRepo.findByIdAndUserId(id, userId);
  if (!existing) {
    const any = await todoRepo.findById(id);
    if (any) {
      throw new AppError(403, 'FORBIDDEN', '다른 사용자의 할 일은 수정할 수 없습니다.');
    }
    throw new AppError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }

  // BR-06: 날짜 유효성
  const newStart = dto.startDate !== undefined ? dto.startDate : existing.startDate;
  const newEnd = dto.endDate !== undefined ? dto.endDate : existing.endDate;
  if (newStart && newEnd && newEnd < newStart) {
    throw new AppError(400, 'INVALID_DATE', '종료일은 시작일보다 이전일 수 없습니다.');
  }

  return todoRepo.update(id, {
    title: dto.title,
    description: dto.description,
    categoryId: dto.categoryId,
    startDate: dto.startDate,
    endDate: dto.endDate,
  });
}

export async function deleteTodo(id: string, userId: string): Promise<void> {
  logger.info(`deleteTodo id=${id} userId=${userId}`);

  // BR-05: 소유권 검증
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

export async function completeTodo(id: string, userId: string): Promise<Todo> {
  logger.info(`completeTodo id=${id} userId=${userId}`);

  // BR-05: 소유권 검증
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
