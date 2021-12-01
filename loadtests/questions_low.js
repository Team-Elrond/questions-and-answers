import test from './index.js';

export { options } from './index.js';

export default function spec() {
  test(offset => `qa/questions?product_id=${offset}&`);
}
