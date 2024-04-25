import type {
	ReferenceElement,
	FloatingElement,
	Placement,
	Strategy,
	Middleware,
	MiddlewareData
} from '@floating-ui/dom';

export interface UseFloatingOptions {
	placement?: Placement;
	strategy?: Strategy;
	transform?: boolean;
	middleware?: Array<Middleware | undefined | null | false>;
	elements?: {
		reference?: ReferenceElement | null | undefined;
		floating?: FloatingElement | null | undefined;
	};
	open?: boolean;
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
