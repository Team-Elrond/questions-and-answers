const express = require('express');
const sql = require('../sql');
const { asyncTry } = require('../middleware');

const router = express.Router();

const stmtCreateQuestion = `
  INSERT INTO question (product_id, question_body, asker_name, asker_email)
    VALUES ($1::INT, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR)
    RETURNING (question_id)
`;
router.post('/qa/questions', asyncTry(async (req, res) => {
  const product_id = req.bodyInt('product_id');
  const question_body = req.bodyString('body');
  const asker_name = req.bodyString('name');
  const asker_email = req.bodyString('email');
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(asker_email)) {
    res.status(422).send('Invalid e-mail');
    return;
  }
  const { rows } = await sql.query({
    name: 'create-question',
    text: stmtCreateQuestion,
    values: [product_id, question_body, asker_name, asker_email],
  });
  res
    .status(201).type('text/plain').send(rows[0].question_id.toString());
}));

const stmtCreateAnswer = `
  INSERT INTO answer (question_id, body, answerer_name, answerer_email, photos)
    VALUES ($1::INT, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR)
    RETURNING (id)
`;
router.post('/qa/questions/:question_id/answers', asyncTry(async (req, res) => {
  const question_id = req.paramInt('question_id');
  const body = req.bodyString('body');
  const answerer_name = req.bodyString('name');
  const answerer_email = req.bodyString('email');
  const photos = req.body.photos;
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(answerer_email)) {
    res.status(422).send('Invalid email');
    return;
  }
  if (!Array.isArray(photos) || !photos.every(photo =>
    typeof photo === 'string' && photo.indexOf(' ') === -1
  )) {
    res.status(422).send('photos must be an array of strings');
    return;
  }
  const { rows } = await sql.query({
    name: 'create-answer',
    text: stmtCreateAnswer,
    values: [question_id, body, answerer_name, answerer_email, photos.join(' ')],
  });
  res.status(201).type('text/plain').send(rows[0].id.toString());
}));

module.exports = router;
