/* eslint import/no-unresolved: 0 */
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 5000,
  duration: '30s',
};

export default function loadTest() {
  http.get(`http://localhost:8080/questions?product_id=1&count=${Number.MAX_SAFE_INTEGER}`);
  sleep(1);
}
