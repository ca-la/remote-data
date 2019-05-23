import anyTest, { TestInterface } from 'ava';
import { none } from 'fp-ts/lib/Option';
import { setoidNumber } from 'fp-ts/lib/Setoid';
import { TestContext } from './fixtures';

import {
  failure,
  initial,
  pending,
  refresh,
  success,
  RemoteData
} from '../remote-data';
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

test('caseOf', t => {
  const { failureRD } = t.context;
  const caseMap = {
    initial: 1,
    pending: 2,
    failure: () => 3,
    refresh: () => 4,
    success: () => 5
  };

  t.is(
    failureRD.caseOf(caseMap),
    failureRD.fold(
      caseMap.initial,
      caseMap.pending,
      caseMap.failure,
      caseMap.refresh,
      caseMap.success
    )
  );
});

test('getOrElse', t => {
  const { pendingRD } = t.context;

  t.is(pendingRD.getOrElse(0), 0);
});

test('getOrElseL', t => {
  const { pendingRD } = t.context;

  t.is(pendingRD.getOrElseL(() => 0), 0);
});

test('fold', t => {
  const { pendingRD } = t.context;

  t.is(pendingRD.fold(1, 2, () => 3, () => 4, () => 5), 2);
});

test('foldL', t => {
  const { pendingRD } = t.context;

  t.is(pendingRD.foldL(() => 1, () => 2, () => 3, () => 4, () => 5), 2);
});

test('altL', t => {
  const { initialRD, pendingRD, failureRD, successRD, refreshRD } = t.context;
  t.is(pendingRD.altL(() => pendingRD), pendingRD);
  t.is(pendingRD.altL(() => initialRD), initialRD);
  t.is(pendingRD.altL(() => failureRD), failureRD);
  t.is(pendingRD.altL(() => refreshRD), refreshRD);
  t.is(pendingRD.altL(() => successRD), successRD);
});

test('mapLeft', t => {
  const { pendingRD } = t.context;
  const f2 = () => 1;

  t.deepEqual(pendingRD.mapLeft(f2), pending);
});

test('type helpers', t => {
  const { pendingRD } = t.context;
  const is = (rd: RemoteData<{}, {}>) => [
    rd.isInitial(),
    rd.isPending(),
    rd.isFailure(),
    rd.isRefresh(),
    rd.isSuccess()
  ];

  t.deepEqual(is(pendingRD), [false, true, false, false, false]);
});

test('toOption', t => {
  const { pendingRD } = t.context;

  t.is(pendingRD.toOption(), none);
});

test('toNullable', t => {
  const { pendingRD } = t.context;

  t.is(pendingRD.toNullable(), null);
});

test('toString', t => {
  const { pendingRD } = t.context;

  t.is(pendingRD.toString(), 'pending');
});

test('contains', t => {
  const { pendingRD } = t.context;

  t.false(pendingRD.contains(setoidNumber, 1));
});

test('exists', t => {
  const { pendingRD } = t.context;
  const p = (n: number) => n === 1;

  t.false(pendingRD.exists(p));
});
