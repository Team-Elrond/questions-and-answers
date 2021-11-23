const express = require('express');
const request = require('supertest');
const { requestParser } = require('@atelier/util');
const routes = require('../routes');
const sql = require('../sql');

const app = express();
app.use(express.json());
app.use(requestParser);
app.use(routes.get);
app.use(routes.post);
app.use(routes.put);

module.exports.app = app;

module.exports.getQuestion = async function getQuestion(question_id) {
  const { rows } = await sql.query({
    name: 'get-question',
    text: 'SELECT * FROM question WHERE question_id = $1::INT',
    values: [question_id],
  });
  return rows[0];
};

module.exports.getAnswer = async function getAnswer(answer_id) {
  const { rows } = await sql.query({
    name: 'get-answer',
    text: 'SELECT * FROM answer WHERE id = $1::INT',
    values: [answer_id],
  });
  return rows[0];
};

module.exports.createQuestion = async function createQuestion(product_id) {
  const res = await request(app)
    .post('/qa/questions')
    .send({
      product_id,
      body: 'success',
      name: 'name',
      email: 'e@mail.com',
    })
    .expect(201);
  return Number(res.text);
};

module.exports.createAnswer = async function createAnswer(question_id) {
  const res = await request(app)
    .post(`/qa/questions/${question_id}/answers`)
    .send({
      body: 'success',
      name: 'name',
      email: 'e@mail.com',
      photos: ['a', 'b', 'c', 'd'],
    })
    .expect(201);
  return Number(res.text);
};
