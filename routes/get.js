const express = require('express');
const PgCursor = require('pg-cursor');
const sql = require('../sql');
const { asyncTry } = require('../middleware');

/**
 * @param {PgCursor} cursor
 * @param {number=} size
 * @returns {Promise<import('pg').Row[]>}
 */
function asyncRead(cursor, size = 1) {
  return new Promise((resolve, reject) => {
    cursor.read(size, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const router = express.Router();

router.get('/qa/questions/:question_id/answers', asyncTry(async (req, res) => {
  const question_id = req.paramInt('question_id');
  const page = req.queryInt('page', 1);
  const count = req.queryInt('count', 5);
  const cursor = sql.query(new PgCursor(`
      SELECT answer_id, body, date, answerer_name, helpfulness, photos
        FROM answer
        WHERE question_id=$1::INT AND reported=FALSE
        ORDER BY answer_id ASC
        LIMIT $2::INT
        OFFSET $3::INT
  `, [question_id, count, (page - 1) * count]));
  res.type('application/json');
  res.write(`{"question":"${question_id}","page":${page},"count":"${count}","results":[`);
  let needsComma = false;
  let row;
  while (([row] = await asyncRead(cursor)).length !== 0) {
    if (needsComma) {
      res.write(',');
    } else {
      needsComma = true;
    }
    row.photos = row.photos.length === 0 ? [] : row.photos.split(' ');
    res.write(JSON.stringify(row));
  }
  res.end(']}');
}));

module.exports = router;
