import { Constructable, Overwrite } from './interfaces';
import { MaybePromise } from './utilities';
/**
 * Efficiently determine whether the provided property key is numeric
 * (and thus could be an array indexer) or not.
 *
 * Always returns true for values of type `'number'`.
 *
 * Otherwise, only returns true for strings that consist only of positive integers.
 *
 * Results are cached.
 */
export declare const isArrayIndex: (value: unknown) => value is number | string;
/**
 * Efficiently convert a string to camelCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert DOM attribute names to ViewModel property names.
 *
 * Results are cached.
 */
export declare const camelCase: (input: string) => string;
/**
 * Efficiently convert a string to PascalCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert element names to class names for synthetic types.
 *
 * Results are cached.
 */
export declare const pascalCase: (input: string) => string;
/**
 * Efficiently convert a string to kebab-case.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert ViewModel property names to DOM attribute names.
 *
 * Results are cached.
 */
export declare const kebabCase: (input: string) => string;
/**
 * Efficiently (up to 10x faster than `Array.from`) convert an `ArrayLike` to a real array.
 *
 * Primarily used by Aurelia to convert DOM node lists to arrays.
 */
export declare const toArray: <T = unknown>(input: ArrayLike<T>) => T[];
/**
 * Decorator. Bind the method to the class instance.
 */
export declare const bound: <TThis extends object, TArgs extends unknown[], TReturn>(originalMethod: (this: TThis, ...args: TArgs) => TReturn, context: ClassMethodDecoratorContext<TThis, (this: TThis, ...args: TArgs) => TReturn>) => void;
export declare const mergeArrays: <T>(...arrays: (readonly T[] | undefined)[]) => T[];
export declare const firstDefined: <T>(...values: readonly (T | undefined)[]) => T;
/**
 * Get the prototypes of a class hierarchy. Es6 classes have their parent class as prototype
 * so this will return a list of constructors
 *
 * @example
 * ```ts
 * class A {}
 * class B extends A {}
 *
 * assert.deepStrictEqual(getPrototypeChain(A), [A])
 * assert.deepStrictEqual(getPrototypeChain(B), [B, A])
 * ```
 */
export declare const getPrototypeChain: <T extends Constructable>(Type: T) => readonly [T, ...Constructable[]];
export declare function toLookup<T1 extends {}>(obj1: T1): T1;
export declare function toLookup<T1 extends {}, T2 extends {}>(obj1: T1, obj2: T2): Overwrite<T1, T2>;
export declare function toLookup<T1 extends {}, T2 extends {}, T3 extends {}>(obj1: T1, obj2: T2, obj3: T3): Overwrite<T1, Overwrite<T1, T2>>;
export declare function toLookup<T1 extends {}, T2 extends {}, T3 extends {}, T4 extends {}>(obj1: T1, obj2: T2, obj3: T3, obj4: T4): Readonly<T1 & T2 & T3 & T4>;
export declare function toLookup<T1 extends {}, T2 extends {}, T3 extends {}, T4 extends {}, T5 extends {}>(obj1: T1, obj2: T2, obj3: T3, obj4: T4, obj5: T5): Readonly<T1 & T2 & T3 & T4 & T5>;
/**
 * Determine whether the value is a native function.
 *
 * @param fn - The function to check.
 * @returns `true` is the function is a native function, otherwise `false`
 */
export declare const isNativeFunction: (fn: Function) => boolean;
/**
 * Normalize a potential promise via a callback, to ensure things stay synchronous when they can.
 *
 * If the value is a promise, it is `then`ed before the callback is invoked. Otherwise the callback is invoked synchronously.
 */
export declare const onResolve: {
    <TValue, TRet>(maybePromise: Promise<TValue>, resolveCallback: (value: TValue) => MaybePromise<TRet>): Promise<TRet>;
    <TValue, TRet>(maybePromise: TValue extends Promise<unknown> ? never : TValue, resolveCallback: (value: TValue) => TRet): TRet extends Promise<infer R> ? Promise<R> : TRet;
    <TValue, TRet>(maybePromise: MaybePromise<TValue>, resolveCallback: (value: TValue) => MaybePromise<TRet>): MaybePromise<TRet>;
};
/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
export declare const onResolveAll: (...maybePromises: unknown[]) => void | Promise<void>;
//# sourceMappingURL=functions.d.ts.map