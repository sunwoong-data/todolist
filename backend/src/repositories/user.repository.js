const { pool } = require('../db/pool');

function mapRow(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    themePreference: row.theme_preference,
    languagePreference: row.language_preference,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

async function findByEmail(email) {
  const result = await pool.query(
    `SELECT id, email, name, theme_preference, language_preference, created_at, updated_at
     FROM users WHERE email = $1`,
    [email],
  );
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

async function findByEmailWithPassword(email) {
  const result = await pool.query(
    `SELECT id, email, password, name, theme_preference, language_preference, created_at, updated_at
     FROM users WHERE email = $1`,
    [email],
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return { ...mapRow(row), password: row.password };
}

async function findById(id) {
  const result = await pool.query(
    `SELECT id, email, name, theme_preference, language_preference, created_at, updated_at
     FROM users WHERE id = $1`,
    [id],
  );
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

async function update(userId, dto) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (dto.name !== undefined) { fields.push(`name = $${idx++}`); values.push(dto.name); }
  if (dto.password !== undefined) { fields.push(`password = $${idx++}`); values.push(dto.password); }
  if (dto.themePreference !== undefined) { fields.push(`theme_preference = $${idx++}`); values.push(dto.themePreference); }
  if (dto.languagePreference !== undefined) { fields.push(`language_preference = $${idx++}`); values.push(dto.languagePreference); }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
     RETURNING id, email, name, theme_preference, language_preference, created_at, updated_at`,
    values,
  );
  return mapRow(result.rows[0]);
}

async function create(dto) {
  const result = await pool.query(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, theme_preference, language_preference, created_at, updated_at`,
    [dto.email, dto.password, dto.name],
  );
  return mapRow(result.rows[0]);
}

module.exports = { findByEmail, findByEmailWithPassword, findById, update, create };
