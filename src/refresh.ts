import { Lazy, Function1, Function2, Predicate, toString } from 'fp-ts/lib/function';
import { some, Option } from 'fp-ts/lib/Option';
import { Setoid } from 'fp-ts/lib/Setoid';
import {
  refresh,
  initial,
  pending,
  RemoteInitial,
  RemotePending,
  RemoteFailure,
  RemoteSuccess,
  CaseMap,
  URI,
  IRemoteData,
  RemoteData,
  RemoteJSON
} from './remote-data';

export class RemoteRefresh<L, A> implements IRemoteData<L, A> {
  readonly _tag: 'RemoteRefresh' = 'RemoteRefresh';
  // prettier-ignore
  readonly '_URI': URI;
  // prettier-ignore
  readonly '_A': A;
  // prettier-ignore
  readonly '_L': L;

  constructor(readonly value: A) {}

  alt(fy: RemoteData<L, A>): RemoteData<L, A> {
    return fy.fold(this, this, () => this, () => this, () => fy);
  }

  altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
    return fy().fold(this, this, () => this, () => this, () => fy());
  }

  ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
    return fab.fold(
      initial,
      pending,
      () => fab as any,
      value => this.map(value),
      value => this.map(value)
    );
  }

  chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
    return f(this.value);
  }

  extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
    return refresh(f(this));
  }

  fold<B>(
    initial: B,
    pending: B,
    failure: Function1<L, B>,
    refresh: Function1<A, B>,
    success: Function1<A, B>
  ): B {
    return refresh(this.value);
  }

  caseOf<B>(caseMap: CaseMap<L, A, B>): B {
    return caseMap.refresh(this.value);
  }

  foldL<B>(
    initial: Lazy<B>,
    pending: Lazy<B>,
    failure: Function1<L, B>,
    refresh: Function1<A, B>,
    success: Function1<A, B>
  ): B {
    return refresh(this.value);
  }

  getOrElseL(f: Lazy<A>): A {
    return this.value;
  }

  map<B>(f: Function1<A, B>): RemoteData<L, B> {
    return refresh(f(this.value));
  }

  mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
    return this as any;
  }

  getOrElse(value: A): A {
    return this.value;
  }

  reduce<B>(f: Function2<B, A, B>, b: B): B {
    return f(b, this.value);
  }

  isInitial(): this is RemoteInitial<L, A> {
    return false;
  }

  isPending(): this is RemotePending<L, A> {
    return false;
  }

  isFailure(): this is RemoteFailure<L, A> {
    return false;
  }

  isRefresh(): this is RemoteRefresh<L, A> {
    return true;
  }

  isSuccess(): this is RemoteSuccess<L, A> {
    return false;
  }

  toOption(): Option<A> {
    return some(this.value);
  }

  toNullable(): A | null {
    return this.value;
  }

  toString(): string {
    return `refresh(${toString(this.value)})`;
  }

  toJSON(): RemoteJSON<L, A> {
    return {
      _URI: URI,
      _tag: this._tag,
      value: this.value
    };
  }

  contains(S: Setoid<A>, a: A): boolean {
    return S.equals(this.value, a);
  }

  exists(p: Predicate<A>): boolean {
    return p(this.value);
  }
}
