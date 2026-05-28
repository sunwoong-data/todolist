const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middlewares/errorHandler');
const userRepo = require('../repositories/user.repository');
const categoryRepo = require('../repositories/category.repository');

async function register(dto) {
  const existing = await userRepo.findByEmail(dto.email);
  if (existing) {
    throw new AppError(409, 'EMAIL_CONFLICT', '이미 사용 중인 이메일입니다.');
  }
  const hashed = await bcrypt.hash(dto.password, 10);
  const user = await userRepo.create({ email: dto.email, password: hashed, name: dto.name });
  await categoryRepo.createDefaultCategory(user.id);
  return user;
}

async function login(dto) {
  const userWithPw = await userRepo.findByEmailWithPassword(dto.email);
  if (!userWithPw) {
    throw new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  const valid = await bcrypt.compare(dto.password, userWithPw.password);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  const { password: _pw, ...user } = userWithPw;
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
  );
  return { user, token };
}

module.exports = { register, login };
