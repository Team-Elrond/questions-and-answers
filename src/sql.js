const { Client, Pool } = require('pg');

const {
  DB_POOL,
  DB_URL,
  DB_WRITE_URL,
} = process.env;
const max = Number(DB_POOL);

function getSql(connectionString) {
  const sql = max
    ? new Pool({ connectionString, max })
    : new Client({ connectionString });
  sql.connect().catch(console.error);
  return sql;
}

const read = getSql(DB_URL);
const write = DB_WRITE_URL ? getSql(DB_WRITE_URL) : read;

module.exports = { read, write };
