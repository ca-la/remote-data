import {
	pending,
	failure,
	success,
	refresh,
	RemoteData,
	initial,
	combine,
	remoteData,
	getSetoid,
	getOrd,
	getSemigroup,
	getMonoid,
	fromOption,
	fromEither,
	fromPredicate,
} from '../remote-data';
import { identity, compose } from 'fp-ts/lib/function';
import { sequence, traverse } from 'fp-ts/lib/Traversable';
import { none, option, some } from 'fp-ts/lib/Option';
import { array } from 'fp-ts/lib/Array';
import { setoidNumber, setoidString } from 'fp-ts/lib/Setoid';
import { ordNumber, ordString } from 'fp-ts/lib/Ord';
import { semigroupString, semigroupSum } from 'fp-ts/lib/Semigroup';
import { monoidString, monoidSum } from 'fp-ts/lib/Monoid';
import { left, right } from 'fp-ts/lib/Either';

describe('RemoteData', () => {
	const double = (x: number) => x * 2;
	const quad = compose(
		double,
		double,
	);
	const initialRD: RemoteData<string, number> = initial;
	const pendingRD: RemoteData<string, number> = pending;
	const refreshRD: RemoteData<string, number> = refresh(-1);
	const successRD: RemoteData<string, number> = success(1);
	const failureRD: RemoteData<string, number> = failure('foo');
	describe('Functor', () => {
		describe('should map over value', () => {
			it('initial', () => {
				expect(initial.map(double)).toBe(initial);
			});
			it('pending', () => {
				expect(pending.map(double)).toBe(pending);
			});
			it('failure', () => {
				const failed = failure<string, number>('foo');
				expect(failed.map(double)).toBe(failed);
			});
			it('refresh', () => {
				const value = 123;
				const refreshing = refresh(value);
				const result = refreshing.map(double);
				expect(result).toEqual(refresh(value * 2));
			});
			it('success', () => {
				const value = 123;
				const succeeded = success(value);
				const result = succeeded.map(double);
				expect(result).toEqual(success(value * 2));
			});
		});
		describe('laws', () => {
			describe('identity', () => {
				it('initial', () => {
					expect(initial.map(identity)).toBe(initial);
				});
				it('pending', () => {
					expect(pending.map(identity)).toBe(pending);
				});
				it('failure', () => {
					const failed = failure('foo');
					expect(failed.map(identity)).toBe(failed);
				});
				it('refresh', () => {
					const refreshing = refresh('foo');
					const result = refreshing.map(identity);
					expect(result).toEqual(refreshing);
					expect(result).not.toBe(refreshing);
				});
				it('success', () => {
					const succeeded = success('foo');
					const result = succeeded.map(identity);
					expect(result).toEqual(succeeded);
					expect(result).not.toBe(succeeded);
				});
			});
			describe('composition', () => {
				it('initial', () => {
					expect(initial.map(quad)).toBe(initial.map(double).map(double));
				});
				it('pending', () => {
					expect(pending.map(quad)).toBe(pending.map(double).map(double));
				});
				it('failure', () => {
					const failed: RemoteData<string, number> = failure('foo');
					expect(failed.map(quad)).toBe(failed.map(double).map(double));
				});
				it('refresh', () => {
					const value = 1;
					const refreshing = refresh(value);
					expect(refreshing.map(quad)).toEqual(refresh(quad(value)));
				});
				it('success', () => {
					const value = 1;
					const succeeded = success(value);
					expect(succeeded.map(quad)).toEqual(success(quad(value)));
				});
			});
		});
	});
	describe('Alt', () => {
		describe('should alt', () => {
			it('initial', () => {
				expect(initialRD.alt(initialRD)).toBe(initialRD);
				expect(initialRD.alt(pendingRD)).toBe(pendingRD);
				expect(initialRD.alt(failureRD)).toBe(failureRD);
				expect(initialRD.alt(refreshRD)).toBe(refreshRD);
				expect(initialRD.alt(successRD)).toBe(successRD);
			});
			it('pending', () => {
				expect(pendingRD.alt(initialRD)).toBe(initialRD);
				expect(pendingRD.alt(pendingRD)).toBe(pendingRD);
				expect(pendingRD.alt(failureRD)).toBe(failureRD);
				expect(pendingRD.alt(refreshRD)).toBe(refreshRD);
				expect(pendingRD.alt(successRD)).toBe(successRD);
			});
			it('failure', () => {
				expect(failureRD.alt(pendingRD)).toBe(pendingRD);
				expect(failureRD.alt(initialRD)).toBe(initialRD);
				expect(failureRD.alt(failureRD)).toBe(failureRD);
				expect(failureRD.alt(refreshRD)).toBe(refreshRD);
				expect(failureRD.alt(successRD)).toBe(successRD);
			});
			it('refresh', () => {
				expect(refreshRD.alt(pendingRD)).toBe(refreshRD);
				expect(refreshRD.alt(initialRD)).toBe(refreshRD);
				expect(refreshRD.alt(failureRD)).toBe(refreshRD);
				expect(refreshRD.alt(refreshRD)).toBe(refreshRD);
				expect(refreshRD.alt(successRD)).toBe(successRD);
			});
			it('success', () => {
				expect(successRD.alt(pendingRD)).toBe(successRD);
				expect(successRD.alt(initialRD)).toBe(successRD);
				expect(successRD.alt(failureRD)).toBe(successRD);
				expect(successRD.alt(refreshRD)).toBe(refreshRD);
				expect(successRD.alt(successRD)).toBe(successRD);
			});
		});
	});
	describe('Apply', () => {
		describe('should ap', () => {
			const f: RemoteData<string, (a: number) => number> = success(double);
			const r: RemoteData<string, (a: number) => number> = refresh(quad);
			const failedF: RemoteData<string, (a: number) => number> = failure('foo');
			it('initial', () => {
				expect(initialRD.ap(initial)).toBe(initialRD);
				expect(initialRD.ap(pending)).toBe(initialRD);
				expect(initialRD.ap(failedF)).toBe(initialRD);
				expect(initialRD.ap(r)).toBe(initialRD);
				expect(initialRD.ap(f)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.ap(initial)).toBe(initial);
				expect(pendingRD.ap(pending)).toBe(pendingRD);
				expect(pendingRD.ap(failedF)).toBe(pendingRD);
				expect(pendingRD.ap(r)).toBe(pendingRD);
				expect(pendingRD.ap(f)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failureRD.ap(initial)).toBe(initial);
				expect(failureRD.ap(pending)).toBe(pending);
				expect(failureRD.ap(failedF)).toBe(failedF);
				expect(failureRD.ap(r)).toBe(failureRD);
				expect(failureRD.ap(f)).toBe(failureRD);
			});
			it('refresh', () => {
				expect(refreshRD.ap(initial)).toBe(initial);
				expect(refreshRD.ap(pending)).toBe(pending);
				expect(refreshRD.ap(failedF)).toBe(failedF);
				expect(refreshRD.ap(r)).toEqual(refresh(quad(-1)));
				expect(refreshRD.ap(f)).toEqual(refresh(double(-1)));
			});
			it('success', () => {
				expect(successRD.ap(initial)).toBe(initial);
				expect(successRD.ap(pending)).toBe(pending);
				expect(successRD.ap(failedF)).toBe(failedF);
				expect(successRD.ap(r)).toEqual(refresh(quad(1)));
				expect(successRD.ap(f)).toEqual(success(double(1)));
			});
		});
	});
	describe('Applicative', () => {
		describe('sequence', () => {
			const s = sequence(remoteData, array);
			it('initial', () => {
				expect(s([initialRD, successRD, refreshRD])).toBe(initialRD);
			});
			it('pending', () => {
				expect(s([pendingRD, successRD, refreshRD])).toBe(pendingRD);
			});
			it('failure', () => {
				expect(s([failureRD, successRD, refreshRD])).toBe(failureRD);
			});
			it('refresh', () => {
				expect(s([success(123), refresh(456)])).toEqual(refresh([123, 456]));
			});
			it('success', () => {
				expect(s([success(123), success(456)])).toEqual(success([123, 456]));
			});
		});
	});
	describe('Chain', () => {
		describe('chain', () => {
			it('initial', () => {
				expect(initialRD.chain(() => initialRD)).toBe(initialRD);
				expect(initialRD.chain(() => pendingRD)).toBe(initialRD);
				expect(initialRD.chain(() => failureRD)).toBe(initialRD);
				expect(initialRD.chain(() => refreshRD)).toBe(initialRD);
				expect(initialRD.chain(() => successRD)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.chain(() => initialRD)).toBe(pendingRD);
				expect(pendingRD.chain(() => pendingRD)).toBe(pendingRD);
				expect(pendingRD.chain(() => failureRD)).toBe(pendingRD);
				expect(pendingRD.chain(() => refreshRD)).toBe(pendingRD);
				expect(pendingRD.chain(() => successRD)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failureRD.chain(() => initialRD)).toBe(failureRD);
				expect(failureRD.chain(() => pendingRD)).toBe(failureRD);
				expect(failureRD.chain(() => failureRD)).toBe(failureRD);
				expect(failureRD.chain(() => refreshRD)).toBe(failureRD);
				expect(failureRD.chain(() => successRD)).toBe(failureRD);
			});
			it('refresh', () => {
				expect(refreshRD.chain(() => initialRD)).toBe(initialRD);
				expect(refreshRD.chain(() => pendingRD)).toBe(pendingRD);
				expect(refreshRD.chain(() => failureRD)).toBe(failureRD);
				expect(refreshRD.chain(() => refreshRD)).toBe(refreshRD);
				expect(refreshRD.chain(() => successRD)).toBe(successRD);
			});
			it('success', () => {
				expect(successRD.chain(() => initialRD)).toBe(initialRD);
				expect(successRD.chain(() => pendingRD)).toBe(pendingRD);
				expect(successRD.chain(() => failureRD)).toBe(failureRD);
				expect(successRD.chain(() => refreshRD)).toBe(refreshRD);
				expect(successRD.chain(() => successRD)).toBe(successRD);
			});
		});
	});
	describe('Extend', () => {
		describe('extend', () => {
			const f = () => 1;
			it('initial', () => {
				expect(initialRD.extend(f)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.extend(f)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failureRD.extend(f)).toBe(failureRD);
			});
			it('refresh', () => {
				expect(refreshRD.extend(f)).toEqual(refresh(1));
			});
			it('success', () => {
				expect(successRD.extend(f)).toEqual(success(1));
			});
		});
	});
	describe('Traversable', () => {
		describe('traverse', () => {
			const t = traverse(option, remoteData);
			const f = (x: number) => (x >= 2 ? some(x) : none);
			it('initial', () => {
				expect(t(initialRD, f)).toEqual(some(initialRD));
			});
			it('pending', () => {
				expect(t(pendingRD, f)).toEqual(some(pendingRD));
			});
			it('failure', () => {
				expect(t(failureRD, f)).toEqual(some(failureRD));
			});
			it('refresh', () => {
				expect(t(refresh(1), f)).toBe(none);
				expect(t(refresh(3), f)).toEqual(some(refresh(3)));
			});
			it('success', () => {
				expect(t(success(1), f)).toBe(none);
				expect(t(success(3), f)).toEqual(some(success(3)));
			});
		});
	});
	describe('Foldable', () => {
		describe('reduce', () => {
			const f = (a: number, b: number) => a + b;
			it('initial', () => {
				expect(initialRD.reduce(f, 1)).toBe(1);
			});
			it('pending', () => {
				expect(pendingRD.reduce(f, 1)).toBe(1);
			});
			it('failure', () => {
				expect(failureRD.reduce(f, 1)).toBe(1);
			});
			it('refresh', () => {
				expect(refresh(1).reduce(f, 1)).toBe(2);
			});
			it('success', () => {
				expect(success(1).reduce(f, 1)).toBe(2);
			});
		});
	});
	describe('Alternative', () => {
		it('zero', () => {
			expect(remoteData.zero()).toBe(initial);
		});
	});
	describe('Setoid', () => {
		describe('getSetoid', () => {
			const equals = getSetoid(setoidString, setoidNumber).equals;
			it('initial', () => {
				expect(equals(initialRD, initialRD)).toBe(true);
				expect(equals(initialRD, pendingRD)).toBe(false);
				expect(equals(initialRD, failureRD)).toBe(false);
				expect(equals(initialRD, refreshRD)).toBe(false);
				expect(equals(initialRD, successRD)).toBe(false);
			});
			it('pending', () => {
				expect(equals(pendingRD, initialRD)).toBe(false);
				expect(equals(pendingRD, pendingRD)).toBe(true);
				expect(equals(pendingRD, failureRD)).toBe(false);
				expect(equals(pendingRD, refreshRD)).toBe(false);
				expect(equals(pendingRD, successRD)).toBe(false);
			});
			it('failure', () => {
				expect(equals(failureRD, initialRD)).toBe(false);
				expect(equals(failureRD, pendingRD)).toBe(false);
				expect(equals(failureRD, failureRD)).toBe(true);
				expect(equals(failure('1'), failure('2'))).toBe(false);
				expect(equals(failureRD, refreshRD)).toBe(false);
				expect(equals(failureRD, successRD)).toBe(false);
			});
			it('refresh', () => {
				expect(equals(refreshRD, initialRD)).toBe(false);
				expect(equals(refreshRD, pendingRD)).toBe(false);
				expect(equals(refreshRD, failureRD)).toBe(false);
				expect(equals(refreshRD, successRD)).toBe(false);
				expect(equals(refreshRD, refreshRD)).toBe(true);
				expect(equals(refresh(1), refresh(2))).toBe(false);
			});
			it('success', () => {
				expect(equals(successRD, initialRD)).toBe(false);
				expect(equals(successRD, pendingRD)).toBe(false);
				expect(equals(successRD, failureRD)).toBe(false);
				expect(equals(successRD, refreshRD)).toBe(false);
				expect(equals(successRD, successRD)).toBe(true);
				expect(equals(success(1), success(2))).toBe(false);
			});
		});
	});
	describe('Ord', () => {
		describe('getOrd', () => {
			const compare = getOrd(ordString, ordNumber).compare;
			it('initial', () => {
				expect(compare(initialRD, initialRD)).toBe(0);
				expect(compare(initialRD, pendingRD)).toBe(-1);
				expect(compare(initialRD, failureRD)).toBe(-1);
				expect(compare(initialRD, refreshRD)).toBe(-1);
				expect(compare(initialRD, successRD)).toBe(-1);
			});
			it('pending', () => {
				expect(compare(pendingRD, initialRD)).toBe(1);
				expect(compare(pendingRD, pendingRD)).toBe(0);
				expect(compare(pendingRD, failureRD)).toBe(-1);
				expect(compare(pendingRD, refreshRD)).toBe(-1);
				expect(compare(pendingRD, successRD)).toBe(-1);
			});
			it('failure', () => {
				expect(compare(failureRD, initialRD)).toBe(1);
				expect(compare(failureRD, pendingRD)).toBe(1);
				expect(compare(failureRD, failureRD)).toBe(0);
				expect(compare(failureRD, refreshRD)).toBe(-1);
				expect(compare(failureRD, successRD)).toBe(-1);
				expect(compare(failure('1'), failure('2'))).toBe(-1);
				expect(compare(failure('2'), failure('1'))).toBe(1);
			});
			it('refresh', () => {
				expect(compare(refreshRD, initialRD)).toBe(1);
				expect(compare(refreshRD, pendingRD)).toBe(1);
				expect(compare(refreshRD, failureRD)).toBe(1);
				expect(compare(refreshRD, refreshRD)).toBe(0);
				expect(compare(refreshRD, successRD)).toBe(-1);
				expect(compare(refresh(1), refresh(2))).toBe(-1);
				expect(compare(refresh(2), refresh(1))).toBe(1);
			});
			it('success', () => {
				expect(compare(successRD, initialRD)).toBe(1);
				expect(compare(successRD, pendingRD)).toBe(1);
				expect(compare(successRD, failureRD)).toBe(1);
				expect(compare(successRD, refreshRD)).toBe(1);
				expect(compare(successRD, successRD)).toBe(0);
				expect(compare(success(1), success(2))).toBe(-1);
				expect(compare(success(2), success(1))).toBe(1);
			});
		});
	});
	describe('Semigroup', () => {
		describe('getSemigroup', () => {
			const concat = getSemigroup(semigroupString, semigroupSum).concat;
			it('initial', () => {
				expect(concat(initialRD, initialRD)).toBe(initialRD);
				expect(concat(initialRD, pendingRD)).toBe(pendingRD);
				expect(concat(initialRD, failureRD)).toBe(failureRD);
				expect(concat(initialRD, refreshRD)).toBe(refreshRD);
				expect(concat(initialRD, successRD)).toBe(successRD);
			});
			it('pending', () => {
				expect(concat(pendingRD, initialRD)).toBe(pendingRD);
				expect(concat(pendingRD, pendingRD)).toBe(pendingRD);
				expect(concat(pendingRD, failureRD)).toBe(failureRD);
				expect(concat(pendingRD, refreshRD)).toBe(refreshRD);
				expect(concat(pendingRD, successRD)).toBe(successRD);
			});
			it('failure', () => {
				expect(concat(failureRD, initialRD)).toBe(failureRD);
				expect(concat(failureRD, pendingRD)).toBe(failureRD);
				expect(concat(failure('foo'), failure('bar'))).toEqual(failure(semigroupString.concat('foo', 'bar')));
				expect(concat(failureRD, refreshRD)).toBe(refreshRD);
				expect(concat(failureRD, successRD)).toBe(successRD);
			});
			it('success', () => {
				expect(concat(successRD, initialRD)).toBe(successRD);
				expect(concat(successRD, pendingRD)).toBe(successRD);
				expect(concat(successRD, failureRD)).toBe(successRD);
				expect(concat(success(1), refresh(1))).toEqual(refresh(semigroupSum.concat(1, 1)));
				expect(concat(refresh(1), success(1))).toEqual(refresh(semigroupSum.concat(1, 1)));
				expect(concat(success(1), success(1))).toEqual(success(semigroupSum.concat(1, 1)));
			});
		});
	});
	describe('Monoid', () => {
		it('getMonoid', () => {
			const empty = getMonoid(monoidString, monoidSum).empty;
			expect(empty).toBe(initial);
		});
	});
	describe('helpers', () => {
		describe('combine', () => {
			it('should combine all initials to initial', () => {
				expect(combine(initial, initial)).toBe(initial);
			});
			it('should combine all pendings to pending', () => {
				expect(combine(pending, pending)).toBe(pending);
			});
			it('should combine all failures to first failure', () => {
				expect(combine(failure('foo'), failure('bar'))).toEqual(failure('foo'));
			});
			it('should combine all refreshes to refresh of list of values', () => {
				expect(combine(refresh('foo'), refresh('bar'))).toEqual(refresh(['foo', 'bar']));
			});
			it('should combine all successes to success of list of values', () => {
				expect(combine(success('foo'), success('bar'))).toEqual(success(['foo', 'bar']));
			});
			it('should combine arbitrary values to first initial', () => {
				const values = [success(123), success('foo'), failure('bar'), pending, initial];
				expect(combine.apply(null, values)).toBe(initial);
				expect(combine.apply(null, values.reverse())).toBe(initial);
			});
			it('should combine arbitrary values to first pending', () => {
				const values = [success(123), success('foo'), failure('bar'), pending];
				expect(combine.apply(null, values)).toBe(pending);
				expect(combine.apply(null, values.reverse())).toBe(pending);
			});
			it('should combine arbitrary values to first failure', () => {
				const values = [success(123), refresh(321), success('foo'), failure('bar')];
				expect(combine.apply(null, values)).toEqual(failure('bar'));
				expect(combine.apply(null, values.reverse())).toEqual(failure('bar'));
			});
		});
		describe('fromOption', () => {
			const error = new Error('foo');
			it('none', () => {
				expect(fromOption(none, () => error)).toEqual(failure(error));
			});
			it('some', () => {
				expect(fromOption(some(123), () => error)).toEqual(success(123));
			});
		});
		describe('fromEither', () => {
			it('left', () => {
				expect(fromEither(left('123'))).toEqual(failure('123'));
			});
			it('right', () => {
				expect(fromEither(right('123'))).toEqual(success('123'));
			});
		});
		describe('fromPredicate', () => {
			const factory = fromPredicate((value: boolean) => value, () => '123');
			it('false', () => {
				expect(factory(false)).toEqual(failure('123'));
			});
			it('true', () => {
				expect(factory(true)).toEqual(success(true));
			});
		});
	});
	describe('instance methods', () => {
		describe('caseOf', () => {
			const caseMap = {
				initial: 1,
				pending: 2,
				failure: () => 3,
				refresh: () => 4,
				success: () => 5,
			};
			it('initial', () => {
				expect(initialRD.caseOf(caseMap)).toBe(
					initialRD.fold(caseMap.initial, caseMap.pending, caseMap.failure, caseMap.refresh, caseMap.success),
				);
			});
			it('pending', () => {
				expect(pendingRD.caseOf(caseMap)).toBe(
					pendingRD.fold(caseMap.initial, caseMap.pending, caseMap.failure, caseMap.refresh, caseMap.success),
				);
			});
			it('failure', () => {
				expect(failureRD.caseOf(caseMap)).toBe(
					failureRD.fold(caseMap.initial, caseMap.pending, caseMap.failure, caseMap.refresh, caseMap.success),
				);
			});
			it('refresh', () => {
				expect(refreshRD.caseOf(caseMap)).toBe(
					refreshRD.fold(caseMap.initial, caseMap.pending, caseMap.failure, caseMap.refresh, caseMap.success),
				);
			});
			it('success', () => {
				expect(successRD.caseOf(caseMap)).toBe(
					successRD.fold(caseMap.initial, caseMap.pending, caseMap.failure, caseMap.refresh, caseMap.success),
				);
			});
		});
		describe('getOrElse', () => {
			it('initial', () => {
				expect(initialRD.getOrElse(0)).toBe(0);
			});
			it('pending', () => {
				expect(pendingRD.getOrElse(0)).toBe(0);
			});
			it('failure', () => {
				expect(failureRD.getOrElse(0)).toBe(0);
			});
			it('success', () => {
				expect(success(1).getOrElse(0)).toBe(1);
			});
		});
		describe('getOrElseL', () => {
			it('initial', () => {
				expect(initialRD.getOrElseL(() => 0)).toBe(0);
			});
			it('pending', () => {
				expect(pendingRD.getOrElseL(() => 0)).toBe(0);
			});
			it('failure', () => {
				expect(failureRD.getOrElseL(() => 0)).toBe(0);
			});
			it('success', () => {
				expect(success(1).getOrElseL(() => 0)).toBe(1);
			});
		});
		describe('fold', () => {
			it('initial', () => {
				expect(initialRD.fold(1, 2, () => 3, () => 4, () => 5)).toBe(1);
			});
			it('pending', () => {
				expect(pendingRD.fold(1, 2, () => 3, () => 4, () => 5)).toBe(2);
			});
			it('failure', () => {
				expect(failureRD.fold(1, 2, () => 3, () => 4, () => 5)).toBe(3);
			});
			it('refresh', () => {
				expect(refreshRD.fold(1, 2, () => 3, () => 4, () => 5)).toBe(4);
			});
			it('success', () => {
				expect(successRD.fold(1, 2, () => 3, () => 4, () => 5)).toBe(5);
			});
		});
		describe('foldL', () => {
			it('initial', () => {
				expect(initialRD.foldL(() => 1, () => 2, () => 3, () => 4, () => 5)).toBe(1);
			});
			it('pending', () => {
				expect(pendingRD.foldL(() => 1, () => 2, () => 3, () => 4, () => 5)).toBe(2);
			});
			it('failure', () => {
				expect(failureRD.foldL(() => 1, () => 2, () => 3, () => 4, () => 5)).toBe(3);
			});
			it('refresh', () => {
				expect(refreshRD.foldL(() => 1, () => 2, () => 3, () => 4, () => 5)).toBe(4);
			});
			it('success', () => {
				expect(successRD.foldL(() => 1, () => 2, () => 3, () => 4, () => 5)).toBe(5);
			});
		});
		describe('altL', () => {
			it('initial', () => {
				expect(initialRD.altL(() => initialRD)).toBe(initialRD);
				expect(initialRD.altL(() => pendingRD)).toBe(pendingRD);
				expect(initialRD.altL(() => failureRD)).toBe(failureRD);
				expect(initialRD.altL(() => refreshRD)).toBe(refreshRD);
				expect(initialRD.altL(() => successRD)).toBe(successRD);
			});
			it('pending', () => {
				expect(pendingRD.altL(() => initialRD)).toBe(initialRD);
				expect(pendingRD.altL(() => pendingRD)).toBe(pendingRD);
				expect(pendingRD.altL(() => failureRD)).toBe(failureRD);
				expect(pendingRD.altL(() => refreshRD)).toBe(refreshRD);
				expect(pendingRD.altL(() => successRD)).toBe(successRD);
			});
			it('failure', () => {
				expect(failureRD.altL(() => pendingRD)).toBe(pendingRD);
				expect(failureRD.altL(() => initialRD)).toBe(initialRD);
				expect(failureRD.altL(() => failureRD)).toBe(failureRD);
				expect(failureRD.altL(() => refreshRD)).toBe(refreshRD);
				expect(failureRD.altL(() => successRD)).toBe(successRD);
			});
			it('refresh', () => {
				expect(refreshRD.altL(() => pendingRD)).toBe(refreshRD);
				expect(refreshRD.altL(() => initialRD)).toBe(refreshRD);
				expect(refreshRD.altL(() => failureRD)).toBe(refreshRD);
				expect(refreshRD.altL(() => refreshRD)).toBe(refreshRD);
				expect(refreshRD.altL(() => successRD)).toBe(successRD);
			});
			it('success', () => {
				expect(successRD.altL(() => pendingRD)).toBe(successRD);
				expect(successRD.altL(() => initialRD)).toBe(successRD);
				expect(successRD.altL(() => failureRD)).toBe(successRD);
				expect(successRD.altL(() => refreshRD)).toBe(refreshRD);
				expect(successRD.altL(() => successRD)).toBe(successRD);
			});
		});
		describe('mapLeft', () => {
			const f2 = () => 1;
			it('initial', () => {
				expect(initialRD.mapLeft(f2)).toBe(initialRD);
			});
			it('pending', () => {
				expect(pendingRD.mapLeft(f2)).toBe(pendingRD);
			});
			it('failure', () => {
				expect(failureRD.mapLeft(f2)).toEqual(failure(1));
			});
			it('refresh', () => {
				expect(refreshRD.mapLeft(f2)).toBe(refreshRD);
			});
			it('success', () => {
				expect(successRD.mapLeft(f2)).toBe(successRD);
			});
		});
		describe('isInitial', () => {
			it('initial', () => {
				expect(initialRD.isInitial()).toBe(true);
			});
			it('pending', () => {
				expect(pendingRD.isInitial()).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.isInitial()).toEqual(false);
			});
			it('refresh', () => {
				expect(refreshRD.isInitial()).toBe(false);
			});
			it('success', () => {
				expect(successRD.isInitial()).toBe(false);
			});
		});
		describe('isPending', () => {
			it('initial', () => {
				expect(initialRD.isPending()).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.isPending()).toBe(true);
			});
			it('failure', () => {
				expect(failureRD.isPending()).toEqual(false);
			});
			it('refresh', () => {
				expect(refreshRD.isPending()).toBe(false);
			});
			it('success', () => {
				expect(successRD.isPending()).toBe(false);
			});
		});
		describe('isFailure', () => {
			it('initial', () => {
				expect(initialRD.isFailure()).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.isFailure()).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.isFailure()).toEqual(true);
				if (failureRD.isFailure()) {
					expect(failureRD.error).toBeDefined();
				}
			});
			it('refresh', () => {
				expect(refreshRD.isFailure()).toBe(false);
			});
			it('success', () => {
				expect(successRD.isFailure()).toBe(false);
			});
		});
		describe('isRefresh', () => {
			it('initial', () => {
				expect(initialRD.isRefresh()).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.isRefresh()).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.isRefresh()).toEqual(false);
			});
			it('refresh', () => {
				expect(refreshRD.isRefresh()).toBe(true);
				if (refreshRD.isRefresh()) {
					expect(refreshRD.value).toBeDefined();
				}
			});
			it('success', () => {
				expect(successRD.isRefresh()).toEqual(false);
			});
		});
		describe('isSuccess', () => {
			it('initial', () => {
				expect(initialRD.isSuccess()).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.isSuccess()).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.isSuccess()).toEqual(false);
			});
			it('refresh', () => {
				expect(refreshRD.isSuccess()).toEqual(false);
			});
			it('success', () => {
				expect(successRD.isSuccess()).toBe(true);
				if (successRD.isSuccess()) {
					expect(successRD.value).toBeDefined();
				}
			});
		});
		describe('toOption', () => {
			it('initial', () => {
				expect(initialRD.toOption()).toBe(none);
			});
			it('pending', () => {
				expect(pendingRD.toOption()).toBe(none);
			});
			it('failure', () => {
				expect(failureRD.toOption()).toBe(none);
			});
			it('refresh', () => {
				expect(refresh(1).toOption()).toEqual(some(1));
			});
			it('success', () => {
				expect(success(1).toOption()).toEqual(some(1));
			});
		});
		describe('toNullable', () => {
			it('initial', () => {
				expect(initialRD.toNullable()).toBe(null);
			});
			it('pending', () => {
				expect(pendingRD.toNullable()).toBe(null);
			});
			it('failure', () => {
				expect(failureRD.toNullable()).toBe(null);
			});
			it('refresh', () => {
				expect(refresh(1).toNullable()).toEqual(1);
			});
			it('success', () => {
				expect(success(1).toNullable()).toEqual(1);
			});
		});
		describe('toString', () => {
			it('initial', () => {
				expect(initialRD.toString()).toBe('initial');
			});
			it('pending', () => {
				expect(pendingRD.toString()).toBe('pending');
			});
			it('failure', () => {
				expect(failure('foo').toString()).toBe('failure("foo")');
			});
			it('refresh', () => {
				expect(refresh(1).toString()).toBe('refresh(1)');
			});
			it('success', () => {
				expect(success(1).toString()).toBe('success(1)');
			});
		});
		describe('contains', () => {
			it('initial', () => {
				expect(initialRD.contains(setoidNumber, 1)).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.contains(setoidNumber, 1)).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.contains(setoidNumber, 1)).toBe(false);
			});
			it('refresh', () => {
				expect(refresh(2).contains(setoidNumber, 1)).toBe(false);
				expect(refresh(1).contains(setoidNumber, 1)).toBe(true);
			});
			it('success', () => {
				expect(success(2).contains(setoidNumber, 1)).toBe(false);
				expect(success(1).contains(setoidNumber, 1)).toBe(true);
			});
		});
		describe('exists', () => {
			const p = (n: number) => n === 1;
			it('initial', () => {
				expect(initialRD.exists(p)).toBe(false);
			});
			it('pending', () => {
				expect(pendingRD.exists(p)).toBe(false);
			});
			it('failure', () => {
				expect(failureRD.exists(p)).toBe(false);
			});
			it('refresh', () => {
				expect(refresh(2).exists(p)).toBe(false);
				expect(refresh(1).exists(p)).toBe(true);
			});
			it('success', () => {
				expect(success(2).exists(p)).toBe(false);
				expect(success(1).exists(p)).toBe(true);
			});
		});
	});
});
