import anyTest, { TestInterface } from 'ava';
import { none, some } from 'fp-ts/lib/Option';
import { setoidNumber } from 'fp-ts/lib/Setoid';
import { TestContext } from './fixtures';

import { failure, initial, pending, refresh, success, RemoteData } from '../remote-data';
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
  const { failureRD } = t.context;

  t.is(failureRD.getOrElse(0), 0);
});

test('getOrElseL', t => {
  const { failureRD } = t.context;

  t.is(failureRD.getOrElseL(() => 0), 0);
});

test('fold', t => {
  const { failureRD } = t.context;

  t.is(failureRD.fold(1, 2, () => 3, () => 4, () => 5), 3);
});

test('foldL', t => {
  const { failureRD } = t.context;

  t.is(failureRD.foldL(() => 1, () => 2, () => 3, () => 4, () => 5), 3);
});

test('altL', t => {
  const { failureRD, pendingRD, initialRD, successRD, refreshRD } = t.context;
  t.is(failureRD.altL(() => pendingRD), pendingRD);
  t.is(failureRD.altL(() => initialRD), initialRD);
  t.is(failureRD.altL(() => failureRD), failureRD);
  t.is(failureRD.altL(() => refreshRD), refreshRD);
  t.is(failureRD.altL(() => successRD), successRD);
});

test('mapLeft', t => {
  const { failureRD } = t.context;
  const f2 = () => 1;

  t.deepEqual(failureRD.mapLeft(f2), failure(1));
});

test('recover', t => {
  const f = (error: string) => (error === 'Not authorized' ? some(401) : none);

  t.deepEqual(failure('Not authorized').recover(f), success(401));
  t.deepEqual(failure('Not found').recover(f), failure('Not found'));
});

test('type helpers', t => {
  const { failureRD } = t.context;
  const is = (rd: RemoteData<{}, {}>) => [
    rd.isInitial(),
    rd.isPending(),
    rd.isFailure(),
    rd.isRefresh(),
    rd.isSuccess()
  ];

  t.deepEqual(is(failureRD), [false, false, true, false, false]);
});

test('toOption', t => {
  const { failureRD } = t.context;

  t.is(failureRD.toOption(), none);
});

test('toNullable', t => {
  const { failureRD } = t.context;

  t.is(failureRD.toNullable(), null);
});

test('toString', t => {
  const { failureRD } = t.context;

  t.is(failureRD.toString(), 'failure("foo")');
});

test('contains', t => {
  const { failureRD } = t.context;

  t.false(failureRD.contains(setoidNumber, 1));
});

test('exists', t => {
  const { failureRD } = t.context;
  const p = (n: number) => n === 1;

  t.false(failureRD.exists(p));
});
