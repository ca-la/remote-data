import anyTest, { TestInterface } from "ava";
import { some } from "fp-ts/lib/Option";
import { setoidNumber } from "fp-ts/lib/Setoid";
import { TestContext } from "./fixtures";

import {
  failure,
  initial,
  pending,
  refresh,
  success,
  RemoteData,
} from "../remote-data";
const test = anyTest as TestInterface<TestContext>;

test.beforeEach((t) => {
  t.context = {
    initialRD: initial,
    pendingRD: pending,
    refreshRD: refresh(-1),
    successRD: success(1),
    failureRD: failure("foo"),
  };
});

test("caseOf", (t) => {
  const { refreshRD } = t.context;
  const caseMap = {
    initial: 1,
    pending: 2,
    failure: () => 3,
    refresh: () => 4,
    success: () => 5,
  };

  t.is(
    refreshRD.caseOf(caseMap),
    refreshRD.fold(
      caseMap.initial,
      caseMap.pending,
      caseMap.failure,
      caseMap.refresh,
      caseMap.success
    )
  );
  t.is(refreshRD.caseOf(caseMap), 4);
});

test("wedgeCaseOf", (t) => {
  const { refreshRD } = t.context;
  const wedgeCaseMap = {
    none: 1,
    failure: () => 2,
    some: () => 3,
  };

  t.is(
    refreshRD.wedgeCaseOf(wedgeCaseMap),
    refreshRD.fold(
      wedgeCaseMap.none,
      wedgeCaseMap.none,
      wedgeCaseMap.failure,
      wedgeCaseMap.some,
      wedgeCaseMap.some
    )
  );

  t.is(refreshRD.wedgeCaseOf(wedgeCaseMap), 3);
});

test("getOrElse", (t) => {
  const { refreshRD } = t.context;

  t.is(refreshRD.getOrElse(0), -1);
});

test("getOrElseL", (t) => {
  const { refreshRD } = t.context;

  t.is(
    refreshRD.getOrElseL(() => 0),
    -1
  );
});

test("fold", (t) => {
  const { refreshRD } = t.context;

  t.is(
    refreshRD.fold(
      1,
      2,
      () => 3,
      () => 4,
      () => 5
    ),
    4
  );
});

test("foldL", (t) => {
  const { refreshRD } = t.context;

  t.is(
    refreshRD.foldL(
      () => 1,
      () => 2,
      () => 3,
      () => 4,
      () => 5
    ),
    4
  );
});

test("altL", (t) => {
  const { failureRD, pendingRD, initialRD, successRD, refreshRD } = t.context;
  t.is(
    refreshRD.altL(() => pendingRD),
    refreshRD
  );
  t.is(
    refreshRD.altL(() => initialRD),
    refreshRD
  );
  t.is(
    refreshRD.altL(() => failureRD),
    refreshRD
  );
  t.is(
    refreshRD.altL(() => refreshRD),
    refreshRD
  );
  t.is(
    refreshRD.altL(() => successRD),
    successRD
  );
});

test("mapLeft", (t) => {
  const { refreshRD } = t.context;
  const f2 = () => 1;

  t.deepEqual(refreshRD.mapLeft(f2), refresh(-1));
});

test("type helpers", (t) => {
  const { refreshRD } = t.context;
  const is = (rd: RemoteData<{}, {}>) => [
    rd.isInitial(),
    rd.isPending(),
    rd.isFailure(),
    rd.isRefresh(),
    rd.isSuccess(),
  ];

  t.deepEqual(is(refreshRD), [false, false, false, true, false]);
});

test("toOption", (t) => {
  const { refreshRD } = t.context;

  t.deepEqual(refreshRD.toOption(), some(-1));
});

test("toNullable", (t) => {
  const { refreshRD } = t.context;

  t.is(refreshRD.toNullable(), -1);
});

test("toString", (t) => {
  const { refreshRD } = t.context;

  t.is(refreshRD.toString(), "refresh(-1)");
});

test("contains", (t) => {
  const { refreshRD } = t.context;

  t.false(refreshRD.contains(setoidNumber, 1));
  t.true(refreshRD.contains(setoidNumber, -1));
});

test("exists", (t) => {
  const { refreshRD } = t.context;
  const p = (n: number) => n === 1;

  t.false(refreshRD.exists(p));
  t.true(refresh(1).exists(p));
});
