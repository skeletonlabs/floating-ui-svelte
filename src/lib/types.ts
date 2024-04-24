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
	middleware?: Array<Middleware | undefined | null | false>;
	transform?: boolean;
	elements?: {
		reference?: ReferenceElement | null;
		floating?: FloatingElement | null;
	};
}

export interface UseFloatingReturn {
	refs: {
		reference: ReferenceElement | null | undefined;
		floating: FloatingElement | null | undefined;
	};
	context: null;
	middlewareData: MiddlewareData;
	styles: string;
}
