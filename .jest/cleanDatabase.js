const sql = require('../sql');

beforeEach(done => {
    sql.query("TRUNCATE answer")
    .then(() => sql.query("TRUNCATE question"))
    .then(() => done())
    .catch(done);
  }
);

afterAll(done => sql.end(done));
