/**
 * Utility that creates a `HTMLTemplateElement` out of string markup or an existing DOM node.
 *
 * It is idempotent in the sense that passing in an existing template element will simply return that template element,
 * so it is always safe to pass in a node without causing unnecessary DOM parsing or template creation.
 */
export interface ITemplateElementFactory {
    createTemplate(input: string | Node): HTMLTemplateElement;
}
export declare const ITemplateElementFactory: import("@aurelia/kernel").InterfaceSymbol<ITemplateElementFactory>;
export declare class TemplateElementFactory implements ITemplateElementFactory {
    private t;
    createTemplate(input: string | Node): HTMLTemplateElement;
}
//# sourceMappingURL=template-element-factory.d.ts.map