const dotenv = require('dotenv');
const { Client: PgClient } = require('pg');

dotenv.config();

const sql = new PgClient(process.env.DB_URL);
sql.connect().catch(console.error);

module.exports = sql;
