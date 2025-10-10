/**
 * Mode of a binding to operate
 * - 1 / one time - bindings should only update the target once
 * - 2 / to view - bindings should update the target and observe the source for changes to update again
 * - 3 / from view - bindings should update the source and observe the target for changes to update again
 * - 6 / two way - bindings should observe both target and source for changes to update the other side
 * - 0 / default - undecided mode, bindings, depends on the circumstance, may decide what to do accordingly
 */
export declare const BindingMode: Readonly<{
    /**
     * Unspecified mode, bindings may act differently with this mode
     */
    readonly default: 0;
    readonly oneTime: 1;
    readonly toView: 2;
    readonly fromView: 4;
    readonly twoWay: 6;
}>;
export type BindingMode = typeof BindingMode[keyof typeof BindingMode];
//# sourceMappingURL=binding-mode.d.ts.map