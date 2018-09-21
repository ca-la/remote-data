import anyTest, { TestInterface } from 'ava';
import { TestContext } from './fixtures';

import { pending, failure, success, refresh, initial, getOrd } from '../remote-data';
import { ordString, ordNumber } from 'fp-ts/lib/Ord';

const test = anyTest as TestInterface<TestContext>;
const compare = getOrd(ordString, ordNumber).compare;

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

  t.is(compare(initialRD, initialRD), 0);
  t.is(compare(initialRD, pendingRD), -1);
  t.is(compare(initialRD, failureRD), -1);
  t.is(compare(initialRD, refreshRD), -1);
  t.is(compare(initialRD, successRD), -1);
});

test('pending', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(compare(pendingRD, initialRD), 1);
  t.is(compare(pendingRD, pendingRD), 0);
  t.is(compare(pendingRD, failureRD), -1);
  t.is(compare(pendingRD, refreshRD), -1);
  t.is(compare(pendingRD, successRD), -1);
});

test('failure', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(compare(failureRD, initialRD), 1);
  t.is(compare(failureRD, pendingRD), 1);
  t.is(compare(failureRD, failureRD), 0);
  t.is(compare(failureRD, refreshRD), -1);
  t.is(compare(failureRD, successRD), -1);
  t.is(compare(failure('1'), failure('2')), -1);
  t.is(compare(failure('2'), failure('1')), 1);
});

test('refresh', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(compare(refreshRD, initialRD), 1);
  t.is(compare(refreshRD, pendingRD), 1);
  t.is(compare(refreshRD, failureRD), 1);
  t.is(compare(refreshRD, refreshRD), 0);
  t.is(compare(refreshRD, successRD), -1);
  t.is(compare(refresh(1), refresh(2)), -1);
  t.is(compare(refresh(2), refresh(1)), 1);
});

test('success', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(compare(successRD, initialRD), 1);
  t.is(compare(successRD, pendingRD), 1);
  t.is(compare(successRD, failureRD), 1);
  t.is(compare(successRD, refreshRD), 1);
  t.is(compare(successRD, successRD), 0);
  t.is(compare(success(1), success(2)), -1);
  t.is(compare(success(2), success(1)), 1);
});
