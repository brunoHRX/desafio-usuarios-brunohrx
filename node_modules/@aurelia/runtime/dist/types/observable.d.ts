import { type Constructable } from '@aurelia/kernel';
import type { InterceptorFunc } from './interfaces';
export interface IObservableDefinition {
    name?: PropertyKey;
    callback?: PropertyKey;
    set?: InterceptorFunc;
}
type FieldInitializer<TFThis, TValue> = (this: TFThis, initialValue: TValue) => TValue;
type ObservableFieldDecorator<TFThis, TValue> = (target: undefined, context: ClassFieldDecoratorContext<TFThis, TValue>) => FieldInitializer<TFThis, TValue>;
type ObservableClassDecorator<TCThis extends Constructable> = (target: TCThis, context: ClassDecoratorContext<TCThis>) => void;
export declare const observable: {
    <TFThis, TValue>(target: undefined, context: ClassFieldDecoratorContext<TFThis, TValue>): FieldInitializer<TFThis, TValue>;
    <TCThis extends Constructable, TFThis, TValue>(config: IObservableDefinition): (target: TCThis | undefined, context: ClassDecoratorContext<TCThis> | ClassFieldDecoratorContext<TFThis, TValue>) => FieldInitializer<TFThis, TValue> | void;
    <TCThis extends Constructable>(key: PropertyKey): ObservableClassDecorator<TCThis>;
    <TFThis, TValue>(): ObservableFieldDecorator<TFThis, TValue>;
};
export {};
//# sourceMappingURL=observable.d.ts.map