import anyTest, { TestInterface } from 'ava';
import { some } from 'fp-ts/lib/Option';
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
  const { successRD } = t.context;
  const caseMap = {
    initial: 1,
    pending: 2,
    failure: () => 3,
    refresh: () => 4,
    success: () => 5
  };

  t.is(
    successRD.caseOf(caseMap),
    successRD.fold(
      caseMap.initial,
      caseMap.pending,
      caseMap.failure,
      caseMap.refresh,
      caseMap.success
    )
  );
});

test('getOrElse', t => {
  const { successRD } = t.context;

  t.is(successRD.getOrElse(0), 1);
});

test('getOrElseL', t => {
  const { successRD } = t.context;

  t.is(successRD.getOrElseL(() => 0), 1);
});

test('fold', t => {
  const { successRD } = t.context;

  t.is(successRD.fold(1, 2, () => 3, () => 4, () => 5), 5);
});

test('foldL', t => {
  const { successRD } = t.context;

  t.is(successRD.foldL(() => 1, () => 2, () => 3, () => 4, () => 5), 5);
});

test('altL', t => {
  const { failureRD, pendingRD, initialRD, successRD, refreshRD } = t.context;
  t.is(successRD.altL(() => pendingRD), successRD);
  t.is(successRD.altL(() => initialRD), successRD);
  t.is(successRD.altL(() => failureRD), successRD);
  t.is(successRD.altL(() => refreshRD), refreshRD);
  t.is(successRD.altL(() => successRD), successRD);
});

test('mapLeft', t => {
  const { successRD } = t.context;
  const f2 = () => 1;

  t.deepEqual(successRD.mapLeft(f2), success(1));
});

test('type helpers', t => {
  const { successRD } = t.context;
  const is = (rd: RemoteData<{}, {}>) => [
    rd.isInitial(),
    rd.isPending(),
    rd.isFailure(),
    rd.isRefresh(),
    rd.isSuccess()
  ];

  t.deepEqual(is(successRD), [false, false, false, false, true]);
});

test('toOption', t => {
  const { successRD } = t.context;

  t.deepEqual(successRD.toOption(), some(1));
});

test('toNullable', t => {
  const { successRD } = t.context;

  t.is(successRD.toNullable(), 1);
});

test('toString', t => {
  const { successRD } = t.context;

  t.is(successRD.toString(), 'success(1)');
});

test('contains', t => {
  const { successRD } = t.context;

  t.false(successRD.contains(setoidNumber, 2));
  t.true(successRD.contains(setoidNumber, 1));
});

test('exists', t => {
  const p = (n: number) => n === 1;

  t.false(success(2).exists(p));
  t.true(success(1).exists(p));
});
