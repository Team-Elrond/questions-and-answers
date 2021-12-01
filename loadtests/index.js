import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 1000, // x RPS, since timeUnit is the default 1s
      duration: '30s',
      preAllocatedVUs: 1000,
      maxVUs: 1000,
    },
  },
};

export default function test(pathFunc) {
  const offset = __ITER * 1000 + __VU;
  const res = http.get(`http://${__ENV.ENDPOINT}/${pathFunc(offset)}count=10000`);
  check(res, { success: r => r.status === 200 });
  sleep(1);
}
