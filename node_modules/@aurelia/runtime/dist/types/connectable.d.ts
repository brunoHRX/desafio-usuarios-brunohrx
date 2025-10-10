import { type Constructable } from '@aurelia/kernel';
import type { IConnectable, ISubscribable, ISubscriber, ICollectionSubscriber, ICollectionSubscribable } from './interfaces';
import type { IObserverLocator } from './observer-locator';
export interface IObserverLocatorBasedConnectable extends IConnectable, ISubscriber, ICollectionSubscriber {
    oL: IObserverLocator;
    /**
     * A record storing observers that are currently subscribed to by this binding
     */
    obs: IObserverRecord;
}
export interface IObserverRecord {
    version: number;
    count: number;
    add(observer: ISubscribable | ICollectionSubscribable): void;
    clear(): void;
    clearAll(): void;
}
export type DecoratedConnectable<T extends Partial<IConnectable>> = Constructable<T & IConnectable & ISubscriber & ICollectionSubscriber>;
declare const connectableDecorator: <T extends Partial<IConnectable>, C extends Constructable<T>>(target: C, context: ClassDecoratorContext<C>) => DecoratedConnectable<T>;
export declare function connectable(): typeof connectableDecorator;
export declare function connectable<T extends Partial<IConnectable>, C extends Constructable<T>>(target: C, context: ClassDecoratorContext<C>): DecoratedConnectable<T>;
export {};
//# sourceMappingURL=connectable.d.ts.map