const express = require('express');
const request = require('supertest');
const sql = require('../sql');

const app = express();
app.use(express.json());
app.use(require('../middleware/requestParser'));
app.use(require('./put'));

beforeEach(async () => {
  const now = new Date().toISOString();
  await Promise.all([1, 2].map(async (id) =>
    sql.query(
      'INSERT INTO question VALUES ($1, 2, \'\', $2, \'\', \'\', 0, FALSE)',
      [id, now]
    )
  ));
  await Promise.all([1, 2].map(async (id) =>
    sql.query(
      'INSERT INTO answer VALUES ($1, 2, \'\', $2, \'\', \'\', 0, FALSE, \'\')',
      [id, now]
    )
  ));
});

const getQuestions = async () =>
  sql.query('SELECT * FROM question ORDER BY question_id ASC');

const getAnswers = async () =>
  sql.query('SELECT * FROM answer ORDER BY id ASC');

describe('PUT /qa/questions/:question_id/helpful', () => {
  it('increments helpfulness by 1', async () => {
    await request(app).put('/qa/questions/2/helpful');
    const { rows } = await getQuestions();
    const helpfulness = rows
      .map(question => question.question_helpfulness);
    expect(helpfulness).toEqual([0, 1]);
  });

  it('tolerates repeated requests', async () => {
    await Promise.all(Array(100).fill(1).map(async () =>
      request(app).put('/qa/questions/1/helpful')
    ));
    const { rows } = await getQuestions();
    expect(rows[0].question_helpfulness).toEqual(100);
  });
});

describe('PUT /qa/answers/:answer_id/helpful', () => {
  it('increments helpfulness by 1', async () => {
    await request(app).put('/qa/answers/2/helpful');
    const { rows } = await getAnswers();
    const helpfulness = rows
      .map(answer => answer.helpfulness);
    expect(helpfulness).toEqual([0, 1]);
  });

  it('tolerates repeated requests', async () => {
    await Promise.all(Array(100).fill(1).map(async () =>
      request(app).put('/qa/answers/1/helpful')
    ));
    const { rows } = await getAnswers();
    expect(rows[0].helpfulness).toEqual(100);
  });
});

describe('PUT /qa/questions/:question_id/report', () => {
  it('reports a question', async () => {
    await request(app).put('/qa/questions/2/report');
    const { rows } = await getQuestions();
    const reported = rows
      .map(question => question.reported);
    expect(reported).toEqual([false, true]);
  });

  it('tolerates repeated requests', async () => {
    await Promise.all(Array(100).fill(1).map(async () =>
      request(app).put('/qa/questions/1/report')
    ));
    const { rows } = await getQuestions();
    expect(rows[0].reported).toEqual(true);
  });
});

describe('PUT /qa/answers/:answer_id/report', () => {
  it('reports a question', async () => {
    await request(app).put('/qa/answers/2/report');
    const { rows } = await getAnswers();
    const reported = rows
      .map(answer => answer.reported);
    expect(reported).toEqual([false, true]);
  });

  it('tolerates repeated requests', async () => {
    await Promise.all(Array(100).fill(1).map(async () =>
      request(app).put('/qa/answers/1/report')
    ));
    const { rows } = await getAnswers();
    expect(rows[0].reported).toEqual(true);
  });
});
