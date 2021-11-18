const express = require('express');
const sql = require('../sql');
const { asyncTry } = require('../middleware');

const router = express.Router();

const stmtReportQuestion = `
  UPDATE question
    SET reported = TRUE
    WHERE question_id = $1::INT
`;
router.put('/qa/questions/:question_id/report', asyncTry(async (req, res) => {
  await sql.query({
    name: 'report-question',
    text: stmtReportQuestion,
    values: [req.paramInt('question_id')],
  });
  res.sendStatus(204);
}));

const stmtReportAnswer = `
  UPDATE answer
    SET reported = TRUE
    WHERE id = $1::INT
`;
router.put('/qa/answers/:answer_id/report', asyncTry(async (req, res) => {
  await sql.query({
    name: 'report-answer',
    text: stmtReportAnswer,
    values: [req.paramInt('answer_id')],
  });
  res.sendStatus(204);
}));

module.exports = router;
