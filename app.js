const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');

dotenv.config();

const { requestParser } = require('@atelier/util');
const routes = require('./routes');

const {
  HTTP_PORT,
  HTTPS_PORT,
  HTTPS_KEY,
  HTTPS_CERT,
} = process.env;

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(requestParser);

app.use(routes.get);
app.use(routes.post);
app.use(routes.put);

app.get('/loaderio-39fdac933c692400423429dbc36c135b', (req, res) =>
  res.send('loaderio-39fdac933c692400423429dbc36c135b')
);

if (HTTP_PORT) {
  http.createServer(app).listen(HTTP_PORT);
}

if (HTTPS_PORT) {
  https.createServer({
    key: fs.readFileSync(HTTPS_KEY),
    cert: fs.readFileSync(HTTPS_CERT),
  }, app).listen(HTTPS_PORT);
}

module.exports = app;
