import { Lazy, Function1, Function2, Predicate } from "fp-ts/lib/function";
import { none, Option } from "fp-ts/lib/Option";
import { Setoid } from "fp-ts/lib/Setoid";
import {
  initial,
  RemotePending,
  RemoteFailure,
  RemoteRefresh,
  RemoteSuccess,
  CaseMap,
  URI,
  IRemoteData,
  RemoteData,
  RemoteJSON,
  WedgeCaseMap,
} from "./remote-data";

export class RemoteInitial<L, A> implements IRemoteData<L, A> {
  readonly _tag: "RemoteInitial" = "RemoteInitial";
  // prettier-ignore
  readonly '_URI': URI;
  // prettier-ignore
  readonly '_A': A;
  // prettier-ignore
  readonly '_L': L;

  alt(fy: RemoteData<L, A>): RemoteData<L, A> {
    return fy;
  }

  altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
    return fy();
  }

  ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
    return initial;
  }

  chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
    return initial;
  }

  extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
    return initial;
  }

  fold<B>(
    initial: B,
    pending: B,
    failure: Function1<L, B>,
    refresh: Function1<A, B>,
    success: Function1<A, B>
  ): B {
    return initial;
  }

  caseOf<B>(caseMap: CaseMap<L, A, B>): B {
    return caseMap.initial;
  }

  wedgeCaseOf<B>(caseMap: WedgeCaseMap<L, A, B>): B {
    return caseMap.none;
  }

  foldL<B>(
    initial: Lazy<B>,
    pending: Lazy<B>,
    failure: Function1<L, B>,
    refresh: Function1<A, B>,
    success: Function1<A, B>
  ): B {
    return initial();
  }

  getOrElseL(f: Lazy<A>): A {
    return f();
  }

  map<B>(f: Function1<A, B>): RemoteData<L, B> {
    return initial;
  }

  mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
    return initial;
  }

  getOrElse(value: A): A {
    return value;
  }

  reduce<B>(f: Function2<B, A, B>, b: B): B {
    return b;
  }

  isInitial(): this is RemoteInitial<L, A> {
    return true;
  }

  isPending(): this is RemotePending<L, A> {
    return false;
  }

  isFailure(): this is RemoteFailure<L, A> {
    return false;
  }

  isRefresh(): this is RemoteRefresh<L, A> {
    return false;
  }

  isSuccess(): this is RemoteSuccess<L, A> {
    return false;
  }

  toOption(): Option<A> {
    return none;
  }

  toNullable(): A | null {
    return null;
  }

  toString(): string {
    return "initial";
  }

  toJSON(): RemoteJSON<L, A> {
    return {
      _URI: URI,
      _tag: this._tag,
    };
  }

  contains(S: Setoid<A>, a: A): boolean {
    return false;
  }

  exists(p: Predicate<A>): boolean {
    return false;
  }
}
