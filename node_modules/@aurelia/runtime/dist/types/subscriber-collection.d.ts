import type { ICollectionSubscriber, ISubscriber } from './interfaces';
import { Constructable } from '@aurelia/kernel';
export type IAnySubscriber = ISubscriber | ICollectionSubscriber;
export declare const subscriberCollection: {
    (): <T extends Constructable>(value: T, context: ClassDecoratorContext) => T;
    <T extends Constructable>(target: T, context: ClassDecoratorContext): T;
};
//# sourceMappingURL=subscriber-collection.d.ts.map