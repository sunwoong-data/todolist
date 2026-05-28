const bcrypt = require('bcrypt');
const { AppError } = require('../middlewares/errorHandler');
const userRepo = require('../repositories/user.repository');
const { logger } = require('../utils/logger');

const VALID_THEMES = ['light', 'dark'];
const VALID_LANGUAGES = ['ko', 'en', 'ja'];

async function getProfile(userId) {
  logger.info(`getProfile 호출: userId=${userId}`);
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  }
  return user;
}

async function updateProfile(userId, dto) {
  logger.info(`updateProfile 호출: userId=${userId}`);
  if (dto.themePreference !== undefined && !VALID_THEMES.includes(dto.themePreference)) {
    throw new AppError(400, 'INVALID_THEME', '테마는 light 또는 dark만 허용됩니다.');
  }
  if (dto.languagePreference !== undefined && !VALID_LANGUAGES.includes(dto.languagePreference)) {
    throw new AppError(400, 'INVALID_LANGUAGE', '언어는 ko, en, ja만 허용됩니다.');
  }
  const updateData = {};
  if (dto.name !== undefined) updateData.name = dto.name;
  if (dto.password !== undefined) updateData.password = await bcrypt.hash(dto.password, 10);
  if (dto.themePreference !== undefined) updateData.themePreference = dto.themePreference;
  if (dto.languagePreference !== undefined) updateData.languagePreference = dto.languagePreference;
  return userRepo.update(userId, updateData);
}

module.exports = { getProfile, updateProfile };
