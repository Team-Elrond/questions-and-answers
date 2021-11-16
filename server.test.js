const request = require('supertest');
const app = require('./app');

it('sends "Hello world"', () => request(app)
  .get('/')
  .expect('Content-Type', /text\/html/)
  .expect(200)
  .then(res => expect(res.text).toBe('Hello world'))
);
