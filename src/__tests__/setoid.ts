import anyTest, { TestInterface } from 'ava';
import { TestContext } from './fixtures';

import { pending, failure, success, refresh, initial, getSetoid } from '../remote-data';
import { setoidString, setoidNumber } from 'fp-ts/lib/Setoid';

const test = anyTest as TestInterface<TestContext>;
const equals = getSetoid(setoidString, setoidNumber).equals;

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

  t.is(equals(initialRD, initialRD), true);
  t.is(equals(initialRD, pendingRD), false);
  t.is(equals(initialRD, failureRD), false);
  t.is(equals(initialRD, refreshRD), false);
  t.is(equals(initialRD, successRD), false);
});

test('pending', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(equals(pendingRD, initialRD), false);
  t.is(equals(pendingRD, pendingRD), true);
  t.is(equals(pendingRD, failureRD), false);
  t.is(equals(pendingRD, refreshRD), false);
  t.is(equals(pendingRD, successRD), false);
});

test('failure', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(equals(failureRD, initialRD), false);
  t.is(equals(failureRD, pendingRD), false);
  t.is(equals(failureRD, failureRD), true);
  t.is(equals(failure('1'), failure('2')), false);
  t.is(equals(failureRD, refreshRD), false);
  t.is(equals(failureRD, successRD), false);
});

test('refresh', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(equals(refreshRD, initialRD), false);
  t.is(equals(refreshRD, pendingRD), false);
  t.is(equals(refreshRD, failureRD), false);
  t.is(equals(refreshRD, successRD), false);
  t.is(equals(refreshRD, refreshRD), true);
  t.is(equals(refresh(1), refresh(2)), false);
});

test('success', t => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(equals(successRD, initialRD), false);
  t.is(equals(successRD, pendingRD), false);
  t.is(equals(successRD, failureRD), false);
  t.is(equals(successRD, refreshRD), false);
  t.is(equals(successRD, successRD), true);
  t.is(equals(success(1), success(2)), false);
});
