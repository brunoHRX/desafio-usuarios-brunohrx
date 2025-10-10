import type { ICollectionObserver, ICollectionSubscriberCollection } from './interfaces';
export interface MapObserver extends ICollectionObserver<'map'>, ICollectionSubscriberCollection {
}
export declare const getMapObserver: (map: Map<unknown, unknown>) => MapObserver;
//# sourceMappingURL=map-observer.d.ts.map