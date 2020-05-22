import anyTest, { TestInterface } from "ava";
import { option, some, none } from "fp-ts/lib/Option";
import { traverse } from "fp-ts/lib/Traversable";
import { TestContext } from "./fixtures";

import {
  pending,
  failure,
  success,
  refresh,
  initial,
  remoteData,
} from "../remote-data";

const test = anyTest as TestInterface<TestContext>;
const tOptionRemoteData = traverse(option, remoteData);
const f = (x: number) => (x >= 2 ? some(x) : none);

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

  t.deepEqual(tOptionRemoteData(initialRD, f), some(initialRD));
});

test("pending", (t) => {
  const { pendingRD } = t.context;

  t.deepEqual(tOptionRemoteData(pendingRD, f), some(pendingRD));
});

test("failure", (t) => {
  const { failureRD } = t.context;

  t.deepEqual(tOptionRemoteData(failureRD, f), some(failureRD));
});

test("refresh", (t) => {
  t.is(tOptionRemoteData(refresh(1), f), none);
  t.deepEqual(tOptionRemoteData(refresh(3), f), some(refresh(3)));
});

test("success", (t) => {
  t.is(tOptionRemoteData(success(1), f), none);
  t.deepEqual(tOptionRemoteData(success(3), f), some(success(3)));
});
