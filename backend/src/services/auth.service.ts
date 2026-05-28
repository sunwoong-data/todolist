import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';
import * as userRepo from '../repositories/user.repository';
import * as categoryRepo from '../repositories/category.repository';
import { User } from '../types/user';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

export async function register(dto: RegisterDto): Promise<User> {
  const existing = await userRepo.findByEmail(dto.email);
  if (existing) {
    throw new AppError(409, 'EMAIL_CONFLICT', '이미 사용 중인 이메일입니다.');
  }
  const hashed = await bcrypt.hash(dto.password, 10);
  const user = await userRepo.create({ email: dto.email, password: hashed, name: dto.name });
  await categoryRepo.createDefaultCategory(user.id);
  return user;
}

export async function login(dto: LoginDto): Promise<LoginResult> {
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
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
  );
  return { user, token };
}
