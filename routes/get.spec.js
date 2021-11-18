const express = require('express');
const request = require('supertest');
const sql = require('../sql');

const app = express();
app.use(express.json());
app.use(require('../middleware/requestParser'));
app.use(require('./get'));

describe('GET /qa/questions/:question_id/answers', () => {
  let sample;
  const sendSample = () => sql.query(
    'INSERT INTO answer VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    Object.values(sample)
  );
  const pruneSample = () => {
    delete sample.reported;
    delete sample.answerer_email;
    delete sample.question_id;
    sample.photos = sample.photos.split(' ');
  };

  beforeEach(() => {
    sample = {
      answer_id: 1,
      question_id: 2,
      body: 'body',
      date: new Date().toISOString(),
      answerer_name: 'name',
      answerer_email: 'email',
      helpfulness: 3,
      reported: false,
      photos: 'a b c d',
    };
  });

  it('sends results', async () => {
    await sendSample();
    pruneSample();

    const res = await request(app)
      .get('/qa/questions/2/answers')
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect(res.body.results).toEqual([sample]);
  });

  it('sends an empty array with no results', async () => {
    await sendSample();

    const res = await request(app)
      .get('/qa/questions/0/answers');

    expect(res.body.results).toEqual([]);
  });

  it('hides reported answers', async () => {
    sample.reported = true;
    await sendSample();
    sample.answer_id = 2;
    sample.reported = false;
    await sendSample();
    pruneSample();

    const res = await request(app)
      .get('/qa/questions/2/answers');

    expect(res.body.results).toEqual([sample]);
  });

  it('paginates', async () => {
    for (let i = 1; i < 20; i += 1) {
      sample.answer_id = i;
      sample.body = i.toString();
      await sendSample();
    }

    const res = await request(app)
      .get('/qa/questions/2/answers?count=3&page=4');

    expect(res.body.results.map(row => row.body)).toEqual(['10', '11', '12']);
  });
});

describe('GET /qa/questions', () => {
  let sample;
  const sendSample = () => sql.query(
    'INSERT INTO question VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    Object.values(sample)
  );
  const pruneSample = () => {
    delete sample.reported;
    delete sample.asker_email;
    delete sample.product_id;
    sample.answers = {};
  };

  beforeEach(() => {
    sample = {
      question_id: 1,
      product_id: 2,
      question_body: 'body',
      question_date: new Date().toISOString(),
      asker_name: 'name',
      asker_email: 'email',
      question_helpfulness: 3,
      reported: false,
    };
  });

  it('sends results', async () => {
    await sendSample();
    pruneSample();

    const res = await request(app)
      .get('/qa/questions?product_id=2')
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect(res.body.results).toEqual([sample]);
  });

  it('sends an empty array with no results', async () => {
    await sendSample();

    const res = await request(app)
      .get('/qa/questions?product_id=0');

    expect(res.body.results).toEqual([]);
  });

  it('hides reported questions', async () => {
    sample.reported = true;
    await sendSample();
    sample.question_id = 2;
    sample.reported = false;
    await sendSample();
    pruneSample();

    const res = await request(app)
      .get('/qa/questions?product_id=2');

    expect(res.body.results).toEqual([sample]);
  });

  it('paginates', async () => {
    for (let i = 1; i <= 20; i += 1) {
      sample.question_id = i;
      sample.question_body = i.toString();
      await sendSample();
    }

    const res = await request(app)
      .get('/qa/questions?product_id=2&count=3&page=4');

    expect(res.body.results.map(row => row.question_body))
      .toEqual(['10', '11', '12']);
  });

  it('displays only the corresponding answers', async () => {
    const answer = {
      answer_id: 1,
      question_id: 2,
      body: 'body',
      date: new Date().toISOString(),
      answerer_name: 'name',
      answerer_email: 'email',
      helpfulness: 3,
      reported: false,
      photos: 'a b c d',
    };
    for (let i = 0; i <= 5; i += 1) {
      sample.product_id = i === 0 || i === 5 ? i : 3;
      sample.question_id = i;
      await sendSample();
      answer.question_id = i;
      for (let j = 1; j <= 2; j += 1) {
        answer.answer_id = i * 10 + j;
        sql.query(
          'INSERT INTO answer VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          Object.values(answer)
        );
      }
    }

    const res = await request(app)
      .get('/qa/questions?product_id=3&count=2&page=2');

    expect(res.body.results.flatMap(row => Object.keys(row.answers)))
      .toEqual(['31', '32', '41', '42']);
  });
});
