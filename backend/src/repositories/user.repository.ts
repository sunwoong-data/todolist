import { pool } from '../db/pool';
import { User, Theme, Language } from '../types/user';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

type UserWithPassword = User & { password: string };

function mapRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    themePreference: row.theme_preference as Theme,
    languagePreference: row.language_preference as Language,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function findByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT id, email, name, theme_preference, language_preference, created_at, updated_at
     FROM users WHERE email = $1`,
    [email],
  );
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

export async function findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
  const result = await pool.query(
    `SELECT id, email, password, name, theme_preference, language_preference, created_at, updated_at
     FROM users WHERE email = $1`,
    [email],
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return { ...mapRow(row), password: row.password as string };
}

export async function findById(id: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT id, email, name, theme_preference, language_preference, created_at, updated_at
     FROM users WHERE id = $1`,
    [id],
  );
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

export async function create(dto: CreateUserDto): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, theme_preference, language_preference, created_at, updated_at`,
    [dto.email, dto.password, dto.name],
  );
  return mapRow(result.rows[0]);
}
