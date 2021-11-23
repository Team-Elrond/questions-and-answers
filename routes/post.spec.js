const request = require('supertest');
const { app, getQuestion, getAnswer } = require('../jest/common');

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
    const { text: question_id } = await request(app)
      .post('/qa/questions')
      .send(sampleRequest)
      .expect(201);

    const created = await getQuestion(Number(question_id));
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
    const { text: answer_id } = await request(app)
      .post('/qa/questions/1/answers')
      .send(sampleRequest)
      .expect(201);

    const created = await getAnswer(Number(answer_id));

    delete created.date;
    delete created.id;
    expect(created).toEqual({
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
