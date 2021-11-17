const express = require('express');
const sql = require('../sql');
const { asyncTry } = require('../middleware');

const router = express.Router();

const stmtGetAnswers = `
    SELECT id as answer_id, body, date, answerer_name, helpfulness, photos
      FROM answer
      WHERE question_id=$1::INT AND reported=FALSE
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
    answer.photos = answer.photos.split(' ');
  }
  res.json({
    question: question.toString(),
    page,
    count,
    results,
  });
}));

module.exports = router;
