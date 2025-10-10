import type { AccessorType, IAccessor, IObserver } from '@aurelia/runtime';
export interface ClassAttributeAccessor extends IObserver {
}
export declare class ClassAttributeAccessor implements IAccessor {
    readonly obj: HTMLElement;
    readonly mapping: Record<string, string>;
    get doNotCache(): true;
    type: AccessorType;
    constructor(obj: HTMLElement, mapping?: Record<string, string>);
    getValue(): unknown;
    setValue(newValue: unknown): void;
}
//# sourceMappingURL=class-attribute-accessor.d.ts.map