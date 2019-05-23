import anyTest, { TestInterface } from 'ava';
import { TestContext } from './fixtures';
import { array } from 'fp-ts/lib/Array';
import { sequence } from 'fp-ts/lib/Traversable';

import {
  pending,
  failure,
  success,
  refresh,
  remoteData,
  initial
} from '../remote-data';

const test = anyTest as TestInterface<TestContext>;
const s = sequence(remoteData, array);

test.beforeEach(t => {
  t.context = {
    initialRD: initial,
    pendingRD: pending,
    refreshRD: refresh(-1),
    successRD: success(1),
    failureRD: failure('foo')
  };
});

test('initial', t => {
  const { initialRD, successRD, refreshRD } = t.context;

  t.is(s([initialRD, successRD, refreshRD]) as any, initialRD);
});

test('pending', t => {
  const { pendingRD, successRD, refreshRD } = t.context;

  t.is(s([pendingRD, successRD, refreshRD]) as any, pendingRD);
});

test('failure', t => {
  const { refreshRD, successRD, failureRD } = t.context;

  t.is(s([failureRD, successRD, refreshRD]) as any, failureRD);
});

test('refresh', t => {
  t.deepEqual(s([success(123), refresh(456)]), refresh([123, 456]));
});

test('success', t => {
  t.deepEqual(s([success(123), success(456)]), success([123, 456]));
});
