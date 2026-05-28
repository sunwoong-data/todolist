import { AppError } from '../middlewares/errorHandler';
import * as categoryRepo from '../repositories/category.repository';
import { Category } from '../types/category';

export async function getCategories(userId: string): Promise<Category[]> {
  return categoryRepo.findByUserId(userId);
}

export async function createCategory(userId: string, dto: { name: string }): Promise<Category> {
  // UNIQUE(user_id, name) 제약 위반 시 pg 에러 코드 '23505'
  try {
    return await categoryRepo.create(userId, dto.name);
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === '23505') {
      throw new AppError(409, 'CATEGORY_CONFLICT', '이미 같은 이름의 카테고리가 존재합니다.');
    }
    throw err;
  }
}
