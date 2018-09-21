import test from 'ava';

import { fromPredicate, failure, success } from '../remote-data';

const factory = fromPredicate((value: boolean) => value, () => '123');

test('none', t => {
  t.deepEqual(factory(false), failure('123'));
});

test('some', t => {
  t.deepEqual(factory(true), success(true));
});
