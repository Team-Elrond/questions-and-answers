const request = require('supertest');
const { app, createQuestion, createAnswer } = require('../jest/common');

const ID = 600;

it('hides a reported question', async () => {
  const id1 = await createQuestion(ID);
  const id2 = await createQuestion(ID);

  await request(app)
    .put(`/qa/questions/${id1}/report`)
    .expect(204);

  const res = await request(app)
    .get(`/qa/questions?product_id=${ID}`)
    .expect(200);

  const ids = res.body.results
    .map(question => question.question_id);

  expect(ids).toEqual([id2]);
});

it('hides a reported answer', async () => {
  const question_id = await createQuestion(ID + 10);
  const id1 = await createAnswer(question_id);
  const id2 = await createAnswer(question_id);

  await request(app)
    .put(`/qa/answers/${id1}/report`)
    .expect(204);

  const res = await request(app)
    .get(`/qa/questions/${question_id}/answers`)
    .expect(200);

  const ids = res.body.results
    .map(answer => answer.answer_id);

  expect(ids).toEqual([id2]);
});
