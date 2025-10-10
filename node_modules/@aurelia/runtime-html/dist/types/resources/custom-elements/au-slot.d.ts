import { CustomElementStaticAuDefinition } from '../custom-element';
import type { ControllerVisitor, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller';
import { type IAuSlot, type IAuSlotSubscriber } from '../../templating/controller.projection';
export declare class AuSlot implements ICustomElementViewModel, IAuSlot {
    static readonly $au: CustomElementStaticAuDefinition;
    readonly view: ISyntheticView;
    /**
     * The binding context that will be exposed to slotted content
     */
    expose: object | null;
    /**
     * A callback that will be called when the content of this slot changed
     */
    slotchange: ((name: string, nodes: readonly Node[]) => void) | null;
    constructor();
    readonly name: string;
    get nodes(): ChildNode[];
    subscribe(subscriber: IAuSlotSubscriber): void;
    unsubscribe(subscriber: IAuSlotSubscriber): void;
    binding(_initiator: IHydratedController, parent: IHydratedParentController): void | Promise<void>;
    attaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    exposeChanged(v: object): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=au-slot.d.ts.map