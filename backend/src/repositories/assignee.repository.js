const { pool } = require('../db/pool');

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    avatar: row.avatar ?? null,
  };
}

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT id, user_id, name, avatar FROM assignees WHERE user_id = $1 ORDER BY name`,
    [userId],
  );
  return result.rows.map(mapRow);
}

async function create(userId, name, avatar) {
  const result = await pool.query(
    `INSERT INTO assignees (user_id, name, avatar) VALUES ($1, $2, $3) RETURNING id, user_id, name, avatar`,
    [userId, name, avatar ?? null],
  );
  return mapRow(result.rows[0]);
}

async function deleteById(id, userId) {
  const result = await pool.query(
    `DELETE FROM assignees WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  );
  return result.rowCount > 0;
}

module.exports = { findByUserId, create, deleteById };
