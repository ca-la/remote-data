import anyTest, { TestInterface } from "ava";
import { TestContext } from "./fixtures";

import { pending, failure, success, refresh, initial } from "../remote-data";

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

test("initial", (t) => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(initialRD.alt(initialRD), initialRD);
  t.is(initialRD.alt(pendingRD), pendingRD);
  t.is(initialRD.alt(failureRD), failureRD);
  t.is(initialRD.alt(refreshRD), refreshRD);
  t.is(initialRD.alt(successRD), successRD);
});

test("pending", (t) => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(pendingRD.alt(initialRD), initialRD);
  t.is(pendingRD.alt(pendingRD), pendingRD);
  t.is(pendingRD.alt(failureRD), failureRD);
  t.is(pendingRD.alt(refreshRD), refreshRD);
  t.is(pendingRD.alt(successRD), successRD);
});

test("failure", (t) => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(failureRD.alt(pendingRD), pendingRD);
  t.is(failureRD.alt(initialRD), initialRD);
  t.is(failureRD.alt(failureRD), failureRD);
  t.is(failureRD.alt(refreshRD), refreshRD);
  t.is(failureRD.alt(successRD), successRD);
});

test("refresh", (t) => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(refreshRD.alt(pendingRD), refreshRD);
  t.is(refreshRD.alt(initialRD), refreshRD);
  t.is(refreshRD.alt(failureRD), refreshRD);
  t.is(refreshRD.alt(refreshRD), refreshRD);
  t.is(refreshRD.alt(successRD), successRD);
});

test("success", (t) => {
  const { initialRD, pendingRD, failureRD, refreshRD, successRD } = t.context;

  t.is(successRD.alt(pendingRD), successRD);
  t.is(successRD.alt(initialRD), successRD);
  t.is(successRD.alt(failureRD), successRD);
  t.is(successRD.alt(refreshRD), refreshRD);
  t.is(successRD.alt(successRD), successRD);
});
