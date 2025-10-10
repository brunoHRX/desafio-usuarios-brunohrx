import { IContainer, InterfaceSymbol, type IContainerConfiguration, type IResolver, type Key, type Resolved } from './di';
import type { IAllResolver, IFactoryResolver, ILazyResolver, INewInstanceResolver, IOptionalResolver, IResolvedFactory, IResolvedLazy } from './di.resolvers';
export declare const registrableMetadataKey: unique symbol;
export declare const DefaultResolver: {
    none(key: Key): IResolver;
    singleton: (key: Key) => IResolver;
    transient: (key: Key) => IResolver;
};
export declare class ContainerConfiguration implements IContainerConfiguration {
    readonly inheritParentResources: boolean;
    readonly defaultResolver: (key: Key, handler: IContainer) => IResolver;
    static readonly DEFAULT: ContainerConfiguration;
    private constructor();
    static from(config?: IContainerConfiguration): ContainerConfiguration;
}
export type IResolvedInjection<K extends Key> = K extends IAllResolver<infer R> ? Resolved<R>[] : K extends INewInstanceResolver<infer R> ? Resolved<R> : K extends ILazyResolver<infer R> ? IResolvedLazy<R> : K extends IOptionalResolver<infer R> ? Resolved<R> | undefined : K extends IFactoryResolver<infer R> ? IResolvedFactory<R> : K extends IResolver<infer R> ? Resolved<R> : K extends [infer R1 extends Key, ...infer R2] ? [IResolvedInjection<R1>, ...IResolvedInjection<R2>] : K extends InterfaceSymbol<infer T> ? T : Resolved<K>;
/**
 * Retrieve the resolved value of a key, or values of a list of keys from the currently active container.
 *
 * Calling this without an active container will result in an error.
 */
export declare function resolve<K extends Key>(key: K): IResolvedInjection<K>;
export declare function resolve<K extends Key[]>(...keys: K): IResolvedInjection<K>;
//# sourceMappingURL=di.container.d.ts.map