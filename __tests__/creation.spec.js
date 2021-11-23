const request = require('supertest');
const { app, createQuestion, createAnswer } = require('../jest/common');

const ID = 500;

it('displays a created question', async () => {
  await createQuestion(ID);

  const res = await request(app)
    .get(`/qa/questions?product_id=${ID}`)
    .expect(200);

  const bodies = res.body.results
    .map(question => question.question_body);

  expect(bodies).toEqual(['success']);
});

it('displays a created answer', async () => {
  const question_id = await createQuestion(ID + 10);
  await createAnswer(question_id);

  const res = await request(app)
    .get(`/qa/questions/${question_id}/answers`)
    .expect(200);

  const bodies = res.body.results
    .map(answer => answer.body);

  expect(bodies).toEqual(['success']);
});

it('displays child answers', async () => {
  const question_id = await createQuestion(ID + 20);
  const answer_id = await createAnswer(question_id);

  const res = await request(app)
    .get(`/qa/questions?product_id=${ID + 20}`)
    .expect(200);

  const answer = res.body.results[0].answers[answer_id];
  expect(answer).not.toBeNull();
  expect(answer.body).toBe('success');
});
