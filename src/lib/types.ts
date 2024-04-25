import type {
	ReferenceElement,
	FloatingElement,
	Placement,
	Strategy,
	Middleware,
	MiddlewareData
} from '@floating-ui/dom';
import type { ReadableBox } from './box.svelte.js';

export type Getter<T> = () => T;
export type MaybeGetter<T> = T | (() => T);
export type MaybeBoxOrGetter<T> = T | Getter<T> | ReadableBox<T>;
export type Expand<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

export interface UseFloatingOptions {
	placement?: MaybeGetter<Placement>;
	strategy?: MaybeGetter<Strategy>;
	transform?: MaybeGetter<boolean>;
	middleware?: MaybeGetter<Array<Middleware | undefined | null | false>>;
	elements?: {
		reference?: ReferenceElement | null | undefined;
		floating?: FloatingElement | null | undefined;
	};
	open?: MaybeGetter<boolean>;
}

export interface UseFloatingReturn {
	placement: Placement;
	strategy: Strategy;
	x: number;
	y: number;
	middlewareData: MiddlewareData;
	isPositioned: boolean;
	update: () => void;
	floatingStyles: string;
	refs: {
		reference: ReferenceElement | null | undefined;
		floating: FloatingElement | null | undefined;
	};
}

export interface FloatingContext {
	open: boolean;
	refs: UseFloatingReturn['refs'];
}
