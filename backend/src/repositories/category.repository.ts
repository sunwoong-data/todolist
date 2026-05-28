import { pool } from '../db/pool';
import { Category } from '../types/category';

function mapRow(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    isDefault: row.is_default as boolean,
  };
}

export async function createDefaultCategory(userId: string): Promise<Category> {
  const result = await pool.query(
    `INSERT INTO categories (user_id, name, is_default)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, name, is_default`,
    [userId, '기본', true],
  );
  return mapRow(result.rows[0]);
}

export async function findByUserId(userId: string): Promise<Category[]> {
  const result = await pool.query(
    `SELECT id, user_id, name, is_default FROM categories WHERE user_id = $1`,
    [userId],
  );
  return result.rows.map(mapRow);
}

export async function findDefaultByUserId(userId: string): Promise<Category | null> {
  const result = await pool.query(
    `SELECT id, user_id, name, is_default FROM categories WHERE user_id = $1 AND is_default = true`,
    [userId],
  );
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

export async function create(userId: string, name: string): Promise<Category> {
  const result = await pool.query(
    `INSERT INTO categories (user_id, name, is_default)
     VALUES ($1, $2, false)
     RETURNING id, user_id, name, is_default`,
    [userId, name],
  );
  return mapRow(result.rows[0]);
}
