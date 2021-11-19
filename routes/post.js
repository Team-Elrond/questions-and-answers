const express = require('express');
const sql = require('../sql');
const { asyncTry } = require('../middleware');

const router = express.Router();

const stmtCreateQuestion = `
  INSERT INTO question (product_id, question_body, asker_name, asker_email)
    VALUES ($1::INT, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR)
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
  await sql.query({
    name: 'create-question',
    text: stmtCreateQuestion,
    values: [product_id, question_body, asker_name, asker_email],
  });
  res.sendStatus(201);
}));

module.exports = router;
