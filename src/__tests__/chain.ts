import anyTest, { TestInterface } from 'ava';
import { TestContext } from './fixtures';

import { pending, failure, success, refresh, initial } from '../remote-data';

const test = anyTest as TestInterface<TestContext>;

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
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(initialRD.chain(() => initialRD), initialRD);
  t.is(initialRD.chain(() => pendingRD), initialRD);
  t.is(initialRD.chain(() => failureRD), initialRD);
  t.is(initialRD.chain(() => refreshRD), initialRD);
  t.is(initialRD.chain(() => successRD), initialRD);
});

test('pending', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(pendingRD.chain(() => initialRD), pendingRD);
  t.is(pendingRD.chain(() => pendingRD), pendingRD);
  t.is(pendingRD.chain(() => failureRD), pendingRD);
  t.is(pendingRD.chain(() => refreshRD), pendingRD);
  t.is(pendingRD.chain(() => successRD), pendingRD);
});

test('failure', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(failureRD.chain(() => initialRD), failureRD);
  t.is(failureRD.chain(() => pendingRD), failureRD);
  t.is(failureRD.chain(() => failureRD), failureRD);
  t.is(failureRD.chain(() => refreshRD), failureRD);
  t.is(failureRD.chain(() => successRD), failureRD);
});

test('refresh', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(refreshRD.chain(() => initialRD), initialRD);
  t.is(refreshRD.chain(() => pendingRD), pendingRD);
  t.is(refreshRD.chain(() => failureRD), failureRD);
  t.is(refreshRD.chain(() => refreshRD), refreshRD);
  t.is(refreshRD.chain(() => successRD), successRD);
});

test('success', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(successRD.chain(() => initialRD), initialRD);
  t.is(successRD.chain(() => pendingRD), pendingRD);
  t.is(successRD.chain(() => failureRD), failureRD);
  t.is(successRD.chain(() => refreshRD), refreshRD);
  t.is(successRD.chain(() => successRD), successRD);
});
