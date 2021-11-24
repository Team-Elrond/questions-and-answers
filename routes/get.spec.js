const request = require('supertest');
const { app } = require('../jest/common');
const sql = require('../sql');

const ID = 100;

const sampleQuestion = () => ({
  product_id: ID,
  question_body: 'Body',
  question_date: new Date().toISOString(),
  asker_name: 'Name',
  asker_email: 'e@mail.com',
  question_helpfulness: 3,
  reported: false,
});

async function sendQuestion(question) {
  const keys = Object.keys(question);
  const { rows: [received] } = await sql.query(`
    INSERT INTO question (${keys.join(', ')})
      VALUES (${Object.keys(keys).map(i => `$${Number(i) + 1}`).join(', ')})
      RETURNING *
  `, Object.values(question));

  received.answers = {};
  received.question_date = received.question_date.toISOString();
  delete received.asker_email;
  delete received.product_id;
  return received;
}

const sampleAnswer = () => ({
  question_id: ID,
  body: 'body',
  date: new Date().toISOString(),
  answerer_name: 'name',
  answerer_email: 'email',
  helpfulness: 3,
  reported: false,
  photos: 'a b c d',
});

/** @returns {Promise<number>} */
async function sendAnswer(answer) {
  const keys = Object.keys(answer);
  const { rows: [received] } = await sql.query(`
    INSERT INTO answer (${keys.join(', ')})
      VALUES (${Object.keys(keys).map(i => `$${Number(i) + 1}`).join(', ')})
      RETURNING *
  `, Object.values(answer));

  received.date = received.date.toISOString();
  received.photos = received.photos.length === 0 ? [] : received.photos.split(' ');
  received.answer_id = received.id;
  delete received.id;
  delete received.answerer_email;
  delete received.question_id;
  delete received.reported;
  return received;
}

describe('GET /qa/questions/:question_id/answers', () => {
  let sample;

  beforeEach(() => { sample = sampleAnswer(); });

  it('sends results', async () => {
    const { question_id } = await sendQuestion(sampleQuestion());
    sample.question_id = question_id;
    const received = await sendAnswer(sample);

    const res = await request(app)
      .get(`/qa/questions/${question_id}/answers`)
      .expect(200)
      .expect('Content-Type', /application\/json/i);

    expect(res.body.results).toEqual([received]);
  });

  it('sends an empty array with no results', async () => {
    const { question_id } = await sendQuestion(sampleQuestion());
    sample.question_id = question_id;
    await sendAnswer(sample);

    const res = await request(app)
      .get(`/qa/questions/${question_id + 1}/answers`)
      .expect(200);

    expect(res.body.results).toEqual([]);
  });

  it('hides reported answers', async () => {
    const { question_id } = await sendQuestion(sampleQuestion());
    sample.question_id = question_id;
    sample.reported = true;
    await sendAnswer(sample);
    sample.reported = false;
    const received = await sendAnswer(sample);

    const res = await request(app)
      .get(`/qa/questions/${question_id}/answers`)
      .expect(200);

    expect(res.body.results).toEqual([received]);
  });

  it('splits photos appropriately', async () => {
    const { question_id } = await sendQuestion(sampleQuestion());
    sample.question_id = question_id;
    await sendAnswer(sample);
    sample.photos = '';
    await sendAnswer(sample);

    const res = await request(app)
      .get(`/qa/questions/${question_id}/answers`)
      .expect(200);

    const photos = res.body.results
      .map(answer => answer.photos);

    expect(photos).toEqual([['a', 'b', 'c', 'd'], []]);
  });

  it('paginates', async () => {
    const { question_id } = await sendQuestion(sampleQuestion());
    sample.question_id = question_id;

    for (let i = 1; i < 20; i += 1) {
      sample.body = i.toString();
      await sendAnswer(sample);
    }

    const { body } = await request(app)
      .get(`/qa/questions/${question_id}/answers?count=3&page=4`)
      .expect(200);

    const bodies = body.results.map(answer => answer.body);

    delete body.results;

    expect(body).toEqual({
      question: question_id.toString(),
      page: '4',
      count: 3,
    });

    expect(bodies).toEqual(['10', '11', '12']);
  });
});

describe('GET /qa/questions', () => {
  let sample;

  beforeEach(() => { sample = sampleQuestion(); });

  it('sends results', async () => {
    sample.product_id += 10;
    const received = await sendQuestion(sample);

    const res = await request(app)
      .get(`/qa/questions?product_id=${sample.product_id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/i);

    expect(res.body).toEqual({
      product_id: sample.product_id.toString(),
      results: [received],
    });
  });

  it('sends an empty array with no results', async () => {
    sample.product_id += 20;
    await sendQuestion(sample);

    const res = await request(app)
      .get(`/qa/questions?product_id=${sample.product_id + 30}`)
      .expect(200);

    expect(res.body.results).toEqual([]);
  });

  it('hides reported questions', async () => {
    sample.product_id += 40;
    const received = await sendQuestion(sample);
    sample.reported = true;
    await sendQuestion(sample);

    const res = await request(app)
      .get(`/qa/questions?product_id=${sample.product_id}`)
      .expect(200);

    expect(res.body.results).toEqual([received]);
  });

  it('paginates', async () => {
    sample.product_id += 50;
    for (let i = 1; i <= 20; i += 1) {
      sample.question_body = i.toString();
      await sendQuestion(sample);
    }

    const { body } = await request(app)
      .get(`/qa/questions?product_id=${sample.product_id}&count=3&page=4`)
      .expect(200);

    const bodies = body.results.map(question => question.question_body);

    expect(bodies).toEqual(['10', '11', '12']);
  });

  it('displays only the corresponding answers', async () => {
    const answer = sampleAnswer();
    const answer_ids = [];
    for (let i = 0; i <= 5; i += 1) {
      sample.product_id = ID + 60 + (i === 0 || i === 5 ? i : 3);
      const { question_id } = await sendQuestion(sample);
      answer.question_id = question_id;
      for (let j = 0; j <= 2; j += 1) {
        answer.reported = !j;
        const received = await sendAnswer(answer);
        if (sample.product_id === ID + 43 && !answer.reported) {
          answer_ids.push(received.answer_id.toString());
        }
      }
    }

    const res = await request(app)
      .get(`/qa/questions?product_id=${ID + 43}&count=2&page=2`)
      .expect(200);

    const answers = res.body.results
      .flatMap(question => Object.keys(question.answers));

    expect(answers).toEqual(answer_ids.slice(4, 9));
  });

  it('splits photos appropriately', async () => {
    const answer = sampleAnswer();
    sample.product_id += 70;
    const { question_id } = await sendQuestion(sample);

    answer.question_id = question_id;
    await sendAnswer(answer);
    answer.photos = '';
    await sendAnswer(answer);

    const res = await request(app)
      .get(`/qa/questions?product_id=${sample.product_id}`)
      .expect(200);

    const photos = res.body.results
      .flatMap(question => Object.values(question.answers))
      .map(answer => answer.photos);

    expect(photos).toEqual([['a', 'b', 'c', 'd'], []]);
  });
});
