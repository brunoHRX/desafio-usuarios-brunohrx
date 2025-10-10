import { CustomAttributeStaticAuDefinition } from '../custom-attribute';
import type { ControllerVisitor, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, ISyntheticView } from '../../templating/controller';
export type PortalTarget = string | Element | null | undefined;
export type PortalLifecycleCallback = (target: PortalTarget, view: ISyntheticView) => void | Promise<void>;
export declare class Portal implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition<keyof Pick<Portal, 'target' | 'position' | 'renderContext' | 'strict' | 'deactivating' | 'deactivated' | 'activated' | 'activating' | 'callbackContext'>>;
    readonly $controller: ICustomAttributeController<this>;
    target: PortalTarget;
    position: InsertPosition;
    renderContext: PortalTarget;
    strict: boolean;
    deactivating?: PortalLifecycleCallback;
    activating?: PortalLifecycleCallback;
    deactivated?: PortalLifecycleCallback;
    activated?: PortalLifecycleCallback;
    callbackContext: unknown;
    view: ISyntheticView;
    constructor();
    attaching(initiator: IHydratedController): void | Promise<void>;
    detaching(initiator: IHydratedController): void | Promise<void>;
    targetChanged(): void;
    positionChanged(): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=portal.d.ts.map