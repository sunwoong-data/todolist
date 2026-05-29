const { pool } = require('../db/pool');

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
  };
}

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT id, user_id, name FROM assignees WHERE user_id = $1 ORDER BY name`,
    [userId],
  );
  return result.rows.map(mapRow);
}

async function create(userId, name) {
  const result = await pool.query(
    `INSERT INTO assignees (user_id, name) VALUES ($1, $2) RETURNING id, user_id, name`,
    [userId, name],
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
