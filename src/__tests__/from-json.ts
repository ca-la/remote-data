import test from 'ava';

import {
  fromJSON,
  failure,
  initial,
  pending,
  refresh,
  success
} from '../remote-data';

test('initial', t => {
  t.deepEqual(
    fromJSON({ _URI: '@cala/remote-data', _tag: 'RemoteInitial' }),
    initial
  );
});

test('pending', t => {
  t.deepEqual(
    fromJSON({ _URI: '@cala/remote-data', _tag: 'RemotePending' }),
    pending
  );
});

test('failure', t => {
  t.deepEqual(
    fromJSON({
      _URI: '@cala/remote-data',
      _tag: 'RemoteFailure',
      error: 'foo'
    }),
    failure('foo')
  );
});

test('refresh', t => {
  t.deepEqual(
    fromJSON({
      _URI: '@cala/remote-data',
      _tag: 'RemoteRefresh',
      value: -1
    }),
    refresh(-1)
  );
});

test('success', t => {
  t.deepEqual(
    fromJSON({ _URI: '@cala/remote-data', _tag: 'RemoteSuccess', value: 1 }),
    success(1)
  );
});
