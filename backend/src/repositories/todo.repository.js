const { pool } = require('../db/pool');

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    assigneeId: row.assignee_id ?? null,
    title: row.title,
    description: row.description,
    startDate: row.start_date ? String(row.start_date).substring(0, 10) : null,
    endDate: row.end_date ? String(row.end_date).substring(0, 10) : null,
    isCompleted: row.is_completed,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

async function findByUserId(userId, filter = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
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

  if (filter.assigneeId) {
    conditions.push(`assignee_id = $${idx}`);
    params.push(filter.assigneeId);
    idx++;
  }

  const sql = `SELECT * FROM todos WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await pool.query(sql, params);
  return result.rows.map(mapRow);
}

async function findByIdAndUserId(id, userId) {
  const result = await pool.query(
    `SELECT * FROM todos WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM todos WHERE id = $1`, [id]);
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

async function create(dto) {
  const result = await pool.query(
    `INSERT INTO todos (user_id, category_id, assignee_id, title, description, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [dto.userId, dto.categoryId, dto.assigneeId ?? null, dto.title, dto.description ?? null, dto.startDate ?? null, dto.endDate ?? null],
  );
  return mapRow(result.rows[0]);
}

async function update(id, dto) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (dto.title !== undefined) { fields.push(`title = $${idx++}`); values.push(dto.title); }
  if (dto.description !== undefined) { fields.push(`description = $${idx++}`); values.push(dto.description); }
  if (dto.categoryId !== undefined) { fields.push(`category_id = $${idx++}`); values.push(dto.categoryId); }
  if (dto.assigneeId !== undefined) { fields.push(`assignee_id = $${idx++}`); values.push(dto.assigneeId); }
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

async function deleteById(id) {
  await pool.query(`DELETE FROM todos WHERE id = $1`, [id]);
}

async function markComplete(id) {
  const result = await pool.query(
    `UPDATE todos SET is_completed = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id],
  );
  return mapRow(result.rows[0]);
}

module.exports = { findByUserId, findByIdAndUserId, findById, create, update, deleteById, markComplete };
