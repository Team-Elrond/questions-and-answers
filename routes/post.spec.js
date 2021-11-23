const express = require('express');
const request = require('supertest');
const sql = require('../sql');

const app = express();
app.use(express.json());
app.use(require('@atelier/util').requestParser);
app.use(require('./post'));

describe('POST /qa/questions', () => {
  let sampleRequest;

  beforeEach(() => {
    sampleRequest = {
      product_id: 1,
      body: '2',
      name: '3',
      email: '4@5.com',
      reported: true, // make sure no illegal fields
    };
  });

  it('creates a question', async () => {
    await request(app)
      .post('/qa/questions')
      .send(sampleRequest)
      .expect(201);

    const { rows } = await sql.query('SELECT * FROM question');
    const created = rows[0];
    delete created.question_date;
    delete created.question_id;
    expect(created).toEqual({
      product_id: 1,
      question_body: '2',
      asker_name: '3',
      asker_email: '4@5.com',
      reported: false,
      question_helpfulness: 0,
    });
  });

  it('validates email', async () => {
    sampleRequest.email = '45.com';
    await request(app)
      .post('/qa/questions')
      .send(sampleRequest)
      .expect(422);
  });
});

describe('POST /qa/questions/:question_id/answers', () => {
  let sampleRequest;

  beforeEach(() => {
    sampleRequest = {
      body: '2',
      name: '3',
      email: '4@5.com',
      photos: ['a', 'b', 'c'],
      reported: true, // make sure no illegal fields
    };
  });

  it('creates an answer', async () => {
    await request(app)
      .post('/qa/questions/1/answers')
      .send(sampleRequest)
      .expect(201);

    const { rows } = await sql.query('SELECT * FROM answer');
    const created = rows[0];
    delete created.date;
    delete created.id;
    expect(rows[0]).toEqual({
      question_id: 1,
      body: '2',
      answerer_name: '3',
      answerer_email: '4@5.com',
      photos: 'a b c',
      reported: false,
      helpfulness: 0,
    });
  });

  it('validates email', async () => {
    sampleRequest.email = '45.com';
    await request(app)
      .post('/qa/questions/1/answers')
      .send(sampleRequest)
      .expect(422);
  });
});
