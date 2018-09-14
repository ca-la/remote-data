import { Lazy, Function1, Function2, Predicate, toString } from 'fp-ts/lib/function';
import { none, Option } from 'fp-ts/lib/Option';
import { Setoid } from 'fp-ts/lib/Setoid';
import {
	failure,
	pending,
	initial,
	RemoteInitial,
	RemotePending,
	RemoteRefresh,
	RemoteSuccess,
	CaseMap,
	URI,
	IRemoteData,
	RemoteData,
} from './remote-data';

export class RemoteFailure<L, A> implements IRemoteData<L, A> {
	readonly _tag: 'RemoteFailure' = 'RemoteFailure';
	// prettier-ignore
	readonly '_URI': URI;
	// prettier-ignore
	readonly '_A': A;
	// prettier-ignore
	readonly '_L': L;

	constructor(readonly error: L) {}

	alt(fy: RemoteData<L, A>): RemoteData<L, A> {
		return fy;
	}

	altL(fy: Lazy<RemoteData<L, A>>): RemoteData<L, A> {
		return fy();
	}

	ap<B>(fab: RemoteData<L, Function1<A, B>>): RemoteData<L, B> {
		return fab.fold(initial, pending, () => fab as any, () => this, () => this);
	}

	chain<B>(f: Function1<A, RemoteData<L, B>>): RemoteData<L, B> {
		return this as any;
	}

	extend<B>(f: Function1<RemoteData<L, A>, B>): RemoteData<L, B> {
		return this as any;
	}

	fold<B>(initial: B, pending: B, failure: Function1<L, B>, refresh: Function1<A, B>, success: Function1<A, B>): B {
		return failure(this.error);
	}

	caseOf<B>(caseMap: CaseMap<L, A, B>): B {
		return caseMap.failure(this.error);
	}

	foldL<B>(
		initial: Lazy<B>,
		pending: Lazy<B>,
		failure: Function1<L, B>,
		refresh: Function1<A, B>,
		success: Function1<A, B>,
	): B {
		return failure(this.error);
	}

	getOrElseL(f: Lazy<A>): A {
		return f();
	}

	map<B>(f: (a: A) => B): RemoteData<L, B> {
		return this as any;
	}

	mapLeft<M>(f: Function1<L, M>): RemoteData<M, A> {
		return failure(f(this.error)); //tslint:disable-line no-use-before-declare
	}

	getOrElse(value: A): A {
		return value;
	}

	reduce<B>(f: Function2<B, A, B>, b: B): B {
		return b;
	}

	isInitial(): this is RemoteInitial<L, A> {
		return false;
	}

	isPending(): this is RemotePending<L, A> {
		return false;
	}

	isFailure(): this is RemoteFailure<L, A> {
		return true;
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
		return `failure(${toString(this.error)})`;
	}

	contains(S: Setoid<A>, a: A): boolean {
		return false;
	}

	exists(p: Predicate<A>): boolean {
		return false;
	}
}
