import test from 'ava';

import { fromJSON, failure, initial, pending, refresh, success } from '../remote-data';

test('initial', t => {
  t.deepEqual(fromJSON(initial.toJSON()), initial);
});

test('pending', t => {
  t.deepEqual(fromJSON(pending.toJSON()), pending);
});

test('failure', t => {
  t.deepEqual(fromJSON(failure('foo').toJSON()), failure('foo'));
});

test('refresh', t => {
  t.deepEqual(fromJSON(refresh(-1).toJSON()), refresh(-1));
});

test('success', t => {
  t.deepEqual(fromJSON(success(1).toJSON()), success(1));
});
