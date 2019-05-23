import test from 'ava';
import { identity, compose } from 'fp-ts/lib/function';

import {
  pending,
  failure,
  success,
  refresh,
  RemoteData,
  initial
} from '../remote-data';

const double = (x: number) => x * 2;
const quad = compose(
  double,
  double
);

test('maps over value', t => {
  t.is(initial.map(double), initial);
  t.is(pending.map(double), pending);
  const failed = failure<string, number>('foo');
  t.is(failed.map(double), failed);

  const value = 123;
  const refreshing = refresh(value);
  const refreshedResult = refreshing.map(double);
  t.deepEqual(refreshedResult, refresh(value * 2));

  const succeeded = success(value);
  const successResult = succeeded.map(double);
  t.deepEqual(successResult, success(value * 2));
});

test('obeys Functor laws: identity', t => {
  t.is(initial.map(identity), initial);
  t.is(pending.map(identity), pending);

  const failed = failure('foo');
  t.is(failed.map(identity), failed);

  const refreshing = refresh('foo');
  const refreshingResult = refreshing.map(identity);
  t.deepEqual(refreshingResult, refreshing);
  t.not(refreshingResult, refreshing);

  const succeeded = success('foo');
  const successResult = succeeded.map(identity);
  t.deepEqual(successResult, succeeded);
  t.not(successResult, succeeded);
});

test('obeys Functor laws: composition', t => {
  t.is(initial.map(quad), initial.map(double).map(double));
  t.is(pending.map(quad), pending.map(double).map(double));

  const failed: RemoteData<string, number> = failure('foo');
  t.is(failed.map(quad), failed.map(double).map(double));

  const refreshing = refresh(1);
  t.deepEqual(refreshing.map(quad), refreshing.map(double).map(double));

  const succeeded = success(1);
  t.deepEqual(succeeded.map(quad), succeeded.map(double).map(double));
});
