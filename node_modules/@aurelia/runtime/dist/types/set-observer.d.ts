import { type ICollectionObserver, type ICollectionSubscriberCollection } from './interfaces';
export interface SetObserver extends ICollectionObserver<'set'>, ICollectionSubscriberCollection {
}
export declare const getSetObserver: (set: Set<unknown>) => SetObserver;
//# sourceMappingURL=set-observer.d.ts.map