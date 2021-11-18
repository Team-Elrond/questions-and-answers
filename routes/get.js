const express = require('express');
const sql = require('../sql');
const { asyncTry } = require('../middleware');

const router = express.Router();

const stmtGetAnswers = `
    SELECT id as answer_id, body, date, answerer_name, helpfulness, photos
      FROM answer
      WHERE question_id = $1::INT AND reported = FALSE
      ORDER BY answer_id ASC
      LIMIT $2::INT
      OFFSET $3::INT
`;

router.get('/qa/questions/:question_id/answers', asyncTry(async (req, res) => {
  const question = req.paramInt('question_id');
  const page = req.queryInt('page', 1);
  const count = req.queryInt('count', 5);
  const { rows: results } = await sql.query({
    name: 'get-answers',
    text: stmtGetAnswers,
    values: [question, count, (page - 1) * count],
  });
  for (const answer of results) {
    answer.photos = answer.photos.length === 0 ? [] : answer.photos.split(' ');
  }
  res.json({
    question: question.toString(),
    page,
    count,
    results,
  });
}));

const stmtGetQuestions = `
  SELECT question_id, question_body, question_date, asker_name, question_helpfulness, reported
    FROM question
    WHERE product_id = $1::INT AND reported = FALSE
    ORDER BY question_id ASC
    LIMIT $2::INT
    OFFSET $3::INT
`;
const stmtGetAnswersToQuestions = `
  SELECT id, body, date, answerer_name, helpfulness, photos, answer.question_id
    FROM answer
    INNER JOIN question
    ON answer.question_id = question.question_id
    WHERE product_id=$1::INT
      AND answer.question_id >= $2::INT
      AND answer.question_id <= $3::INT
      AND question.reported = FALSE
      AND answer.reported = FALSE
    order by answer.question_id ASC
`;
router.get('/qa/questions', asyncTry(async (req, res) => {
  const product_id = req.queryInt('product_id');
  const page = req.queryInt('page', 1);
  const count = req.queryInt('count', 5);
  const { rows: results } = await sql.query({
    name: 'get-questions',
    text: stmtGetQuestions,
    values: [product_id, count, (page - 1) * count],
  });
  if (results.length > 0) {
    const questions = new Map();
    for (const question of results) {
      question.answers = {};
      questions.set(question.question_id, question);
    }
    const minQ = results[0].question_id;
    const maxQ = results[results.length - 1].question_id;
    const { rows: answers } = await sql.query({
      name: 'get-answers-to-questions',
      text: stmtGetAnswersToQuestions,
      values: [product_id, minQ, maxQ],
    });
    let question = {};
    for (const answer of answers) {
      if (question.question_id !== answer.question_id) {
        question = questions.get(answer.question_id);
      }
      answer.photos = answer.photos.length === 0 ? [] : answer.photos.split(' ');
      question.answers[answer.id] = answer;
      delete answer.question_id;
    }
  }
  res.json({
    product_id: product_id.toString(),
    results,
  });
}));

module.exports = router;
