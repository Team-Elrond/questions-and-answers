const { Client, Pool } = require('pg');

const {
  DB_POOL,
  DB_URL,
} = process.env;
const max = Number(DB_POOL);

const sql = max ? new Pool({
  connectionString: DB_URL,
  max,
}) : new Client({ connectionString: DB_URL });
sql.connect().catch(console.error);

module.exports = sql;
