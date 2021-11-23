const request = require('supertest');
const { app } = require('../jest/common');
const sql = require('../sql');

const ID = 100;

const sampleQuestion = () => ({
  product_id: ID,
  question_body: 'body',
  question_date: new Date().toISOString(),
  asker_name: 'name',
  asker_email: 'email',
  question_helpfulness: 3,
  reported: false,
});

async function sendQuestion(question) {
  const keys = Object.keys(question);
  const { rows } = await sql.query(`
    INSERT INTO question (${keys.join(', ')})
      VALUES (${Object.keys(keys).map(i => `$${Number(i) + 1}`).join(', ')})
      RETURNING *
  `, Object.values(question));
  const received = rows[0];

  received.answers = {};
  received.question_date = received.question_date.toISOString();
  delete received.asker_email;
  delete received.product_id;
  return rows[0];
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
  const { rows } = await sql.query(`
    INSERT INTO answer (${keys.join(', ')})
      VALUES (${Object.keys(keys).map(i => `$${Number(i) + 1}`).join(', ')})
      RETURNING *
  `, Object.values(answer));
  const received = rows[0];

  received.date = received.date.toISOString();
  received.photos = received.photos.length === 0 ? [] : received.photos.split(' ');
  received.answer_id = received.id;
  delete received.id;
  delete received.answerer_email;
  delete received.question_id;
  delete received.reported;
  return rows[0];
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
      .expect('Content-Type', /application\/json/i)
      .expect(200);

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

    const res = await request(app)
      .get(`/qa/questions/${question_id}/answers?count=3&page=4`)
      .expect(200);

    const bodies = res.body.results
      .map(answer => answer.body);

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
      .expect('Content-Type', /application\/json/i)
      .expect(200);

    expect(res.body.results).toEqual([received]);
  });

  it('sends an empty array with no results', async () => {
    sample.product_id += 10;
    await sendQuestion(sample);

    const res = await request(app)
      .get(`/qa/questions?product_id=${ID + 80}`)
      .expect(200);

    expect(res.body.results).toEqual([]);
  });

  it('hides reported questions', async () => {
    sample.product_id += 20;
    const received = await sendQuestion(sample);
    sample.reported = true;
    await sendQuestion(sample);

    const res = await request(app)
      .get(`/qa/questions?product_id=${sample.product_id}`)
      .expect(200);

    expect(res.body.results).toEqual([received]);
  });

  it('paginates', async () => {
    sample.product_id += 30;
    for (let i = 1; i <= 20; i += 1) {
      sample.question_body = i.toString();
      await sendQuestion(sample);
    }

    const res = await request(app)
      .get(`/qa/questions?product_id=${sample.product_id}&count=3&page=4`)
      .expect(200);

    const bodies = res.body.results
      .map(question => question.question_body);

    expect(bodies).toEqual(['10', '11', '12']);
  });

  it('displays only the corresponding answers', async () => {
    const answer = sampleAnswer();
    const answer_ids = [];
    for (let i = 0; i <= 5; i += 1) {
      sample.product_id = ID + 40 + (i === 0 || i === 5 ? i : 3);
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
    sample.product_id += 50;
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
