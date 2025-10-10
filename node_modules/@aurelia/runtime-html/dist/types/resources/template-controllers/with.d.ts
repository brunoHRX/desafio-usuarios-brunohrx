import { CustomAttributeStaticAuDefinition } from '../custom-attribute';
import type { ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller';
export declare class With implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    readonly $controller: ICustomAttributeController<this>;
    value?: object;
    private view;
    valueChanged(newValue: unknown, _oldValue: unknown): void;
    attaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=with.d.ts.map