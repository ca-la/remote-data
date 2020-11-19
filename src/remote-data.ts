import {
  constFalse,
  Function2,
  Function1,
  Lazy,
  Predicate,
} from "fp-ts/lib/function";
import { Monad2 } from "fp-ts/lib/Monad";
import { Foldable2 } from "fp-ts/lib/Foldable";
import { Alt2 } from "fp-ts/lib/Alt";
import { Extend2 } from "fp-ts/lib/Extend";
import { sequence, Traversable2 } from "fp-ts/lib/Traversable";
import { isNone, Option } from "fp-ts/lib/Option";
import { Either, isLeft } from "fp-ts/lib/Either";
import { Setoid } from "fp-ts/lib/Setoid";

import { array } from "fp-ts/lib/Array";

import { HKT, HKT2, Type, Type2, URIS, URIS2 } from "fp-ts/lib/HKT";
import { Applicative } from "fp-ts/lib/Applicative";
import { Alternative2 } from "fp-ts/lib/Alternative";
import { Ord } from "fp-ts/lib/Ord";
import { sign } from "fp-ts/lib/Ordering";
import { Semigroup } from "fp-ts/lib/Semigroup";
import { Monoid } from "fp-ts/lib/Monoid";
import { Monoidal2 } from "fp-ts/lib/Monoidal";

import { RemoteInitial } from "./initial";
export { RemoteInitial } from "./initial";
import { RemoteFailure } from "./failure";
export { RemoteFailure } from "./failure";
import { RemoteRefresh } from "./refresh";
export { RemoteRefresh } from "./refresh";
import { RemoteSuccess } from "./success";
export { RemoteSuccess } from "./success";
import { RemotePending } from "./pending";
export { RemotePending } from "./pending";

export const URI = "@cala/remote-data";
export type URI = typeof URI;
declare module "fp-ts/lib/HKT" {
  interface URI2HKT2<L, A> {
    "@cala/remote-data": RemoteData<L, A>;
  }
}

type RemoteTag =
  | "RemoteInitial"
  | "RemotePending"
  | "RemoteFailure"
  | "RemoteRefresh"
  | "RemoteSuccess";

export type RemoteJSON<L, A> =
  | { _URI: URI; _tag: "RemoteInitial" }
  | { _URI: URI; _tag: "RemotePending" }
  | { _URI: URI; _tag: "RemoteFailure"; error: L }
  | { _URI: URI; _tag: "RemoteRefresh"; value: A }
  | { _URI: URI; _tag: "RemoteSuccess"; value: A };

export interface IRemoteData<L, A> {
  readonly _tag: RemoteTag;
  // prettier-ignore
  readonly '_URI': URI;
  // prettier-ignore
  readonly '_A': A;
  // prettier-ignore
  readonly '_L': L;

  /**
   * `alt` short for alternative, takes another `RemoteData`. If `this` is a
   * "Right" part then it will be returned. If it is a "Left" part then it
   * will return the next "Right" part if it exist. If both are "Left" parts
   * then it will return next "Left" part.
   *
   * @example
   *
   * `initial.alt(pending) -> pending`
   *
   * `pending.alt(initial) -> initial`
   *
   * `failure(new Error('foo')).alt(success(1)) -> success(1)`
   *
   * `success.alt(refresh) -> refresh`
   */
  alt: (fy: RemoteData<L, A>) => RemoteData<L, A>;

  /**
   * Similar to `alt`, but lazy: it takes a function which returns
   * `RemoteData` object.
   */
  altL: (fy: Lazy<RemoteData<L, A>>) => RemoteData<L, A>;

  /**
   * `ap`, short for "apply". Takes a function `fab` that is in the context of
   * `RemoteData`, and applies that function to this `RemoteData`'s value. If
   * the `RemoteData` calling `ap` is "Left" part it will return same "Left"
   * part. If you pass "Left" part to `ap` as an argument, it will always
   * return same "Left" part.
   *
   * @example
   *
   * `success(1).ap(success(x => x + 1)) will return success(2)`.
   *
   * `success(1).ap(initial) will return initial`.
   *
   * `success(1).ap(refresh(x => x + 1)) will return refresh(2)`.
   *
   * `pending.ap(success(x => x+1)) will return pending`.
   *
   * `failure(new Error('err text')).ap(initial) will return initial.`
   */
  ap: <B>(fab: RemoteData<L, Function1<A, B>>) => RemoteData<L, B>;

  /**
   * Unwraps a value from `RemoteData. It takes a mapping from `RemoteData`
   * types to another value.
   *
   * @example
   *
   * const caseMap: CaseMap = {
   *     initial: 'initial',
   *     pending: 'pending',
   *     failure: (err) => 'failed',
   *     refresh: (stale) => stale - 1,
   *     success: (value) => value + 1
   * }
   *
   * initial.caseOf(caseMap) will return 'initial'
   *
   * pending.caseOf(caseMap) will return 'pending'
   *
   * failure(new Error('error text')).caseOf(caseMap) will return 'failed'
   *
   * refresh(21).caseOf(caseMap) will return 20
   *
   * success(21).caseOf(caseMap) will return 22
   */
  caseOf: <B>(caseMap: CaseMap<L, A, B>) => B;

  /**
   * A variation of `caseMap` that collapses some of the cases. This is similar
   * to the Haskell type "wedge" (hence the name), that is isomorphic to
   * `Option<Either<L, A>>`, but allows you to match the variants all at once.
   *
   * @example
   *
   * const caseMap: WedgeCaseMap = {
   *     none: "none",
   *     failure: (err) => "failed",
   *     some: (data) => data,
   * }
   *
   * initial.wedgeCaseOf(caseMap) will return "none"
   *
   * pending.wedgeCaseOf(caseMap) will return "none"
   *
   * failure(new Error('error text')).wedgeCaseOf(caseMap) will return "failed"
   *
   * refresh(21).wedgeCaseOf(caseMap) will return 21
   *
   * success(21).wedgeCaseOf(caseMap) will return 21
   */
  wedgeCaseOf: <B>(wedgeCaseMap: WedgeCaseMap<L, A, B>) => B;

  /**
   * Takes a function `f` and returns the result of applying it to
   * `RemoteData` value. It's a bit like a `map`, but `f` should returns
   * `RemoteData<T>` instead of `T`. If `this` is "Left" part, then it will
   * return the same "Left" part.
   *
   * For example:
   *
   * `success(1).chain(x => success(x + 1)) will return success(2)`
   *
   * `success(2).chain(() => pending) will return pending`
   *
   * `initial.chain(x => success(x)) will return initial`
   */
  chain: <B>(f: Function1<A, RemoteData<L, B>>) => RemoteData<L, B>;

  /**
   * Takes a function `f` and returns a result of applying it to `RemoteData`.
   * It's a bit like a `chain`, but reversed: `f` takes a `RemoteData<T>` and
   * returns a `T`.
   */
  extend: <B>(f: Function1<RemoteData<L, A>, B>) => RemoteData<L, B>;

  /**
   * Similar to `caseMap` but takes the unwrapping value/function as arguments
   * instead of in a `CaseMap`.
   *
   * @example
   *
   * const foldInitial = 'initial'
   * const foldPending = 'pending'
   * const foldFailure = (err) => 'failed'
   * const foldRefresh = (stale) => stale - 1
   * const foldSuccess = (value) => value + 1
   *
   * initial.fold(foldInitial, foldPending, foldFailure, foldRefresh, foldSuccess) will return 'initial'
   *
   * pending.fold(foldInitial, foldPending, foldFailure, foldRefresh, foldSuccess) will return 'pending'
   *
   * failure(new Error('error text')).fold(foldInitial, foldRefresh, foldPending, foldFailure, foldSuccess) will return 'failed'
   *
   * refresh(21).fold(foldInitial, foldPending, foldFailure, foldRefresh, foldSuccess) will return 20
   *
   * success(21).fold(foldInitial, foldPending, foldFailure, foldRefresh, foldSuccess) will return 22
   */
  fold: <B>(
    initial: B,
    pending: B,
    failure: Function1<L, B>,
    refresh: Function1<A, B>,
    success: Function1<A, B>
  ) => B;

  /**
   * Same as `fold` but lazy: in `initial` and `pending` state it takes a
   * function instead of value.
   */
  foldL: <B>(
    initial: Lazy<B>,
    pending: Lazy<B>,
    failure: Function1<L, B>,
    refresh: Function1<A, B>,
    success: Function1<A, B>
  ) => B;

  /**
   * Takes a default value as an argument. If this `RemoteData` is "Left" it
   * will return default value. If this `RemoteData` is a "Right" it will
   * return the wrapped value.
   *
   * Note: Default value should be the same type as the wrapped value. If you
   * want to pass different type as default, use `caseOf`, `fold` or `foldL`.
   *
   * @example
   *
   * `some(1).getOrElse(999) will return 1`
   *
   * `initial.getOrElse(999) will return 999`
   */
  getOrElse: (value: A) => A;

  /**
   * Same as `getOrElse` but lazy.
   *
   * @example
   *
   * `some(1).getOrElseL(() => 999) will return 1`
   *
   * `initial.getOrElseL(() => 999) will return 999`
   */
  getOrElseL: (f: Lazy<A>) => A;

  /**
   * Takes a function which can operate on the type of the wrapped value. If
   * `this` is a "Left", it returns the "Left". If `this` is a "Right", it
   * applies the function to the wrapped value and returns the "Right" type
   * with the new value.
   *
   * @example
   *
   * `success(1).map(x => x + 99) will return success(100)`
   *
   * `refresh(1).map(x => x + 9) will return refresh(10)`
   *
   * `initial.map(x => x + 99) will return initial`
   *
   * `pending.map(x => x + 99) will return pending`
   *
   * `failure(new Error('error text')).map(x => x + 99) will return failure(new Error('error text')`
   */
  map: <B>(f: Function1<A, B>) => RemoteData<L, B>;

  /**
   * Similar to `map`, but takes a function that can operate on the
   * `RemoteFailure`'s `L` type.
   *
   * @example
   *
   * `success(1).map(x => 'new error text') will return success(1)`
   *
   * `initial.map(x => 'new error text') will return initial`
   *
   * `failure(new Error('error text')).map(x => 'new error text') will return failure(new Error('new error text'))`
   */
  mapLeft: <M>(f: Function1<L, M>) => RemoteData<M, A>;

  reduce: <B>(f: Function2<B, A, B>, b: B) => B;

  /**
   * Type Guards
   */
  isInitial: () => boolean;
  isPending: () => boolean;
  isFailure: () => boolean;
  isRefresh: () => boolean;
  isSuccess: () => boolean;

  /**
   * Convert `RemoteData` to `Option`. "Left" part will be converted to
   * `None`. "Right" part will be converted to `Some`.
   *
   * For example:
   *
   * `success(2).toOption() will return some(2)`
   *
   * `refresh(2).toOption() will return some(2)`
   *
   * `initial.toOption() will return none`
   *
   * `pending.toOption() will return none`
   *
   * `failure(new Error('error text')).toOption() will return none`
   */
  toOption: () => Option<A>;

  /**
   * One more way to fold (unwrap) value from `RemoteData`. "Left" part will
   * return `null`. "Right" part will return unwrapped value.
   *
   * For example:
   *
   * `success(2).toNullable() will return 2`
   *
   * `refresh(2).toNullable() will return 2`
   *
   * `initial.toNullable() will return null`
   *
   * `pending.toNullable() will return null`
   *
   * `failure(new Error('error text)).toNullable() will return null`
   *
   */
  toNullable: () => A | null;

  /**
   * Returns string representation of `RemoteData`.
   */
  toString: () => string;

  /**
   * Returns string representation of `RemoteData`.
   */
  toJSON: () => RemoteJSON<L, A>;

  /**
   * Compare values and returns `true` if they are identical, otherwise
   * returns `false`. "Left" part will return `false`. "Right" part will
   * call `Setoid`'s `equals` method.
   *
   * If you want to compare `RemoteData`'s values better use `getSetoid` or
   * `getOrd` helpers.
   */
  contains: (S: Setoid<A>, a: A) => boolean;

  /**
   * Takes a predicate and apply it to the wrapped value in a "Right" part.
   * "Left" part will return `false`.
   */
  exists: (p: Predicate<A>) => boolean;
}

export interface CaseMap<L, A, B> {
  failure: Function1<L, B>;
  initial: B;
  pending: B;
  refresh: Function1<A, B>;
  success: Function1<A, B>;
}

export interface WedgeCaseMap<L, A, B> {
  none: B;
  failure: Function1<L, B>;
  some: Function1<A, B>;
}

/**
 * Represents a value of one of four possible types (a disjoint union)
 *
 * An instance of `RemoteData` is either an instance of `RemoteInitial`, `RemotePending`, `RemoteFailure` or `RemoteSuccess`
 *
 * A common use of `RemoteData` is as an alternative to `Either` or `Option` supporting initial and pending states (fits best with [RXJS]{@link https://github.com/ReactiveX/rxjs/}).
 *
 * Note: `RemoteInitial`, `RemotePending` and `RemoteFailure` are commonly called "Left" part in jsDoc.
 *
 * @see https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b
 *
 */
export type RemoteData<L, A> =
  | RemoteInitial<L, A>
  | RemoteFailure<L, A>
  | RemoteRefresh<L, A>
  | RemoteSuccess<L, A>
  | RemotePending<L, A>;

//Monad
export const of = <L, A>(value: A): RemoteSuccess<L, A> =>
  new RemoteSuccess(value);
const ap = <L, A, B>(
  fab: RemoteData<L, Function1<A, B>>,
  fa: RemoteData<L, A>
): RemoteData<L, B> => fa.ap(fab);
const map = <L, A, B>(
  fa: RemoteData<L, A>,
  f: Function1<A, B>
): RemoteData<L, B> => fa.map(f);
const chain = <L, A, B>(
  fa: RemoteData<L, A>,
  f: Function1<A, RemoteData<L, B>>
): RemoteData<L, B> => fa.chain(f);

//Foldable
const reduce = <L, A, B>(
  fa: RemoteData<L, A>,
  b: B,
  f: Function2<B, A, B>
): B => fa.reduce(f, b);

//Traversable
function traverse<F extends URIS2>(
  F: Applicative<F>
): <L, A, B>(
  ta: RemoteData<L, A>,
  f: Function1<A, HKT2<F, L, B>>
) => Type2<F, L, RemoteData<L, B>>;
function traverse<F extends URIS>(
  F: Applicative<F>
): <L, A, B>(
  ta: RemoteData<L, A>,
  f: Function1<A, HKT<F, B>>
) => Type<F, RemoteData<L, B>>;
function traverse<F>(
  F: Applicative<F>
): <L, A, B>(
  ta: RemoteData<L, A>,
  f: Function1<A, HKT<F, B>>
) => HKT<F, RemoteData<L, B>>;
function traverse<F>(
  F: Applicative<F>
): <L, A, B>(
  ta: RemoteData<L, A>,
  f: Function1<A, HKT<F, B>>
) => HKT<F, RemoteData<L, B>> {
  return (ta, f) => {
    if (ta.isSuccess()) {
      return F.map(f(ta.value), of);
    } else if (ta.isRefresh()) {
      return F.map(f(ta.value), refresh);
    } else {
      return F.of(ta as any);
    }
  };
}

//Alt
const alt = <L, A>(
  fx: RemoteData<L, A>,
  fy: RemoteData<L, A>
): RemoteData<L, A> => fx.alt(fy);

//Extend
const extend = <L, A, B>(
  fla: RemoteData<L, A>,
  f: Function1<RemoteData<L, A>, B>
): RemoteData<L, B> => fla.extend(f);

//constructors
export const failure = <L, A>(error: L): RemoteFailure<L, A> =>
  new RemoteFailure(error);
export const refresh = <L, A>(stale: A): RemoteRefresh<L, A> =>
  new RemoteRefresh(stale);
export const success: <L, A>(value: A) => RemoteSuccess<L, A> = of;
export const pending: RemotePending<never, never> = new RemotePending<
  never,
  never
>();
export const initial: RemoteInitial<never, never> = new RemoteInitial<
  never,
  never
>();

//Alternative
const zero = <L, A>(): RemoteData<L, A> => initial;

//filters
export const isFailure = <L, A>(
  data: RemoteData<L, A>
): data is RemoteFailure<L, A> => data.isFailure();
export const isRefresh = <L, A>(
  data: RemoteData<L, A>
): data is RemoteRefresh<L, A> => data.isRefresh();
export const isSuccess = <L, A>(
  data: RemoteData<L, A>
): data is RemoteSuccess<L, A> => data.isSuccess();
export const isPending = <L, A>(
  data: RemoteData<L, A>
): data is RemotePending<L, A> => data.isPending();
export const isInitial = <L, A>(
  data: RemoteData<L, A>
): data is RemoteInitial<L, A> => data.isInitial();

//Monoidal
const unit = <L, A>(): RemoteData<L, A> => initial;
const mult = <L, A, B>(
  fa: RemoteData<L, A>,
  fb: RemoteData<L, B>
): RemoteData<L, [A, B]> => combine(fa, fb);

//Setoid
export const getSetoid = <L, A>(
  SL: Setoid<L>,
  SA: Setoid<A>
): Setoid<RemoteData<L, A>> => {
  return {
    equals: (x, y) =>
      x.foldL(
        () => y.isInitial(),
        () => y.isPending(),
        (xError) =>
          y.foldL(
            constFalse,
            constFalse,
            (yError) => SL.equals(xError, yError),
            constFalse,
            constFalse
          ),
        (ax) =>
          y.foldL(
            constFalse,
            constFalse,
            constFalse,
            (ay) => SA.equals(ax, ay),
            (ay) => SA.equals(ax, ay)
          ),
        (ax) =>
          y.foldL(
            constFalse,
            constFalse,
            constFalse,
            (ay) => SA.equals(ax, ay),
            (ay) => SA.equals(ax, ay)
          )
      ),
  };
};

//Ord
export const getOrd = <L, A>(OL: Ord<L>, OA: Ord<A>): Ord<RemoteData<L, A>> => {
  return {
    ...getSetoid(OL, OA),
    compare: (x, y) =>
      sign(
        x.foldL(
          () =>
            y.fold(
              0,
              -1,
              () => -1,
              () => -1,
              () => -1
            ),
          () =>
            y.fold(
              1,
              0,
              () => -1,
              () => -1,
              () => -1
            ),
          (xError) =>
            y.fold(
              1,
              1,
              (yError) => OL.compare(xError, yError),
              () => -1,
              () => -1
            ),
          (xValue) =>
            y.fold(
              1,
              1,
              () => 1,
              (yValue) => OA.compare(xValue, yValue),
              (yValue) => OA.compare(xValue, yValue)
            ),
          (xValue) =>
            y.fold(
              1,
              1,
              () => 1,
              (yValue) => OA.compare(xValue, yValue),
              (yValue) => OA.compare(xValue, yValue)
            )
        )
      ),
  };
};

//Semigroup
export const getSemigroup = <L, A>(
  SL: Semigroup<L>,
  SA: Semigroup<A>
): Semigroup<RemoteData<L, A>> => {
  return {
    concat: (x, y) => {
      return x.foldL(
        () =>
          y.fold(
            y,
            y,
            () => y,
            () => y,
            () => y
          ),
        () =>
          y.fold(
            x,
            y,
            () => y,
            () => y,
            () => y
          ),
        (xError) =>
          y.fold(
            x,
            x,
            (yError) => failure(SL.concat(xError, yError)),
            () => y,
            () => y
          ),
        (xStale) =>
          y.fold(
            x,
            x,
            () => x,
            (yStale) => refresh(SA.concat(xStale, yStale)),
            (yValue) => refresh(SA.concat(xStale, yValue))
          ),
        (xValue) =>
          y.fold(
            x,
            x,
            () => x,
            (yStale) => refresh(SA.concat(xValue, yStale)),
            (yValue) => success(SA.concat(xValue, yValue))
          )
      );
    },
  };
};

//Monoid
export const getMonoid = <L, A>(
  ML: Monoid<L>,
  MA: Monoid<A>
): Monoid<RemoteData<L, A>> => {
  return {
    ...getSemigroup(ML, MA),
    empty: initial,
  };
};

export function fromOption<L, A>(
  option: Option<A>,
  error: Lazy<L>
): RemoteData<L, A> {
  if (isNone(option)) {
    return failure(error());
  } else {
    return success(option.value);
  }
}

export function fromEither<L, A>(either: Either<L, A>): RemoteData<L, A> {
  if (isLeft(either)) {
    return failure(either.value);
  } else {
    return success(either.value);
  }
}

export function fromPredicate<L, A>(
  predicate: Predicate<A>,
  whenFalse: Function1<A, L>
): Function1<A, RemoteData<L, A>> {
  return (a) => (predicate(a) ? success(a) : failure(whenFalse(a)));
}

export function fromJSON<L, A>(JSON: RemoteJSON<L, A>): RemoteData<L, A> {
  switch (JSON._tag) {
    case "RemoteInitial":
      return initial;
    case "RemotePending":
      return pending;
    case "RemoteFailure":
      return failure<L, A>(JSON.error);
    case "RemoteRefresh":
      return refresh<L, A>(JSON.value);
    case "RemoteSuccess":
      return success<L, A>(JSON.value);
  }
}

//instance
export const remoteData: Monad2<URI> &
  Foldable2<URI> &
  Traversable2<URI> &
  Alt2<URI> &
  Extend2<URI> &
  Alternative2<URI> &
  Monoidal2<URI> = {
  //HKT
  URI,

  //Monad
  of,
  ap,
  map,
  chain,

  //Foldable
  reduce,

  //Traversable
  traverse,

  //Alt
  alt,

  //Alternative
  zero,

  //Extend
  extend,

  //Monoidal
  unit,
  mult,
};

export function combine<A, L>(a: RemoteData<L, A>): RemoteData<L, [A]>;
export function combine<A, B, L>(
  a: RemoteData<L, A>,
  b: RemoteData<L, B>
): RemoteData<L, [A, B]>;
export function combine<A, B, C, L>(
  a: RemoteData<L, A>,
  b: RemoteData<L, B>,
  c: RemoteData<L, C>
): RemoteData<L, [A, B, C]>;
export function combine<A, B, C, D, L>(
  a: RemoteData<L, A>,
  b: RemoteData<L, B>,
  c: RemoteData<L, C>,
  d: RemoteData<L, D>
): RemoteData<L, [A, B, C, D]>;
export function combine<A, B, C, D, E, L>(
  a: RemoteData<L, A>,
  b: RemoteData<L, B>,
  c: RemoteData<L, C>,
  d: RemoteData<L, D>,
  e: RemoteData<L, E>
): RemoteData<L, [A, B, C, D, E]>;
export function combine<A, B, C, D, E, F, L>(
  a: RemoteData<L, A>,
  b: RemoteData<L, B>,
  c: RemoteData<L, C>,
  d: RemoteData<L, D>,
  e: RemoteData<L, E>,
  f: RemoteData<L, F>
): RemoteData<L, [A, B, C, D, E, F]>;
export function combine<T, L>(...list: RemoteData<L, T>[]): RemoteData<L, T[]> {
  if (list.length === 0) {
    return of([]);
  }
  return sequence(remoteData, array)(list);
}
