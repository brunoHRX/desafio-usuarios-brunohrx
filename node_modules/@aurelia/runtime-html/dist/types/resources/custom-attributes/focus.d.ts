import { type CustomAttributeStaticAuDefinition } from '../custom-attribute';
import type { ICustomAttributeController, ICustomAttributeViewModel } from '../../templating/controller';
/**
 * Focus attribute for element focus binding
 */
export declare class Focus implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    binding(): void;
    /**
     * Invoked everytime the bound value changes.
     *
     * @param newValue - The new value.
     */
    valueChanged(): void;
    /**
     * Invoked when the attribute is attached to the DOM.
     */
    attached(): void;
    /**
     * Invoked when the attribute is afterDetachChildren from the DOM.
     */
    detaching(): void;
    /**
     * EventTarget interface handler for better memory usage
     */
    handleEvent(e: FocusEvent): void;
}
//# sourceMappingURL=focus.d.ts.map