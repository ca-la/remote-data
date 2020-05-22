import anyTest, { TestInterface } from "ava";
import { semigroupString, semigroupSum } from "fp-ts/lib/Semigroup";

import { TestContext } from "./fixtures";

import {
  pending,
  failure,
  success,
  refresh,
  initial,
  getSemigroup,
} from "../remote-data";

const test = anyTest as TestInterface<TestContext>;
const concat = getSemigroup(semigroupString, semigroupSum).concat;

test.beforeEach((t) => {
  t.context = {
    initialRD: initial,
    pendingRD: pending,
    refreshRD: refresh(-1),
    successRD: success(1),
    failureRD: failure("foo"),
  };
});

test("initial", (t) => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(concat(initialRD, initialRD), initialRD);
  t.is(concat(initialRD, pendingRD), pendingRD);
  t.is(concat(initialRD, failureRD), failureRD);
  t.is(concat(initialRD, refreshRD), refreshRD);
  t.is(concat(initialRD, successRD), successRD);
});

test("pending", (t) => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(concat(pendingRD, initialRD), pendingRD);
  t.is(concat(pendingRD, pendingRD), pendingRD);
  t.is(concat(pendingRD, failureRD), failureRD);
  t.is(concat(pendingRD, refreshRD), refreshRD);
  t.is(concat(pendingRD, successRD), successRD);
});

test("failure", (t) => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(concat(failureRD, initialRD), failureRD);
  t.is(concat(failureRD, pendingRD), failureRD);
  t.deepEqual(
    concat(failure("foo"), failure("bar")),
    failure(semigroupString.concat("foo", "bar"))
  );
  t.is(concat(failureRD, refreshRD), refreshRD);
  t.is(concat(failureRD, successRD), successRD);
});

test("refresh", (t) => {
  const { initialRD, pendingRD, failureRD, refreshRD } = t.context;

  t.is(concat(refreshRD, initialRD), refreshRD);
  t.is(concat(refreshRD, pendingRD), refreshRD);
  t.is(concat(refreshRD, failureRD), refreshRD);
  t.deepEqual(
    concat(refresh(1), refresh(1)),
    refresh(semigroupSum.concat(1, 1))
  );
  t.deepEqual(
    concat(refresh(1), success(1)),
    refresh(semigroupSum.concat(1, 1))
  );
});

test("success", (t) => {
  const { initialRD, pendingRD, failureRD, successRD } = t.context;

  t.is(concat(successRD, initialRD), successRD);
  t.is(concat(successRD, pendingRD), successRD);
  t.is(concat(successRD, failureRD), successRD);
  t.deepEqual(
    concat(success(1), refresh(1)),
    refresh(semigroupSum.concat(1, 1))
  );
  t.deepEqual(
    concat(success(1), success(1)),
    success(semigroupSum.concat(1, 1))
  );
});
