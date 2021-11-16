const compression = require('compression');
const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { Client: PgClient } = require('pg');
const PgCursor = require('pg-cursor');

const { requestParser } = require('./middleware');

dotenv.config();

const {
  DB_URL,
  HTTP_PORT,
  HTTPS_PORT,
  HTTPS_KEY,
  HTTPS_CERT,
} = process.env;

const sql = new PgClient(DB_URL);
sql.connect().catch(console.error);

/**
 * @param {(req: express.Request, res: express.Response, next: express.NextFunction) => Promise} func
 * @returns {(req: express.Request, res: express.Response) => void}
 */
function asyncTry(func) {
  return function asyncTry(req, res, next) {
    func(req, res)
      .then(next)
      .catch(err => {
        const code = err.status || err.statusCode;
        if (code !== undefined) {
          res.sendStatus(code);
        } else {
          next(err);
        }
      });
  };
}

const app = express();
app.use(compression());
app.use(express.json());
app.use(requestParser);

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

app.get('/qa/questions/:question_id/answers', asyncTry(async (req, res) => {
  const question_id = req.paramInt('question_id');
  const page = req.queryInt('page', 1);
  const count = req.queryInt('count', 5);
  const cursor = sql.query(new PgCursor(`
      SELECT answer_id, body, date, answerer_name, helpfulness, photos
        FROM answer
        WHERE question_id=$1::INT
        ORDER BY answer_id ASC
        LIMIT $2::INT
        OFFSET $3::INT
  `, [question_id, count, (page - 1) * count]));
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

if (HTTP_PORT) {
  http.createServer(app).listen(HTTP_PORT);
}

if (HTTPS_PORT) {
  https.createServer({
    key: fs.readFileSync(HTTPS_KEY),
    cert: fs.readFileSync(HTTPS_CERT),
  }, app).listen(HTTPS_PORT);
}

module.exports = app;
