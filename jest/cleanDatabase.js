const sql = require('../sql');

const statements = [
  'DROP TABLE IF EXISTS answer',
  'DROP TABLE IF EXISTS question',
  `CREATE TABLE question (
    question_id  serial  PRIMARY KEY,
    product_id  integer  NOT NULL,
    question_body  varchar(1000)  NOT NULL,
    question_date  timestamptz  NOT NULL  DEFAULT current_timestamp,
    asker_name  varchar(60)  NOT NULL,
    asker_email  varchar(60)  NOT NULL,
    question_helpfulness  integer  NOT NULL  DEFAULT 0,
    reported  boolean  NOT NULL  DEFAULT false
  )`,
  `CREATE TABLE answer (
    id  serial  PRIMARY KEY,
    question_id  integer  NOT NULL,
    body  varchar(1000)  NOT NULL,
    date  timestamptz  NOT NULL  DEFAULT current_timestamp,
    answerer_name  varchar(60)  NOT NULL,
    answerer_email  varchar(60)  NOT NULL,
    helpfulness  integer  NOT NULL  DEFAULT 0,
    reported  boolean  NOT NULL  DEFAULT false,
    photos  text  NOT NULL  DEFAULT ''
  )`,
];

beforeAll(async () => {
  for (const statement of statements) {
    await sql.query(statement);
  }
});

afterAll(done => sql.end(done));
