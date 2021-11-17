const sql = require('../sql');

beforeAll(() => 
  sql.query(`
    CREATE TABLE IF NOT EXISTS question (
      question_id  serial  PRIMARY KEY,
      product_id  serial  NOT NULL,
      question_body  varchar(1000)  NOT NULL,
      question_date  timestamp  NOT NULL,
      asker_name  varchar(60)  NOT NULL,
      asker_email  varchar(60)  NOT NULL,
      question_helpfulness  integer  NOT NULL  DEFAULT 0,
      reported  boolean  NOT NULL  DEFAULT FALSE
    )
  `).then(() => sql.query(`
    CREATE TABLE IF NOT EXISTS answer (
        id  serial  PRIMARY KEY,
        question_id  serial,
        body  varchar(1000)  NOT NULL,
        date  timestamp  NOT NULL,
        answerer_name  varchar(60)  NOT NULL,
        answerer_email  varchar(60)  NOT NULL,
        helpfulness  integer  NOT NULL  DEFAULT 0,
        reported  boolean  NOT NULL  DEFAULT FALSE,
        photos  text  NOT NULL  DEFAULT ''
    )
  `))
);

beforeEach(() =>
  sql.query("TRUNCATE answer")
    .then(() => sql.query("TRUNCATE question"))
);

afterAll(done => sql.end(done));
