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
    await request(app)
      .get('/qa/questions/2/answers')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .expect(res => expect(res.body.results).toEqual([sample]));
  });

  it('sends an empty array with no results', async () => {
    await sendSample();
    await request(app)
      .get('/qa/questions/0/answers')
      .expect(res => expect(res.body.results).toEqual([]));
  });

  it('hides reported answers', async () => {
    sample.reported = true;
    await sendSample();
    sample.answer_id = 2;
    sample.reported = false;
    await sendSample();
    pruneSample();
    await request(app)
      .get('/qa/questions/2/answers')
      .expect(res => expect(res.body.results).toEqual([sample]));
  });

  it('paginates', async () => {
    const answer = {
      answerer_id: 0,
      question_id: 2,
      body: 'body',
      date: new Date(),
      answerer_name: 'name',
      answerer_email: 'email',
      helpfulness: 3,
      reported: false,
      photos: 'a b c d',
    };
    for (let i = 1; i < 20; i += 1) {
      answer.answerer_id = i;
      answer.body = i.toString();
      await sql.query(
        'INSERT INTO answer VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        Object.values(answer)
      );
    }
    await request(app)
      .get('/qa/questions/2/answers?count=3&page=4')
      .expect(res => expect(res.body.results.map(row => row.body))
        .toEqual(['10', '11', '12']));
  });
});
