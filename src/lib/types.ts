import type {
	ReferenceElement,
	FloatingElement,
	Placement,
	Strategy,
	Middleware,
	MiddlewareData
} from '@floating-ui/dom';

export type ValueOrGetter<T> = T | (() => T);

export interface UseFloatingOptions {
	placement?: ValueOrGetter<Placement>;
	strategy?: ValueOrGetter<Strategy>;
	transform?: ValueOrGetter<boolean>;
	middleware?: ValueOrGetter<Array<Middleware | undefined | null | false>>;
	elements?: {
		reference?: ValueOrGetter<ReferenceElement | null | undefined>;
		floating?: ValueOrGetter<FloatingElement | null | undefined>;
	};
	open?: ValueOrGetter<boolean>;
}

export interface UseFloatingReturn {
	context: FloatingContext;
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
