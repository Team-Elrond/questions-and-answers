import { check } from 'k6';
import http from 'k6/http';

let question = 3518956;

export default function spec() {
  const res = http.get(`http://${__ENV.ENDPOINT}/qa/questions/${question}/answers?count=10000`);
  check(res, { success: r => r.status === 200 });
  question -= 1;
}
