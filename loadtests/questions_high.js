import { check } from 'k6';
import http from 'k6/http';

let product = 1000011;

export default function spec() {
  const res = http.get(`http://${__ENV.ENDPOINT}/qa/questions?product_id=${product}&count=10000`);
  check(res, { success: r => r.status === 200 });
  product -= 1;
}
