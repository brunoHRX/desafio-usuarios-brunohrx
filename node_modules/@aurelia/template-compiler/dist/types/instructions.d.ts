import { type ForOfStatement, type Interpolation, type IsBindingBehavior } from '@aurelia/expression-parser';
import { IAttributeComponentDefinition, IElementComponentDefinition } from './interfaces-template-compiler';
import { AttrSyntax } from './attribute-pattern';
import { BindingMode } from './binding-mode';
export declare const InstructionType: Readonly<{
    hydrateElement: "ra";
    hydrateAttribute: "rb";
    hydrateTemplateController: "rc";
    hydrateLetElement: "rd";
    setProperty: "re";
    interpolation: "rf";
    propertyBinding: "rg";
    letBinding: "ri";
    refBinding: "rj";
    iteratorBinding: "rk";
    multiAttr: "rl";
    textBinding: "ha";
    listenerBinding: "hb";
    attributeBinding: "hc";
    stylePropertyBinding: "hd";
    setAttribute: "he";
    setClassAttribute: "hf";
    setStyleAttribute: "hg";
    spreadTransferedBinding: "hs";
    spreadElementProp: "hp";
    spreadValueBinding: "svb";
}>;
export type InstructionType = typeof InstructionType[keyof typeof InstructionType];
export interface IInstruction {
    readonly type: string;
}
export declare const IInstruction: import("@aurelia/kernel").InterfaceSymbol<IInstruction>;
export declare function isInstruction(value: unknown): value is IInstruction;
export declare class InterpolationInstruction {
    from: string | Interpolation;
    to: string;
    readonly type = "rf";
    constructor(from: string | Interpolation, to: string);
}
export declare class PropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    mode: BindingMode;
    readonly type = "rg";
    constructor(from: string | IsBindingBehavior, to: string, mode: BindingMode);
}
export declare class IteratorBindingInstruction {
    forOf: string | ForOfStatement;
    to: string;
    props: MultiAttrInstruction[];
    readonly type = "rk";
    constructor(forOf: string | ForOfStatement, to: string, props: MultiAttrInstruction[]);
}
export declare class RefBindingInstruction {
    readonly from: string | IsBindingBehavior;
    readonly to: string;
    readonly type = "rj";
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetPropertyInstruction {
    value: unknown;
    to: string;
    readonly type = "re";
    constructor(value: unknown, to: string);
}
export declare class MultiAttrInstruction {
    value: string;
    to: string;
    command: string | null;
    readonly type = "rl";
    constructor(value: string, to: string, command: string | null);
}
export declare class HydrateElementInstruction<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>, TDef extends IElementComponentDefinition = IElementComponentDefinition> {
    /**
     * The name of the custom element this instruction is associated with
     */
    res: string | /* Constructable |  */ TDef;
    /**
     * Bindable instructions for the custom element instance
     */
    props: IInstruction[];
    /**
     * Indicates what projections are associated with the element usage
     */
    projections: Record<string, TDef> | null;
    /**
     * Indicates whether the usage of the custom element was with a containerless attribute or not
     */
    containerless: boolean;
    /**
     * A list of captured attr syntaxes
     */
    captures: AttrSyntax[] | undefined;
    /**
     * Any data associated with this instruction
     */
    readonly data: T;
    readonly type = "ra";
    constructor(
    /**
     * The name of the custom element this instruction is associated with
     */
    res: string | /* Constructable |  */ TDef, 
    /**
     * Bindable instructions for the custom element instance
     */
    props: IInstruction[], 
    /**
     * Indicates what projections are associated with the element usage
     */
    projections: Record<string, TDef> | null, 
    /**
     * Indicates whether the usage of the custom element was with a containerless attribute or not
     */
    containerless: boolean, 
    /**
     * A list of captured attr syntaxes
     */
    captures: AttrSyntax[] | undefined, 
    /**
     * Any data associated with this instruction
     */
    data: T);
}
export declare class HydrateAttributeInstruction<T extends IAttributeComponentDefinition = IAttributeComponentDefinition> {
    res: string | /* Constructable |  */ T;
    alias: string | undefined;
    /**
     * Bindable instructions for the custom attribute instance
     */
    props: IInstruction[];
    readonly type = "rb";
    constructor(res: string | /* Constructable |  */ T, alias: string | undefined, 
    /**
     * Bindable instructions for the custom attribute instance
     */
    props: IInstruction[]);
}
export declare class HydrateTemplateController<T extends IAttributeComponentDefinition = IAttributeComponentDefinition> {
    def: IElementComponentDefinition;
    res: string | /* Constructable |  */ T;
    alias: string | undefined;
    /**
     * Bindable instructions for the template controller instance
     */
    props: IInstruction[];
    readonly type = "rc";
    constructor(def: IElementComponentDefinition, res: string | /* Constructable |  */ T, alias: string | undefined, 
    /**
     * Bindable instructions for the template controller instance
     */
    props: IInstruction[]);
}
export declare class HydrateLetElementInstruction {
    instructions: LetBindingInstruction[];
    toBindingContext: boolean;
    readonly type = "rd";
    constructor(instructions: LetBindingInstruction[], toBindingContext: boolean);
}
export declare class LetBindingInstruction {
    from: string | IsBindingBehavior | Interpolation;
    to: string;
    readonly type = "ri";
    constructor(from: string | IsBindingBehavior | Interpolation, to: string);
}
export declare class TextBindingInstruction {
    from: string | IsBindingBehavior;
    readonly type = "ha";
    constructor(from: string | IsBindingBehavior);
}
export declare class ListenerBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    capture: boolean;
    modifier: string | null;
    readonly type = "hb";
    constructor(from: string | IsBindingBehavior, to: string, capture: boolean, modifier: string | null);
}
export declare class StylePropertyBindingInstruction {
    from: string | IsBindingBehavior;
    to: string;
    readonly type = "hd";
    constructor(from: string | IsBindingBehavior, to: string);
}
export declare class SetAttributeInstruction {
    value: string;
    to: string;
    readonly type = "he";
    constructor(value: string, to: string);
}
export declare class SetClassAttributeInstruction {
    readonly value: string;
    readonly type: typeof InstructionType.setClassAttribute;
    constructor(value: string);
}
export declare class SetStyleAttributeInstruction {
    readonly value: string;
    readonly type: typeof InstructionType.setStyleAttribute;
    constructor(value: string);
}
export declare class AttributeBindingInstruction {
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr: string;
    from: string | IsBindingBehavior;
    to: string;
    readonly type = "hc";
    constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr: string, from: string | IsBindingBehavior, to: string);
}
export declare class SpreadTransferedBindingInstruction {
    readonly type = "hs";
}
/**
 * When spreading any attribute bindings onto an element,
 * it's possible that some attributes will be targeting the bindable properties of a custom element
 * This instruction is used to express that
 */
export declare class SpreadElementPropBindingInstruction {
    readonly instruction: IInstruction;
    readonly type = "hp";
    constructor(instruction: IInstruction);
}
export declare class SpreadValueBindingInstruction {
    target: '$bindables' | '$element';
    from: string;
    readonly type = "svb";
    constructor(target: '$bindables' | '$element', from: string);
}
//# sourceMappingURL=instructions.d.ts.map