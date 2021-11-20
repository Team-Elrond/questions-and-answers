const express = require('express');
const sql = require('../sql');
const { asyncTry } = require('../middleware');

const router = express.Router();

const stmtGetAnswers = `
    SELECT
      id as answer_id,
      body,
      date,
      answerer_name,
      helpfulness,
      string_to_array(photos, ' ') as photos
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
  res.json({
    question: question.toString(),
    page,
    count,
    results,
  });
}));

const stmtGetQuestions = `
  SELECT
    question.question_id,
    question_body,
    question_date,
    asker_name,
    question_helpfulness,
    question.reported,
    COALESCE(
      json_object_agg(answer.id, json_build_object(
        'id', answer.id,
        'body', answer.body,
        'date', answer.date,
        'answerer_name', answer.answerer_name,
        'helpfulness', answer.helpfulness,
        'photos', string_to_array(answer.photos, ' ')
      )) FILTER (WHERE answer.id IS NOT NULL),
      '{}'::json
    ) AS answers
  FROM question
  LEFT JOIN answer
    ON answer.question_id = question.question_id  
  WHERE product_id = $1::INT
    AND question.reported = FALSE
    AND answer.reported IS DISTINCT FROM TRUE
  GROUP BY question.question_id
  ORDER BY question.question_id ASC
  LIMIT $2::INT
  OFFSET $3::INT
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
  res.json({
    product_id: product_id.toString(),
    results,
  });
}));

module.exports = router;
