import anyTest, { TestInterface } from 'ava';
import { compose } from 'fp-ts/lib/function';
import { TestContext } from './fixtures';

import {
  pending,
  failure,
  success,
  refresh,
  RemoteData,
  initial
} from '../remote-data';

const test = anyTest as TestInterface<TestContext>;
const double = (x: number) => x * 2;
const quad = compose(
  double,
  double
);
const f: RemoteData<string, (a: number) => number> = success(double);
const r: RemoteData<string, (a: number) => number> = refresh(quad);
const failedF: RemoteData<string, (a: number) => number> = failure('foo');

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

  t.is(initialRD.ap(initial), initialRD);
  t.is(initialRD.ap(pending), initialRD);
  t.is(initialRD.ap(failedF), initialRD);
  t.is(initialRD.ap(r), initialRD);
  t.is(initialRD.ap(f), initialRD);
});

test('pending', t => {
  const { initialRD, pendingRD } = t.context;

  t.is(pendingRD.ap(initial), initialRD);
  t.is(pendingRD.ap(pending), pendingRD);
  t.is(pendingRD.ap(failedF), pendingRD);
  t.is(pendingRD.ap(r), pendingRD);
  t.is(pendingRD.ap(f), pendingRD);
});

test('failure', t => {
  const { initialRD, pendingRD, failureRD } = t.context;

  t.is(failureRD.ap(initial), initialRD);
  t.is(failureRD.ap(pending), pendingRD);
  t.is(failureRD.ap(failedF) as any, failedF);
  t.is(failureRD.ap(r), failureRD);
  t.is(failureRD.ap(f), failureRD);
});

test('refresh', t => {
  const { initialRD, pendingRD, refreshRD } = t.context;

  t.is(refreshRD.ap(initial), initialRD);
  t.is(refreshRD.ap(pending), pendingRD);
  t.is(refreshRD.ap(failedF) as any, failedF);
  t.deepEqual(refreshRD.ap(r), refresh(quad(-1)));
  t.deepEqual(refreshRD.ap(f), refresh(double(-1)));
});

test('success', t => {
  const { initialRD, pendingRD, successRD } = t.context;

  t.is(successRD.ap(initial), initialRD);
  t.is(successRD.ap(pending), pendingRD);
  t.is(successRD.ap(failedF) as any, failedF);
  t.deepEqual(successRD.ap(r), refresh(quad(1)));
  t.deepEqual(successRD.ap(f), success(double(1)));
});
