import bcrypt from 'bcrypt';
import { AppError } from '../middlewares/errorHandler';
import * as userRepo from '../repositories/user.repository';
import { User, Theme, Language } from '../types/user';
import { logger } from '../utils/logger';

const VALID_THEMES: Theme[] = ['light', 'dark'];
const VALID_LANGUAGES: Language[] = ['ko', 'en', 'ja'];

export interface UpdateProfileDto {
  name?: string;
  password?: string;
  themePreference?: string;
  languagePreference?: string;
}

export async function getProfile(userId: string): Promise<User> {
  logger.info(`getProfile 호출: userId=${userId}`);
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  }
  return user;
}

export async function updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
  logger.info(`updateProfile 호출: userId=${userId}`);

  if (dto.themePreference !== undefined && !VALID_THEMES.includes(dto.themePreference as Theme)) {
    throw new AppError(400, 'INVALID_THEME', '테마는 light 또는 dark만 허용됩니다.');
  }
  if (dto.languagePreference !== undefined && !VALID_LANGUAGES.includes(dto.languagePreference as Language)) {
    throw new AppError(400, 'INVALID_LANGUAGE', '언어는 ko, en, ja만 허용됩니다.');
  }

  const updateData: Parameters<typeof userRepo.update>[1] = {};
  if (dto.name !== undefined) updateData.name = dto.name;
  if (dto.password !== undefined) updateData.password = await bcrypt.hash(dto.password, 10);
  if (dto.themePreference !== undefined) updateData.themePreference = dto.themePreference as Theme;
  if (dto.languagePreference !== undefined) updateData.languagePreference = dto.languagePreference as Language;

  return userRepo.update(userId, updateData);
}
