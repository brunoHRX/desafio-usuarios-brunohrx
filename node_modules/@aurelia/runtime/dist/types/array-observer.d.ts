import { type ISubscriberCollection, type ICollectionSubscriberCollection, type IObserver, type ICollectionObserver } from './interfaces';
export interface ArrayObserver extends ICollectionObserver<'array'>, ICollectionSubscriberCollection {
    getIndexObserver(index: number): ArrayIndexObserver;
}
export interface ArrayIndexObserver extends IObserver, ISubscriberCollection {
    readonly owner: ICollectionObserver<'array'>;
}
export declare const getArrayObserver: (array: unknown[]) => ArrayObserver;
//# sourceMappingURL=array-observer.d.ts.map