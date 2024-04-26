import type { Getter } from './types.js';

export type ReadableBox<T> = {
	readonly value: T;
};

export type WritableBox<T> = {
	value: T;
};

class StateBox<T> {
	value = $state<T>();

	constructor(initialValue: T) {
		this.value = initialValue;
	}
}

class DerivedBox<T> {
	#getter: Getter<T>;

	constructor(getter: Getter<T>) {
		this.#getter = getter;
	}

	readonly value = $derived.by(() => this.#getter());
}

class ReadonlyBox<T> {
	#box: ReadableBox<T>;

	constructor(box: ReadableBox<T>) {
		this.#box = box;
	}

	get value() {
		return this.#box.value;
	}
}

/**
 * Creates a writable box.
 *
 * @returns A box with a `value` property which can be set to a new value.
 * Useful to pass state to other functions.
 */
export function box<T>(): WritableBox<T | undefined>;

/**
 * Creates a writable box with an initial value.
 *
 * @param initialValue The initial value of the box.
 * @returns A box with a `value` property which can be set to a new value.
 * Useful to pass state to other functions.
 */
export function box<T>(initialValue: T): WritableBox<T>;

export function box<T>(initialValue?: T): WritableBox<T | undefined> {
	return new StateBox(initialValue);
}

box.derived = function <T>(getter: Getter<T>): ReadableBox<T> {
	return new DerivedBox(getter);
};

box.readonly = function <T>(box: ReadableBox<T>): ReadableBox<T> {
	return new ReadonlyBox(box);
};
