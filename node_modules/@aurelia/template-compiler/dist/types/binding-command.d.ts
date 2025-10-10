import { IExpressionParser } from '@aurelia/expression-parser';
import { IAttrMapper } from './attribute-mapper';
import { PropertyBindingInstruction } from './instructions';
import type { Constructable, IContainer, IServiceLocator, PartialResourceDefinition, ResourceDefinition, ResourceType } from '@aurelia/kernel';
import { AttrSyntax } from './attribute-pattern';
import { IAttributeComponentDefinition, IElementComponentDefinition, IComponentBindablePropDefinition } from './interfaces-template-compiler';
import type { IInstruction } from './instructions';
export type PartialBindingCommandDefinition = PartialResourceDefinition;
export type BindingCommandStaticAuDefinition = PartialBindingCommandDefinition & {
    type: 'binding-command';
};
export interface IPlainAttrCommandInfo {
    readonly node: Element;
    readonly attr: AttrSyntax;
    readonly bindable: null;
    readonly def: null;
}
export interface IBindableCommandInfo {
    readonly node: Element;
    readonly attr: AttrSyntax;
    readonly bindable: IComponentBindablePropDefinition;
    readonly def: IAttributeComponentDefinition | IElementComponentDefinition;
}
export type ICommandBuildInfo = IPlainAttrCommandInfo | IBindableCommandInfo;
export type BindingCommandInstance<T extends {} = {}> = {
    /**
     * Characteristics of a binding command.
     * - `false`: The normal process (check custom attribute -> check bindable -> command.build()) should take place.
     * - `true`: The binding command wants to take over the processing of an attribute. The template compiler keeps the attribute as is in compilation, instead of executing the normal process.
     */
    ignoreAttr: boolean;
    build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): IInstruction;
} & T;
export type BindingCommandType<T extends Constructable = Constructable> = ResourceType<T, BindingCommandInstance, PartialBindingCommandDefinition>;
export type BindingCommandKind = {
    readonly name: string;
    keyFrom(name: string): string;
    define<T extends Constructable>(name: string, Type: T): BindingCommandType<T>;
    define<T extends Constructable>(def: PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: T): BindingCommandType<T>;
    getAnnotation<K extends keyof PartialBindingCommandDefinition>(Type: Constructable, prop: K): PartialBindingCommandDefinition[K] | undefined;
    find(container: IContainer, name: string): BindingCommandDefinition | null;
    get(container: IServiceLocator, name: string): BindingCommandInstance;
};
export type BindingCommandDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext) => BindingCommandType<T>;
/**
 * Decorator to describe a class as a binding command resource
 */
export declare function bindingCommand(name: string): BindingCommandDecorator;
export declare function bindingCommand(definition: PartialBindingCommandDefinition): BindingCommandDecorator;
export declare class BindingCommandDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, BindingCommandInstance> {
    readonly Type: BindingCommandType<T>;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly key: string;
    private constructor();
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialBindingCommandDefinition, Type: BindingCommandType<T>): BindingCommandDefinition<T>;
    register(container: IContainer, aliasName?: string | undefined): void;
}
export declare const BindingCommand: Readonly<BindingCommandKind>;
export declare class OneTimeBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class ToViewBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class FromViewBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class TwoWayBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class DefaultBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser, attrMapper: IAttrMapper): PropertyBindingInstruction;
}
export declare class ForBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
export declare class TriggerBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
export declare class CaptureBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
export declare class AttrBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
export declare class StyleBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
export declare class ClassBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
export declare class RefBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
export declare class SpreadValueBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo): IInstruction;
}
//# sourceMappingURL=binding-command.d.ts.map