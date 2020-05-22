import anyTest, { TestInterface } from "ava";
import { TestContext } from "./fixtures";

import { pending, failure, success, refresh, initial } from "../remote-data";

const test = anyTest as TestInterface<TestContext>;
const f = () => 1;

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
  const { initialRD } = t.context;

  t.is(initialRD.extend(f), initialRD);
});

test("pending", (t) => {
  const { pendingRD } = t.context;

  t.is(pendingRD.extend(f), pendingRD);
});

test("failure", (t) => {
  const { failureRD } = t.context;

  t.is(failureRD.extend(f), failureRD);
});

test("refresh", (t) => {
  const { refreshRD } = t.context;

  t.deepEqual(refreshRD.extend(f), refresh(1));
});

test("success", (t) => {
  const { successRD } = t.context;

  t.deepEqual(successRD.extend(f), success(1));
});
