import { type Constructable } from '@aurelia/kernel';
import { IHydratedController } from '../../templating/controller';
/**
 * An optional interface describing the dynamic composition activate convention.
 */
export interface IDynamicComponentActivate<T> {
    /**
     * Implement this hook if you want to perform custom logic just before the component is is composed.
     * The returned value is not used.
     */
    activate?(model?: T): unknown;
}
type ChangeSource = keyof Pick<AuCompose, 'template' | 'component' | 'model' | 'scopeBehavior' | 'composing' | 'composition' | 'tag'>;
export declare class AuCompose {
    template?: string | Promise<string>;
    /**
     * Determine the component instance used to compose the component.
     *
     * - When a string is given as a value, it will be used as the name of the custom element to compose.
     * If there is no locally or globally registered custom element with that name, an error will be thrown.
     *
     * - When an object is given as a value, the object will be used as the component instance.
     * - When a constructor is given as a value, the constructor will be used to create the component instance.
     * - When a null/undefined is given as a value, the component will be composed as a template-only composition with an empty component instance.
     * - When a promise is given as a value, the promise will be awaited and the resolved value will be used as the value.
     */
    component?: string | Constructable | object | Promise<string | Constructable | object>;
    model?: unknown;
    /**
     * Control scoping behavior of the view created by the au-compose.
     * This only affects template-only composition. Does not have effects on custom element composition.
     *
     * auto = inherit parent scope
     * scoped = do not inherit parent scope
     */
    scopeBehavior: 'auto' | 'scoped';
    get composing(): Promise<void> | void;
    get composition(): ICompositionController | undefined;
    /**
     * The tag name of the element to be created for non custom element composition.
     *
     * `null`/`undefined` means containerless
     */
    tag: string | null | undefined;
    attaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void>;
    detaching(initiator: IHydratedController): void | Promise<void>;
}
export interface ICompositionController {
    readonly controller: IHydratedController;
    readonly context: CompositionContext;
    activate(initiator?: IHydratedController): void | Promise<void>;
    deactivate(detachInitator?: IHydratedController): void | Promise<void>;
    update(model: unknown): unknown;
}
declare class LoadedChangeInfo {
    readonly _template: string | undefined;
    readonly _component: string | Constructable | object | undefined;
    readonly _model: unknown;
    readonly _src: ChangeSource | undefined;
    constructor(_template: string | undefined, _component: string | Constructable | object | undefined, _model: unknown, _src: ChangeSource | undefined);
}
declare class CompositionContext {
    readonly id: number;
    readonly change: LoadedChangeInfo;
    constructor(id: number, change: LoadedChangeInfo);
}
export {};
//# sourceMappingURL=au-compose.d.ts.map