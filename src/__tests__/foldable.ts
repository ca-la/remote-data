import anyTest, { TestInterface } from 'ava';
import { TestContext } from './fixtures';

import { pending, failure, success, refresh, initial } from '../remote-data';

const test = anyTest as TestInterface<TestContext>;
const f = (a: number, b: number) => a + b;

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
  const { initialRD } = t.context;

  t.is(initialRD.reduce(f, 1), 1);
});

test('pending', t => {
  const { pendingRD } = t.context;

  t.is(pendingRD.reduce(f, 1), 1);
});

test('failure', t => {
  const { failureRD } = t.context;

  t.is(failureRD.reduce(f, 1), 1);
});

test('refresh', t => {
  t.is(refresh(1).reduce(f, 1), 2);
});

test('success', t => {
  t.is(success(1).reduce(f, 1), 2);
});
