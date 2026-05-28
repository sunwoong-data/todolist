import { pool } from '../db/pool';
import { Todo } from '../types/todo';

function mapRow(row: Record<string, unknown>): Todo {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    categoryId: row.category_id as string,
    title: row.title as string,
    description: row.description as string | null,
    startDate: row.start_date ? String(row.start_date).substring(0, 10) : null,
    endDate: row.end_date ? String(row.end_date).substring(0, 10) : null,
    isCompleted: row.is_completed as boolean,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export interface FindTodosFilter {
  status?: string;
  categoryId?: string;
}

export async function findByUserId(userId: string, filter: FindTodosFilter = {}): Promise<Todo[]> {
  const conditions: string[] = ['user_id = $1'];
  const params: unknown[] = [userId];
  let idx = 2;

  if (filter.status === 'pending') {
    conditions.push(`is_completed = false AND (start_date IS NULL OR start_date > CURRENT_DATE)`);
  } else if (filter.status === 'in_progress') {
    conditions.push(`is_completed = false AND start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date >= CURRENT_DATE)`);
  } else if (filter.status === 'overdue') {
    conditions.push(`is_completed = false AND end_date < CURRENT_DATE`);
  } else if (filter.status === 'completed') {
    conditions.push(`is_completed = true`);
  }

  if (filter.categoryId) {
    conditions.push(`category_id = $${idx}`);
    params.push(filter.categoryId);
    idx++;
  }

  const sql = `SELECT * FROM todos WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await pool.query(sql, params);
  return result.rows.map(mapRow);
}

export async function findByIdAndUserId(id: string, userId: string): Promise<Todo | null> {
  const result = await pool.query(
    `SELECT * FROM todos WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

export async function findById(id: string): Promise<Todo | null> {
  const result = await pool.query(`SELECT * FROM todos WHERE id = $1`, [id]);
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

export interface CreateTodoRepoDto {
  userId: string;
  categoryId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export async function create(dto: CreateTodoRepoDto): Promise<Todo> {
  const result = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, description, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [dto.userId, dto.categoryId, dto.title, dto.description ?? null, dto.startDate ?? null, dto.endDate ?? null],
  );
  return mapRow(result.rows[0]);
}

export interface UpdateTodoRepoDto {
  title?: string;
  description?: string | null;
  categoryId?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export async function update(id: string, dto: UpdateTodoRepoDto): Promise<Todo> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (dto.title !== undefined) { fields.push(`title = $${idx++}`); values.push(dto.title); }
  if (dto.description !== undefined) { fields.push(`description = $${idx++}`); values.push(dto.description); }
  if (dto.categoryId !== undefined) { fields.push(`category_id = $${idx++}`); values.push(dto.categoryId); }
  if (dto.startDate !== undefined) { fields.push(`start_date = $${idx++}`); values.push(dto.startDate); }
  if (dto.endDate !== undefined) { fields.push(`end_date = $${idx++}`); values.push(dto.endDate); }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE todos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return mapRow(result.rows[0]);
}

export async function deleteById(id: string): Promise<void> {
  await pool.query(`DELETE FROM todos WHERE id = $1`, [id]);
}

export async function markComplete(id: string): Promise<Todo> {
  const result = await pool.query(
    `UPDATE todos SET is_completed = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id],
  );
  return mapRow(result.rows[0]);
}
