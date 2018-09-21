import test from 'ava';
import { monoidString, monoidSum } from 'fp-ts/lib/Monoid';

import { initial, getMonoid } from '../remote-data';

test('empty', t => {
  const empty = getMonoid(monoidString, monoidSum).empty;
  t.is(empty, initial);
});
