const request = require('supertest');
const { app, createQuestion, createAnswer } = require('../jest/common');

const ID = 750;

it('increments the helpfulness of a question', async () => {
  const question_id = await createQuestion(ID);

  await Promise.all(Array(5).fill(1).map(async () =>
    request(app)
      .put(`/qa/questions/${question_id}/helpful`)
      .expect(204)
  ));

  const res = await request(app)
    .get(`/qa/questions?product_id=${ID}`)
    .expect(200);

  expect(res.body.results[0].question_helpfulness).toBe(5);
});

it('increments the helpfulness of an answer', async () => {
  const question_id = await createQuestion(ID + 10);
  const answer_id = await createAnswer(question_id);

  await Promise.all(Array(5).fill(1).map(async () =>
    request(app)
      .put(`/qa/answers/${answer_id}/helpful`)
      .expect(204)
  ));

  const res = await request(app)
    .get(`/qa/questions/${question_id}/answers`)
    .expect(200);

  expect(res.body.results[0].helpfulness).toBe(5);
});
