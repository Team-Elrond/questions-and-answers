const request = require('supertest');
const {
  app,
  createAnswer,
  createQuestion,
  getAnswer,
  getQuestion,
} = require('../../jest/common');

const ID = 1000;

describe('PUT /qa/questions/:question_id/helpful', () => {
  it('increments helpfulness by 1', async () => {
    const id1 = await createQuestion(ID);
    const id2 = await createQuestion(ID);

    await request(app)
      .put(`/qa/questions/${id1}/helpful`)
      .expect(204);

    const question1 = await getQuestion(id1);
    expect(question1.question_helpfulness).toBe(1);
    const question2 = await getQuestion(id2);
    expect(question2.question_helpfulness).toBe(0);
  });

  it('tolerates repeated requests', async () => {
    const question_id = await createQuestion(ID);
    await Promise.all(Array(100).fill(1).map(async () =>
      request(app).put(`/qa/questions/${question_id}/helpful`)
    ));

    const question = await getQuestion(question_id);
    expect(question.question_helpfulness).toBe(100);
  });
});

describe('PUT /qa/answers/:answer_id/helpful', () => {
  it('increments helpfulness by 1', async () => {
    const id1 = await createAnswer(ID);
    const id2 = await createAnswer(ID);
    await request(app)
      .put(`/qa/answers/${id1}/helpful`)
      .expect(204);

    const answer1 = await getAnswer(id1);
    expect(answer1.helpfulness).toBe(1);
    const answer2 = await getAnswer(id2);
    expect(answer2.helpfulness).toBe(0);
  });

  it('tolerates repeated requests', async () => {
    const answer_id = await createAnswer(ID);
    await Promise.all(Array(100).fill(1).map(async () =>
      request(app).put(`/qa/answers/${answer_id}/helpful`)
    ));

    const answer = await getAnswer(answer_id);
    expect(answer.helpfulness).toBe(100);
  });
});

describe('PUT /qa/questions/:question_id/report', () => {
  it('reports a question', async () => {
    const id1 = await createQuestion(ID);
    const id2 = await createQuestion(ID);
    await request(app)
      .put(`/qa/questions/${id1}/report`)
      .expect(204);

    const question1 = await getQuestion(id1);
    expect(question1.reported).toBe(true);
    const question2 = await getQuestion(id2);
    expect(question2.reported).toBe(false);
  });

  it('tolerates repeated requests', async () => {
    const question_id = await createQuestion(ID);
    await Promise.all(Array(100).fill(1).map(async () =>
      request(app).put(`/qa/questions/${question_id}/report`)
    ));

    const question = await getQuestion(question_id);
    expect(question.reported).toBe(true);
  });
});

describe('PUT /qa/answers/:answer_id/report', () => {
  it('reports an answer', async () => {
    const id1 = await createAnswer(ID);
    const id2 = await createAnswer(ID);
    await request(app)
      .put(`/qa/answers/${id1}/report`)
      .expect(204);

    const answer1 = await getAnswer(id1);
    expect(answer1.reported).toBe(true);
    const answer2 = await getAnswer(id2);
    expect(answer2.reported).toBe(false);
  });

  it('tolerates repeated requests', async () => {
    const answer_id = await createAnswer(ID);
    await Promise.all(Array(100).fill(1).map(async () =>
      request(app).put(`/qa/answers/${answer_id}/report`)
    ));

    const answer = await getAnswer(answer_id);
    expect(answer.reported).toBe(true);
  });
});
