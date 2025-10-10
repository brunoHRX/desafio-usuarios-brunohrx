import { Key } from '@aurelia/kernel';
import { BindingMode } from '../binding/interfaces-bindings';
import type { Constructable, IContainer, ResourceDefinition, PartialResourceDefinition, ResourceType } from '@aurelia/kernel';
import type { BindableDefinition, PartialBindableDefinition } from '../bindable';
import type { ICustomAttributeViewModel, ICustomAttributeController } from '../templating/controller';
import type { IWatchDefinition } from '../watch';
import { type IResourceKind } from './resources-shared';
import { IAttributeComponentDefinition } from '@aurelia/template-compiler';
export type PartialCustomAttributeDefinition<TBindables extends string = string> = PartialResourceDefinition<Omit<IAttributeComponentDefinition, 'type'> & {
    readonly defaultBindingMode?: string | number;
    readonly isTemplateController?: boolean;
    readonly bindables?: (Record<TBindables, true | Omit<PartialBindableDefinition, 'name'>>) | (TBindables | PartialBindableDefinition & {
        name: TBindables;
    })[];
    /**
     * A config that can be used by template compliler to change attr value parsing mode
     * `true` to always parse as a single value, mostly will be string in URL scenario
     * Example:
     * ```html
     * <div goto="http://bla.bla.com">
     * ```
     * With `noMultiBinding: true`, user does not need to escape the `:` with `\`
     * or use binding command to escape it.
     *
     * With `noMultiBinding: false (default)`, the above will be parsed as it's binding
     * to a property name `http`, with value equal to literal string `//bla.bla.com`
     */
    readonly noMultiBindings?: boolean;
    readonly watches?: IWatchDefinition[];
    readonly dependencies?: readonly Key[];
    /**
     * **Only used by template controller custom attributes.**
     *
     * Container strategy for the view factory of this template controller.
     *
     * By default, the view factory will be reusing the container of the parent view (controller),
     * as this container has information about the resources registered.
     *
     * Specify `'new'` to create a new container for the view factory.
     */
    readonly containerStrategy?: 'reuse' | 'new';
}>;
export type CustomAttributeStaticAuDefinition<TBindables extends string = string> = PartialCustomAttributeDefinition<TBindables> & {
    type: 'custom-attribute';
};
export type CustomAttributeType<T extends Constructable = Constructable> = ResourceType<T, ICustomAttributeViewModel, PartialCustomAttributeDefinition>;
export type CustomAttributeKind = IResourceKind & {
    for<C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(node: Node, name: string): ICustomAttributeController<C> | undefined;
    closest<A extends object | Constructable, TType extends A extends Constructable<infer T extends object> ? Constructable<T> : Constructable<A> = A extends Constructable<infer T extends object> ? Constructable<T> : Constructable<A>>(node: Node, Type: CustomAttributeType<TType>): ICustomAttributeController<InstanceType<TType>> | null;
    closest<A extends object | Constructable, TType extends A extends Constructable<infer T extends object> ? Constructable<T> : Constructable<A> = A extends Constructable<infer T extends object> ? Constructable<T> : Constructable<A>>(node: Node, name: string): ICustomAttributeController<InstanceType<TType>> | null;
    isType<T>(value: T): value is (T extends Constructable ? CustomAttributeType<T> : never);
    define<T extends Constructable>(name: string, Type: T): CustomAttributeType<T>;
    define<T extends Constructable>(def: PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
    getDefinition<T extends Constructable>(Type: T, context?: DecoratorContext | null): CustomAttributeDefinition<T>;
    getDefinition<T extends Constructable>(Type: Function, context?: DecoratorContext | null): CustomAttributeDefinition<T>;
    annotate<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K, value: PartialCustomAttributeDefinition[K]): void;
    getAnnotation<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K, context: DecoratorContext | undefined | null): PartialCustomAttributeDefinition[K] | undefined;
    find(c: IContainer, name: string): CustomAttributeDefinition | null;
};
export type CustomAttributeDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext) => CustomAttributeType<T>;
/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export declare function customAttribute(definition: PartialCustomAttributeDefinition): CustomAttributeDecorator;
export declare function customAttribute(name: string): CustomAttributeDecorator;
export declare function customAttribute(nameOrDef: string | PartialCustomAttributeDefinition): CustomAttributeDecorator;
/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export declare function templateController(definition: Omit<PartialCustomAttributeDefinition, 'isTemplateController' | 'type'>): CustomAttributeDecorator;
export declare function templateController(name: string): CustomAttributeDecorator;
export declare function templateController(nameOrDef: string | Omit<PartialCustomAttributeDefinition, 'isTemplateController' | 'type'>): CustomAttributeDecorator;
export declare class CustomAttributeDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, ICustomAttributeViewModel, PartialCustomAttributeDefinition> {
    readonly Type: CustomAttributeType<T>;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly key: string;
    readonly defaultBindingMode: BindingMode;
    readonly isTemplateController: boolean;
    readonly bindables: Record<string, BindableDefinition>;
    readonly noMultiBindings: boolean;
    readonly watches: IWatchDefinition[];
    readonly dependencies: Key[];
    readonly containerStrategy: 'reuse' | 'new';
    static warnDuplicate: boolean;
    get type(): 'custom-attribute';
    private constructor();
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: CustomAttributeType<T>): CustomAttributeDefinition<T>;
    register(container: IContainer, aliasName?: string | undefined): void;
    toString(): string;
}
export declare const CustomAttribute: Readonly<CustomAttributeKind>;
//# sourceMappingURL=custom-attribute.d.ts.map