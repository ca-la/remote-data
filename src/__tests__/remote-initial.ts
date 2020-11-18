import anyTest, { TestInterface } from "ava";
import { none } from "fp-ts/lib/Option";
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
  const { initialRD } = t.context;
  const caseMap = {
    initial: 1,
    pending: 2,
    failure: () => 3,
    refresh: () => 4,
    success: () => 5,
  };

  t.is(
    initialRD.caseOf(caseMap),
    initialRD.fold(
      caseMap.initial,
      caseMap.pending,
      caseMap.failure,
      caseMap.refresh,
      caseMap.success
    )
  );
  t.is(initialRD.caseOf(caseMap), 1);
});

test("wedgeCaseOf", (t) => {
  const { initialRD } = t.context;
  const wedgeCaseMap = {
    none: 1,
    failure: () => 2,
    some: () => 3,
  };

  t.is(
    initialRD.wedgeCaseOf(wedgeCaseMap),
    initialRD.fold(
      wedgeCaseMap.none,
      wedgeCaseMap.none,
      wedgeCaseMap.failure,
      wedgeCaseMap.some,
      wedgeCaseMap.some
    )
  );

  t.is(initialRD.wedgeCaseOf(wedgeCaseMap), 1);
});

test("getOrElse", (t) => {
  const { initialRD } = t.context;

  t.is(initialRD.getOrElse(0), 0);
});

test("getOrElseL", (t) => {
  const { initialRD } = t.context;

  t.is(
    initialRD.getOrElseL(() => 0),
    0
  );
});

test("fold", (t) => {
  const { initialRD } = t.context;

  t.is(
    initialRD.fold(
      1,
      2,
      () => 3,
      () => 4,
      () => 5
    ),
    1
  );
});

test("foldL", (t) => {
  const { initialRD } = t.context;

  t.is(
    initialRD.foldL(
      () => 1,
      () => 2,
      () => 3,
      () => 4,
      () => 5
    ),
    1
  );
});

test("altL", (t) => {
  const { initialRD, pendingRD, failureRD, successRD, refreshRD } = t.context;
  t.is(
    initialRD.altL(() => pendingRD),
    pendingRD
  );
  t.is(
    initialRD.altL(() => initialRD),
    initialRD
  );
  t.is(
    initialRD.altL(() => failureRD),
    failureRD
  );
  t.is(
    initialRD.altL(() => refreshRD),
    refreshRD
  );
  t.is(
    initialRD.altL(() => successRD),
    successRD
  );
});

test("mapLeft", (t) => {
  const { initialRD } = t.context;
  const f2 = () => 1;

  t.deepEqual(initialRD.mapLeft(f2), initial);
});

test("type helpers", (t) => {
  const { initialRD } = t.context;
  const is = (rd: RemoteData<{}, {}>) => [
    rd.isInitial(),
    rd.isPending(),
    rd.isFailure(),
    rd.isRefresh(),
    rd.isSuccess(),
  ];

  t.deepEqual(is(initialRD), [true, false, false, false, false]);
});

test("toOption", (t) => {
  const { initialRD } = t.context;

  t.is(initialRD.toOption(), none);
});

test("toNullable", (t) => {
  const { initialRD } = t.context;

  t.is(initialRD.toNullable(), null);
});

test("toString", (t) => {
  const { initialRD } = t.context;

  t.is(initialRD.toString(), "initial");
});

test("contains", (t) => {
  const { initialRD } = t.context;

  t.false(initialRD.contains(setoidNumber, 1));
});

test("exists", (t) => {
  const { initialRD } = t.context;
  const p = (n: number) => n === 1;

  t.false(initialRD.exists(p));
});
