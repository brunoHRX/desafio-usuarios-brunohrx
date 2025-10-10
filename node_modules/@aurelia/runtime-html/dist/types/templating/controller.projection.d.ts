import { type ISubscribable } from '@aurelia/runtime';
import { PartialCustomElementDefinition } from '../resources/custom-element';
export type PartialSlottedDefinition = {
    callback?: PropertyKey;
    slotName?: string;
    query?: string;
};
export type IAuSlotProjections = Record<string, PartialCustomElementDefinition>;
export interface IAuSlotsInfo {
    /**
     * Name of the slots to which content are projected.
     */
    readonly projectedSlots: readonly string[];
}
/**
 * Describing the projection information statically available for a custom element
 */
export declare const IAuSlotsInfo: import("@aurelia/kernel").InterfaceSymbol<IAuSlotsInfo>;
export declare class AuSlotsInfo implements IAuSlotsInfo {
    readonly projectedSlots: string[];
    constructor(projectedSlots: string[]);
}
/**
 * Describe the interface of a slot
 */
export interface IAuSlot {
    readonly name: string;
    readonly nodes: readonly Node[];
    /** Add subscriber to the change listener list of this slot */
    subscribe(subscriber: IAuSlotSubscriber): void;
    /** Remove subscriber from the change listener list of this slot */
    unsubscribe(subscriber: IAuSlotSubscriber): void;
}
export interface IAuSlotSubscriber {
    handleSlotChange(slot: IAuSlot, nodes: Node[]): void;
}
/**
 * Describes the interface of a <au-slot> watcher
 */
export interface IAuSlotWatcher extends ISubscribable {
    readonly slotName: string;
    watch(slot: IAuSlot): void;
    unwatch(slot: IAuSlot): void;
}
export declare const IAuSlotWatcher: import("@aurelia/kernel").InterfaceSymbol<IAuSlotWatcher>;
type Tc39PropertyDecorator = (target: undefined, context: ClassFieldDecoratorContext) => (initialValue: any) => any;
/**
 * Decorate a property of a class to get updates from the projection of the decorated custom element
 */
export declare function slotted(): Tc39PropertyDecorator;
/**
 * Decorate a property of a class to get updates from the projection of the decorated custom element
 *
 * @param query - the query select used to match each slotted node of the corresponding <au-slot>
 * If * is provided, then it'll get all nodes (including text nodes)
 */
export declare function slotted(query: string): Tc39PropertyDecorator;
/**
 * Decorate a property of a class to get updates from the projection of the decorated custom element
 *
 * @param query - the query select used to match each slotted node of the corresponding <au-slot>
 * If * is provided, then it'll get all nodes (including text nodes)
 * @param slotName - the name of the <au-slot> this slotted decorator is targeting.
 * If * is provided, then it'll get all nodes from all <au-slot>
 */
export declare function slotted(query: string, slotName: string): Tc39PropertyDecorator;
/**
 * Decorate a property of a class to get updates from the projection of the decorated custom element
 *
 * @param def - The configuration of the slotted decorator.
 */
export declare function slotted(def: PartialSlottedDefinition): Tc39PropertyDecorator;
export declare function slotted(queryOrDef?: string | PartialSlottedDefinition, slotName?: string): Tc39PropertyDecorator;
export {};
//# sourceMappingURL=controller.projection.d.ts.map