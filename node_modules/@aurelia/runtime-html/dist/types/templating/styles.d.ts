import { IContainer } from '@aurelia/kernel';
import { IPlatform } from '../platform';
import type { IRegistry } from '@aurelia/kernel';
/**
 * There are 2 implementations of CSS registry: css module registry and shadow dom registry.
 *
 * - CSS registry alters the way class bindings work via altering templates and register interfaces that will alter bindings to class attribute.
 *
 * - Shadow dom registry regisiters some interfaces with the custom element container to handle shadow dom styles.
 * Shadow DOM abtraction summary:
 * CSS registry ---(register)---> IShadowDOMStyleFactory ---(createStyles)---> IShadowDOMStyles ---(applyTo)---> ShadowRoot
 */
/**
 * create a registry to register CSS module handling for a custom element.
 * The resulting registry can be registered as a dependency of a custom element.
 */
export declare function cssModules(...modules: (Record<string, string>)[]): CSSModulesProcessorRegistry;
export declare class CSSModulesProcessorRegistry implements IRegistry {
    private readonly modules;
    constructor(modules: Record<string, string>[]);
    register(container: IContainer): void;
}
/**
 * Creates a registry to register shadow dom styles handling for a custom element.
 * The resulting registry can be registered as a dependency of a custom element.
 */
export declare function shadowCSS(...css: (string | CSSStyleSheet)[]): ShadowDOMRegistry;
export interface IShadowDOMStyleFactory {
    createStyles(localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles;
}
export declare const IShadowDOMStyleFactory: import("@aurelia/kernel").InterfaceSymbol<IShadowDOMStyleFactory>;
export declare class ShadowDOMRegistry implements IRegistry {
    private readonly css;
    constructor(css: (string | CSSStyleSheet)[]);
    register(container: IContainer): void;
}
type HasAdoptedStyleSheets = ShadowRoot & {
    adoptedStyleSheets: CSSStyleSheet[];
};
export interface IShadowDOMStyles {
    applyTo(shadowRoot: ShadowRoot): void;
}
export declare const IShadowDOMStyles: import("@aurelia/kernel").InterfaceSymbol<IShadowDOMStyles>;
export declare const IShadowDOMGlobalStyles: import("@aurelia/kernel").InterfaceSymbol<IShadowDOMStyles>;
export declare class AdoptedStyleSheetsStyles implements IShadowDOMStyles {
    private readonly sharedStyles;
    private readonly styleSheets;
    constructor(p: IPlatform, localStyles: (string | CSSStyleSheet)[], styleSheetCache: Map<string, CSSStyleSheet>, sharedStyles?: IShadowDOMStyles | null);
    static supported(p: IPlatform): boolean;
    applyTo(shadowRoot: HasAdoptedStyleSheets): void;
}
export declare class StyleElementStyles implements IShadowDOMStyles {
    private readonly p;
    private readonly localStyles;
    private readonly sharedStyles;
    constructor(p: IPlatform, localStyles: string[], sharedStyles?: IShadowDOMStyles | null);
    applyTo(shadowRoot: ShadowRoot): void;
}
export interface IShadowDOMConfiguration {
    sharedStyles?: (string | CSSStyleSheet)[];
}
export declare const StyleConfiguration: {
    shadowDOM(config: IShadowDOMConfiguration): IRegistry;
};
export {};
//# sourceMappingURL=styles.d.ts.map