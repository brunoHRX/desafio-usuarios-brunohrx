import { type Constructable, type IContainer } from '@aurelia/kernel';
import { IResourceKind } from './resources/resources-shared';
export declare function alias(...aliases: readonly string[]): (target: Constructable, context: ClassDecoratorContext) => void;
export declare function registerAliases(aliases: readonly string[], resource: IResourceKind, key: string, container: IContainer): void;
//# sourceMappingURL=utilities-di.d.ts.map