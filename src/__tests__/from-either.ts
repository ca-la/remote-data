import test from 'ava';
import { left, right } from 'fp-ts/lib/Either';

import { fromEither, failure, success } from '../remote-data';

const error = new Error('foo');

test('none', t => {
  t.deepEqual(fromEither(left(error)), failure(error));
});

test('some', t => {
  t.deepEqual(fromEither(right(123)), success(123));
});
