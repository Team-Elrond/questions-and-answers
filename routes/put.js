const express = require('express');
const { tryPut } = require('@atelier/util');
const sql = require('../sql');

const router = express.Router();

const stmtReportQuestion = `
  UPDATE question
  SET reported = TRUE
  WHERE question_id = $1::INT
`;
router.put('/qa/questions/:question_id/report', (req, res) => tryPut(sql, res, {
  name: 'report-question',
  text: stmtReportQuestion,
  values: [req.paramInt('question_id')],
}));

const stmtReportAnswer = `
  UPDATE answer
  SET reported = TRUE
  WHERE id = $1::INT
`;
router.put('/qa/answers/:answer_id/report', (req, res) => tryPut(sql, res, {
  name: 'report-answer',
  text: stmtReportAnswer,
  values: [req.paramInt('answer_id')],
}));

const stmtHelpfulQuestion = `
  UPDATE question
  SET question_helpfulness = question_helpfulness + 1
  WHERE question_id = $1::INT
`;
router.put('/qa/questions/:question_id/helpful', (req, res) => tryPut(sql, res, {
  name: 'helpful-question',
  text: stmtHelpfulQuestion,
  values: [req.paramInt('question_id')],
}));

const stmtHelpfulAnswer = `
  UPDATE answer
  SET helpfulness = helpfulness + 1
  WHERE id = $1::INT
`;
router.put('/qa/answers/:answer_id/helpful', (req, res) => tryPut(sql, res, {
  name: 'helpful-answer',
  text: stmtHelpfulAnswer,
  values: [req.paramInt('answer_id')],
}));

module.exports = router;
