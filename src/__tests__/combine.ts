import test from 'ava';

import { combine, pending, failure, success, refresh, initial } from '../remote-data';

test('initial', t => {
  t.is(combine(initial, initial), initial);
});

test('pending', t => {
  t.is(combine(pending, pending), pending);
});

test('failure', t => {
  t.deepEqual(combine(failure('foo'), failure('bar')), failure('foo'));
});

test('refresh', t => {
  const stringPair: [string, string] = ['foo', 'bar'];
  t.deepEqual(combine(refresh('foo'), refresh('bar')), refresh(stringPair));
});

test('success', t => {
  const stringPair: [string, string] = ['foo', 'bar'];
  t.deepEqual(combine(success('foo'), success('bar')), success(stringPair));
});

test('combines arbitrary values to first initial', t => {
  const values = [success(123), success('foo'), failure('bar'), pending, initial];
  t.is(combine.apply(null, values), initial);
  t.is(combine.apply(null, values.reverse()), initial);
});

test('combines arbitrary values to first pending', t => {
  const values = [success(123), success('foo'), failure('bar'), pending];
  t.is(combine.apply(null, values), pending);
  t.is(combine.apply(null, values.reverse()), pending);
});

test('combines arbitrary values to first failure', t => {
  const values = [success(123), refresh(321), success('foo'), failure('bar')];
  t.deepEqual(combine.apply(null, values), failure('bar'));
  t.deepEqual(combine.apply(null, values.reverse()), failure('bar'));
});
