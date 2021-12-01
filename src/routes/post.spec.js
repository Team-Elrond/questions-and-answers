const request = require('supertest');
const { app, getQuestion, getAnswer } = require('../../jest/common');

const sampleQuestion = {
  product_id: 1,
  body: '2',
  name: '3',
  email: '4@5.com',
  reported: true, // make sure no illegal fields
};

const sampleAnswer = {
  body: '2',
  name: '3',
  email: '4@5.com',
  photos: ['a', 'b', 'c'],
  reported: true, // make sure no illegal fields
};

describe('POST /qa/questions', () => {
  it('creates a question', async () => {
    const { text: question_id } = await request(app)
      .post('/qa/questions')
      .send(sampleQuestion)
      .expect(201);

    const created = await getQuestion(Number(question_id));
    delete created.question_date;
    expect(created).toEqual({
      question_id: Number(question_id),
      product_id: 1,
      question_body: '2',
      asker_name: '3',
      asker_email: '4@5.com',
      reported: false,
      question_helpfulness: 0,
    });
  });

  it('validates email', async () => {
    const question = { ...sampleQuestion, email: '45.com' };
    await request(app)
      .post('/qa/questions')
      .send(question)
      .expect(422);
  });
});

describe('POST /qa/questions/:question_id/answers', () => {
  it('creates an answer', async () => {
    const { text: answer_id } = await request(app)
      .post('/qa/questions/1/answers')
      .send(sampleAnswer)
      .expect(201);

    const created = await getAnswer(Number(answer_id));

    delete created.date;
    expect(created).toEqual({
      id: Number(answer_id),
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
    const answer = { ...sampleAnswer, email: '45.com' };
    await request(app)
      .post('/qa/questions/1/answers')
      .send(answer)
      .expect(422);
  });
});
