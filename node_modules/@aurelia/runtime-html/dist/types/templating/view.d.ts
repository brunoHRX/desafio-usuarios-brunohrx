import { type IContainer } from '@aurelia/kernel';
import { CustomElementDefinition } from '../resources/custom-element';
import type { ICustomAttributeController, ICustomElementController, ISyntheticView } from './controller';
export interface IViewFactory {
    name: string;
    readonly container: IContainer;
    def: CustomElementDefinition;
    isCaching: boolean;
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(_controller: ISyntheticView): boolean;
    tryReturnToCache(controller: ISyntheticView): boolean;
    create(parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined): ISyntheticView;
}
export declare const IViewFactory: import("@aurelia/kernel").InterfaceSymbol<IViewFactory>;
export declare class ViewFactory implements IViewFactory {
    static maxCacheSize: number;
    name: string;
    readonly container: IContainer;
    def: CustomElementDefinition;
    isCaching: boolean;
    constructor(container: IContainer, def: CustomElementDefinition);
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(_controller: ISyntheticView): boolean;
    tryReturnToCache(controller: ISyntheticView): boolean;
    create(parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined): ISyntheticView;
}
//# sourceMappingURL=view.d.ts.map