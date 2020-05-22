import test from "ava";

import { failure, initial, pending, refresh, success } from "../remote-data";

test("initial", (t) => {
  t.deepEqual(initial.toJSON(), {
    _URI: "@cala/remote-data",
    _tag: "RemoteInitial",
  });
});

test("pending", (t) => {
  t.deepEqual(pending.toJSON(), {
    _URI: "@cala/remote-data",
    _tag: "RemotePending",
  });
});

test("failure", (t) => {
  t.deepEqual(failure("foo").toJSON(), {
    _URI: "@cala/remote-data",
    _tag: "RemoteFailure",
    error: "foo",
  });
});

test("refresh", (t) => {
  t.deepEqual(refresh(-1).toJSON(), {
    _URI: "@cala/remote-data",
    _tag: "RemoteRefresh",
    value: -1,
  });
});

test("success", (t) => {
  t.deepEqual(success(1).toJSON(), {
    _URI: "@cala/remote-data",
    _tag: "RemoteSuccess",
    value: 1,
  });
});
