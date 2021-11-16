const compression = require('compression');
const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');

dotenv.config();

const {
  HTTP_PORT,
  HTTPS_PORT,
  HTTPS_KEY,
  HTTPS_CERT
} = process.env;

const app = express();
app.use(compression());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello world');
});

if (HTTP_PORT) {
  http.createServer(app).listen(HTTP_PORT);
}

if (HTTPS_PORT) {
  https.createServer({
    key: fs.readFileSync(HTTPS_KEY),
    cert: fs.readFileSync(HTTPS_CERT)
  }, app).listen(HTTPS_PORT);
}

module.exports = app;
