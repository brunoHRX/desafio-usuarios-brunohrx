import { Constructable } from '@aurelia/kernel';
export declare function nowrap(): (target: unknown, context: ClassDecoratorContext | ClassFieldDecoratorContext) => void;
/**
 * A decorator to signal proxy observation shouldn't make an effort to wrap an object
 */
export declare function nowrap(target: Constructable, context: ClassDecoratorContext): void;
export declare function nowrap(target: undefined, context: ClassFieldDecoratorContext): void;
//# sourceMappingURL=proxy-decorators.d.ts.map