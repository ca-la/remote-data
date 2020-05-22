import test from "ava";

import { initial, remoteData } from "../remote-data";

test("zero", (t) => {
  t.is(remoteData.zero(), initial);
});
