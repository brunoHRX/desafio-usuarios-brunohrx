import { IInstruction } from './instructions';
import { AttrSyntax } from './attribute-pattern';
import { BindingCommandInstance } from './binding-command';
import type { IContainer, Constructable, IRegistry } from '@aurelia/kernel';
import type { IAttributeComponentDefinition, ICompiledElementComponentDefinition, IComponentBindablePropDefinition, IElementComponentDefinition } from './interfaces-template-compiler';
import { ITemplateCompiler } from './interfaces-template-compiler';
export declare const generateElementName: () => string;
export declare class TemplateCompiler implements ITemplateCompiler {
    static register: <C extends Constructable>(this: C, container: IContainer) => void;
    debug: boolean;
    resolveResources: boolean;
    compile(definition: IElementComponentDefinition, container: IContainer): ICompiledElementComponentDefinition;
    compileSpread(requestor: IElementComponentDefinition, attrSyntaxs: AttrSyntax[], container: IContainer, target: Element, targetDef?: IElementComponentDefinition): IInstruction[];
}
export interface IAttributeBindablesInfo {
    readonly attrs: Record<string, IComponentBindablePropDefinition>;
    readonly bindables: Record<string, IComponentBindablePropDefinition>;
    readonly primary: IComponentBindablePropDefinition;
}
export interface IElementBindablesInfo {
    readonly attrs: Record<string, IComponentBindablePropDefinition>;
    readonly bindables: Record<string, IComponentBindablePropDefinition>;
    readonly primary: null;
}
export interface IResourceResolver<TElementDef extends IElementComponentDefinition = IElementComponentDefinition, TAttrDef extends IAttributeComponentDefinition = IAttributeComponentDefinition> {
    el(c: IContainer, name: string): TElementDef | null;
    attr(c: IContainer, name: string): TAttrDef | null;
    bindables(def: TAttrDef): IAttributeBindablesInfo;
    bindables(def: TElementDef): IElementBindablesInfo;
    bindables(def: TAttrDef | TElementDef): IAttributeBindablesInfo | IElementBindablesInfo;
}
export declare const IResourceResolver: import("@aurelia/kernel").InterfaceSymbol<IResourceResolver<IElementComponentDefinition<string>, IAttributeComponentDefinition<string>>>;
export interface IBindingCommandResolver {
    get(c: IContainer, name: string): BindingCommandInstance | null;
}
export declare const IBindingCommandResolver: import("@aurelia/kernel").InterfaceSymbol<IBindingCommandResolver>;
/**
 * An interface describing the hooks a compilation process should invoke.
 *
 * A feature available to the default template compiler.
 */
export declare const ITemplateCompilerHooks: import("@aurelia/kernel").InterfaceSymbol<ITemplateCompilerHooks>;
export interface ITemplateCompilerHooks {
    /**
     * Should be invoked immediately before a template gets compiled
     */
    compiling?(template: HTMLElement): void;
}
export declare const TemplateCompilerHooks: Readonly<{
    name: string;
    define<K extends ITemplateCompilerHooks, T extends Constructable<K>>(Type: T): IRegistry;
    findAll(container: IContainer): readonly ITemplateCompilerHooks[];
}>;
/**
 * Decorator: Indicates that the decorated class is a template compiler hooks.
 *
 * An instance of this class will be created and appropriate compilation hooks will be invoked
 * at different phases of the default compiler.
 */
export declare const templateCompilerHooks: <T extends Constructable>(target?: T, context?: ClassDecoratorContext) => any;
//# sourceMappingURL=template-compiler.d.ts.map