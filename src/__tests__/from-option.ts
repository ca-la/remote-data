import test from 'ava';
import { none, some } from 'fp-ts/lib/Option';

import { fromOption, failure, success } from '../remote-data';

const error = new Error('foo');

test('none', t => {
  t.deepEqual(fromOption(none, () => error), failure(error));
});

test('some', t => {
  t.deepEqual(fromOption(some(123), () => error), success(123));
});
