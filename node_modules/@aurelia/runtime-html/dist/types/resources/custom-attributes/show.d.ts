import { type CustomAttributeStaticAuDefinition } from '../custom-attribute';
import type { ICustomAttributeViewModel } from '../../templating/controller';
export declare class Show implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    value: unknown;
    private readonly el;
    private readonly p;
    constructor();
    binding(): void;
    detaching(): void;
    valueChanged(): void;
    private $val;
    private $prio;
    private readonly update;
}
//# sourceMappingURL=show.d.ts.map