import type { AccessorType, IAccessor } from '@aurelia/runtime';
export declare class StyleAttributeAccessor implements IAccessor {
    readonly obj: HTMLElement;
    type: AccessorType;
    styles: Record<string, number>;
    version: number;
    constructor(obj: HTMLElement);
    getValue(): string;
    setValue(newValue: unknown): void;
    setProperty(style: string, value: string): void;
    bind(): void;
}
//# sourceMappingURL=style-attribute-accessor.d.ts.map