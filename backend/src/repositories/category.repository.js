const { pool } = require('../db/pool');

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    isDefault: row.is_default,
  };
}

async function createDefaultCategory(userId) {
  const result = await pool.query(
    `INSERT INTO categories (user_id, name, is_default)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, name, is_default`,
    [userId, '기본', true],
  );
  return mapRow(result.rows[0]);
}

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT id, user_id, name, is_default FROM categories WHERE user_id = $1`,
    [userId],
  );
  return result.rows.map(mapRow);
}

async function findDefaultByUserId(userId) {
  const result = await pool.query(
    `SELECT id, user_id, name, is_default FROM categories WHERE user_id = $1 AND is_default = true`,
    [userId],
  );
  return result.rows.length > 0 ? mapRow(result.rows[0]) : null;
}

async function create(userId, name) {
  const result = await pool.query(
    `INSERT INTO categories (user_id, name, is_default)
     VALUES ($1, $2, false)
     RETURNING id, user_id, name, is_default`,
    [userId, name],
  );
  return mapRow(result.rows[0]);
}

module.exports = { createDefaultCategory, findByUserId, findDefaultByUserId, create };
