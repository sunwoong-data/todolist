const { pool } = require('../db/pool');

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    month: row.month,
    day: row.day,
  };
}

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT id, user_id, name, month, day
     FROM anniversaries
     WHERE user_id = $1
     ORDER BY month, day, name`,
    [userId],
  );
  return result.rows.map(mapRow);
}

async function create(userId, name, month, day) {
  const result = await pool.query(
    `INSERT INTO anniversaries (user_id, name, month, day)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, name, month, day`,
    [userId, name, month, day],
  );
  return mapRow(result.rows[0]);
}

async function deleteById(id, userId) {
  const result = await pool.query(
    `DELETE FROM anniversaries WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  );
  return result.rowCount > 0;
}

module.exports = { findByUserId, create, deleteById };
