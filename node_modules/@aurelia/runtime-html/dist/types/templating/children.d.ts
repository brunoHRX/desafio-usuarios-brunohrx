import { type IServiceLocator } from '@aurelia/kernel';
import { type ISubscriberCollection } from '@aurelia/runtime';
import { type ICustomElementViewModel } from './controller';
import { IBinding } from '../binding/interfaces-bindings';
/**
 * An interface describing options to observe the children elements of a custom element host
 */
export type PartialChildrenDefinition<TQuery extends string = string> = {
    query?: TQuery;
    callback?: PropertyKey;
    name?: PropertyKey;
    filter?: (node: TQuery extends '$all' ? Node : HTMLElement, viewModel: ICustomElementViewModel | null) => boolean;
    map?: (node: TQuery extends '$all' ? Node : HTMLElement, viewModel: ICustomElementViewModel | null) => unknown;
};
/**
 * Decorator: Specifies custom behavior for an array children property that synchronizes its items with child content nodes of the element.
 *
 * @param config - The overrides
 */
export declare function children<TThis, TValue, TQuery extends string>(config?: PartialChildrenDefinition<TQuery>): (target: undefined, context: ClassFieldDecoratorContext<TThis, TValue>) => void;
/**
 * Decorator: Specifies an array property on a class that synchronizes its items with child content nodes of the element.
 *
 * @param selector - The CSS element selector for filtering children. Use `$all` to select everything including non element nodes.
 * If nothing is provided, it defaults to `*`, which means all elements
 */
export declare function children<TThis, TValue>(selector: string): (target: undefined, context: ClassFieldDecoratorContext<TThis, TValue>) => void;
/**
 * Decorator: Decorator: Specifies an array property that synchronizes its items with child content nodes of the element.
 *
 * @param target - The class
 * @param prop - The property name
 */
export declare function children<TThis, TValue>(target: undefined, context: ClassFieldDecoratorContext<TThis, TValue>): void;
export declare namespace children {
    var mixed: boolean;
}
export interface ChildrenBinding extends ISubscriberCollection {
}
/**
 * A binding for observing & notifying the children of a custom element.
 */
export declare class ChildrenBinding implements IBinding {
    isBound: boolean;
    readonly obj: ICustomElementViewModel;
    constructor(host: HTMLElement, obj: ICustomElementViewModel, callback: undefined | (() => void), query: string, filter?: (node: Node, viewModel: ICustomElementViewModel | null) => boolean, map?: (node: Node, viewModel: ICustomElementViewModel | null) => unknown);
    getValue(): unknown[];
    setValue(_value: unknown): void;
    bind(): void;
    unbind(): void;
    get(): ReturnType<IServiceLocator['get']>;
}
//# sourceMappingURL=children.d.ts.map