import { IAttrMapper, type IsTwoWayPredicate } from '@aurelia/template-compiler';
export declare class AttrMapper implements IAttrMapper {
    static register: <C extends import("@aurelia/kernel").Constructable>(this: C, container: import("@aurelia/kernel").IContainer) => void;
    private readonly svg;
    constructor();
    /**
     * Allow application to teach Aurelia how to define how to map attributes to properties
     * based on element tagName
     */
    useMapping(config: Record<string, Record<string, PropertyKey>>): void;
    /**
     * Allow applications to teach Aurelia how to define how to map attributes to properties
     * for all elements
     */
    useGlobalMapping(config: Record<string, PropertyKey>): void;
    /**
     * Add a given function to a list of fns that will be used
     * to check if `'bind'` command can be understood as `'two-way'` command.
     */
    useTwoWay(fn: IsTwoWayPredicate): void;
    /**
     * Returns true if an attribute should be two way bound based on an element
     */
    isTwoWay(node: Element, attrName: string): boolean;
    /**
     * Retrieves the mapping information this mapper have for an attribute on an element
     */
    map(node: Element, attr: string): string | null;
}
//# sourceMappingURL=attribute-mapper.d.ts.map