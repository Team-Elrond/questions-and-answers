const { Client: PgClient } = require('pg');

const sql = new PgClient(process.env.DB_URL);
sql.connect().catch(console.error);

module.exports = sql;
